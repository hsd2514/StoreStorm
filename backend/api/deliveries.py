"""
API Router for Delivery endpoints
"""
import math
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID
from models.delivery import Delivery, Crate, DeliveryStop, DeliveryPartner
from utils.routing import nearest_neighbor_route, calculate_total_distance, estimate_delivery_time

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


@router.get("/", response_model=dict)
async def list_deliveries(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    shop_id: Optional[str] = None,
    status: Optional[str] = None
):
    """List delivery batches with filtering"""
    try:
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if shop_id:
            queries.append(Query.equal("shop_id", shop_id))
        if status:
            queries.append(Query.equal("status", status))
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "deliveries": [Delivery(**doc) for doc in result['documents']]
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{delivery_id}", response_model=Delivery)
async def get_delivery(delivery_id: str):
    """Get a single delivery batch by ID"""
    try:
        delivery = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id
        )
        return Delivery(**delivery)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Delivery, status_code=201)
async def create_delivery_batch(delivery_data: Delivery):
    """Create a new delivery batch"""
    try:
        from appwrite.id import ID
        
        data = delivery_data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        
        delivery = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=ID.unique(),
            data=data
        )
        return Delivery(**delivery)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}", response_model=Delivery)
async def update_delivery(delivery_id: str, delivery_data: dict):
    """Update a delivery batch"""
    try:
        delivery = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id,
            data=delivery_data
        )
        return Delivery(**delivery)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}/start", response_model=Delivery)
async def start_delivery(delivery_id: str):
    """Start a delivery batch"""
    try:
        from datetime import datetime
        
        delivery = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id,
            data={
                "status": "in_progress",
                "started_at": datetime.utcnow().isoformat()
            }
        )
        return Delivery(**delivery)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}/complete", response_model=Delivery)
async def complete_delivery(delivery_id: str):
    """Complete a delivery batch"""
    try:
        from datetime import datetime
        
        delivery = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id,
            data={
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat()
            }
        )
        return Delivery(**delivery)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-route", response_model=Delivery, status_code=201)
async def create_route(
    shop_id: str,
    order_ids: List[str],
    crate_capacity: int = 10,
    delivery_partner: Optional[dict] = None
):
    """Create a new delivery route with crate-based batching"""
    try:
        from appwrite.id import ID
        from appwrite.query import Query as AppwriteQuery
        
        # Fetch orders to get customer addresses
        orders_result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="orders",
            queries=[
                AppwriteQuery.equal("$id", order_ids),
                AppwriteQuery.limit(len(order_ids))
            ]
        )
        
        orders = orders_result['documents']
        if not orders:
            raise HTTPException(status_code=400, detail="No valid orders found")
        
        # Get shop coordinates (hardcoded for demo - should fetch from shop record)
        shop_coords = (77.5946, 12.9716)  # Bangalore
        
        # Build delivery stops from orders
        stops = []
        for order in orders:
            # Mock coordinates based on delivery address hash
            # In production, use geocoding service
            lat_offset = (hash(order.get('delivery_address', '')) % 100) / 1000
            lon_offset = (hash(order['$id']) % 100) / 1000
            
            stops.append({
                'order_id': order['$id'],
                'customer_name': order.get('customer_id', 'Unknown'),
                'address': order.get('delivery_address', 'No address'),
                'latitude': shop_coords[1] + lat_offset,
                'longitude': shop_coords[0] + lon_offset,
            })
        
        # Calculate optimal route using nearest-neighbor
        ordered_stops = nearest_neighbor_route(shop_coords, stops)
        
        # Calculate total distance and time
        total_distance = calculate_total_distance(shop_coords, ordered_stops)
        estimated_time = estimate_delivery_time(total_distance, len(ordered_stops))
        
        # Create crates based on capacity
        num_crates = math.ceil(len(order_ids) / crate_capacity)
        crates = []
        for i in range(num_crates):
            start_idx = i * crate_capacity
            end_idx = min(start_idx + crate_capacity, len(order_ids))
            crates.append({
                'id': f'crate-{i+1}',
                'capacity': crate_capacity,
                'assigned_order_ids': order_ids[start_idx:end_idx]
            })
        
        # Create route geometry (simple polyline)
        route_coords = [shop_coords]
        for stop in ordered_stops:
            route_coords.append((stop['longitude'], stop['latitude']))
        
        route_geometry = {
            'type': 'LineString',
            'coordinates': route_coords
        }
        
        # Generate batch number
        from datetime import datetime
        batch_number = f"BATCH-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        
        # Create delivery record
        delivery_data = {
            'shop_id': shop_id,
            'batch_number': batch_number,
            'order_ids': order_ids,
            'crates': crates,
            'capacity_used': len(order_ids),
            'route_stops': ordered_stops,
            'route_geometry': route_geometry,
            'total_distance': total_distance,
            'status': 'planned',
            'estimated_time': estimated_time,
        }
        
        if delivery_partner:
            delivery_data['delivery_partner'] = delivery_partner
        
        delivery = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=ID.unique(),
            data=delivery_data
        )
        
        return Delivery(**delivery)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}/status", response_model=Delivery)
async def update_delivery_status(
    delivery_id: str,
    new_status: str,
    actor: str = "system"  # 'shop_owner', 'delivery_partner', 'system'
):
    """Update delivery status with permission validation"""
    
    # Status transition permissions
    ALLOWED_TRANSITIONS = {
        'planned': {'READY_FOR_PICKUP': ['shop_owner']},
        'READY_FOR_PICKUP': {'PICKED_UP': ['delivery_partner']},
        'PICKED_UP': {'IN_TRANSIT': ['system', 'delivery_partner']},
        'IN_TRANSIT': {'DELIVERED': ['delivery_partner']},
    }
    
    try:
        # Get current delivery
        delivery = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id
        )
        
        current_status = delivery.get('status')
        
        # Validate transition
        if current_status not in ALLOWED_TRANSITIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from terminal status {current_status}"
            )
        
        allowed_next = ALLOWED_TRANSITIONS[current_status]
        if new_status not in allowed_next:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid transition from {current_status} to {new_status}"
            )
        
        allowed_actors = allowed_next[new_status]
        if actor not in allowed_actors:
            raise HTTPException(
                status_code=403,
                detail=f"Actor '{actor}' not authorized to transition to {new_status}"
            )
        
        # Update status
        update_data = {'status': new_status}
        
        if new_status == 'PICKED_UP':
            from datetime import datetime
            update_data['started_at'] = datetime.utcnow().isoformat()
        elif new_status == 'DELIVERED':
            from datetime import datetime
            update_data['completed_at'] = datetime.utcnow().isoformat()
        
        updated = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id,
            data=update_data
        )
        
        return Delivery(**updated)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}/stops/{stop_sequence}", response_model=Delivery)
async def update_stop_status(delivery_id: str, stop_sequence: int):
    """Mark a stop as delivered and advance current pointer"""
    try:
        delivery = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id
        )
        
        route_stops = delivery.get('route_stops', [])
        
        # Find and update the stop
        for stop in route_stops:
            if stop['sequence'] == stop_sequence:
                stop['status'] = 'delivered'
            elif stop['sequence'] == stop_sequence + 1:
                stop['status'] = 'current'
        
        updated = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id,
            data={'route_stops': route_stops}
        )
        
        return Delivery(**updated)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{delivery_id}", status_code=204)
async def delete_delivery(delivery_id: str):
    """Delete a delivery batch"""
    try:
        databases.delete_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
