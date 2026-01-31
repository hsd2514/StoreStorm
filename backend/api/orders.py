"""
API Router for Order endpoints
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=dict)
async def list_orders(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    shop_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    source: Optional[str] = None
):
    """List orders with filtering"""
    try:
        queries = []
        if shop_id:
            queries.append(f'shop_id="{shop_id}"')
        if customer_id:
            queries.append(f'customer_id="{customer_id}"')
        if status:
            queries.append(f'status="{status}"')
        if source:
            queries.append(f'source="{source}"')
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="orders",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "orders": result['documents']
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}", response_model=dict)
async def get_order(order_id: str):
    """Get a single order by ID"""
    try:
        order = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="orders",
            document_id=order_id
        )
        return order
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, status_code=201)
async def create_order(order_data: dict):
    """Create a new order"""
    try:
        from appwrite.id import ID
        
        order = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="orders",
            document_id=ID.unique(),
            data=order_data
        )
        return order
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{order_id}", response_model=dict)
async def update_order(order_id: str, order_data: dict):
    """Update an order"""
    try:
        order = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="orders",
            document_id=order_id,
            data=order_data
        )
        return order
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{order_id}/status", response_model=dict)
async def update_order_status(order_id: str, status: str):
    """Update order status (pending → confirmed → preparing → out_for_delivery → delivered)"""
    try:
        valid_statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        order = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="orders",
            document_id=order_id,
            data={"status": status}
        )
        return order
    except HTTPException:
        raise
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: str):
    """Delete an order"""
    try:
        databases.delete_document(
            database_id=DATABASE_ID,
            collection_id="orders",
            document_id=order_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
