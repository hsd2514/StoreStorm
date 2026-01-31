"""
API Router for Order endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import tables_db, DATABASE_ID
from models.order import Order

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
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if shop_id:
            queries.append(Query.equal("shop_id", shop_id))
        if customer_id:
            queries.append(Query.equal("customer_id", customer_id))
        if status:
            queries.append(Query.equal("status", status))
        if source:
            queries.append(Query.equal("source", source))
        
        result = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="orders",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "orders": [Order(**doc) for doc in result['rows']]
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get a single order by ID"""
    try:
        order = tables_db.get_row(
            database_id=DATABASE_ID,
            table_id="orders",
            row_id=order_id
        )
        return Order(**order)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Order, status_code=201)
async def create_order(order_data: Order):
    """Create a new order"""
    try:
        from appwrite.id import ID
        
        # Exclude ID and timestamps for creation
        data = order_data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        
        order = tables_db.create_row(
            database_id=DATABASE_ID,
            table_id="orders",
            row_id=ID.unique(),
            data=data
        )
        return Order(**order)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{order_id}", response_model=Order)
async def update_order(order_id: str, order_data: dict):
    """Update an order"""
    try:
        order = tables_db.update_row(
            database_id=DATABASE_ID,
            table_id="orders",
            row_id=order_id,
            data=order_data
        )
        return Order(**order)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, status: str):
    """Update order status (pending → confirmed → preparing → out_for_delivery → delivered)"""
    try:
        valid_statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        order = tables_db.update_row(
            database_id=DATABASE_ID,
            table_id="orders",
            row_id=order_id,
            data={"status": status}
        )
        return Order(**order)
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
        tables_db.delete_row(
            database_id=DATABASE_ID,
            table_id="orders",
            row_id=order_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
