"""
API Router for Inventory endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import tables_db, DATABASE_ID
from models.inventory import Inventory

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", response_model=dict)
async def list_inventory(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    shop_id: Optional[str] = None,
    low_stock: bool = False
):
    """List inventory items with optional low stock filter"""
    try:
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if shop_id:
            queries.append(Query.equal("shop_id", shop_id))
        
        result = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="inventory",
            queries=queries
        )
        
        # Filter low stock items if requested
        items = [Inventory(**doc) for doc in result['rows']]
        if low_stock:
            items = [
                item for item in items 
                if item.stock_quantity <= item.min_stock_level
            ]
        
        return {
            "total": len(items) if low_stock else result['total'],
            "inventory": items
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{inventory_id}", response_model=Inventory)
async def get_inventory_item(inventory_id: str):
    """Get a single inventory item by ID"""
    try:
        item = tables_db.get_row(
            database_id=DATABASE_ID,
            table_id="inventory",
            row_id=inventory_id
        )
        return Inventory(**item)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Inventory {inventory_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Inventory, status_code=201)
async def create_inventory_item(inventory_data: Inventory):
    """Create a new inventory item"""
    try:
        from appwrite.id import ID
        
        data = inventory_data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        
        item = tables_db.create_row(
            database_id=DATABASE_ID,
            table_id="inventory",
            row_id=ID.unique(),
            data=data
        )
        return Inventory(**item)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{inventory_id}", response_model=Inventory)
async def update_inventory_item(inventory_id: str, inventory_data: dict):
    """Update an inventory item"""
    try:
        item = tables_db.update_row(
            database_id=DATABASE_ID,
            table_id="inventory",
            row_id=inventory_id,
            data=inventory_data
        )
        return Inventory(**item)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Inventory {inventory_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{inventory_id}", status_code=204)
async def delete_inventory_item(inventory_id: str):
    """Delete an inventory item"""
    try:
        tables_db.delete_row(
            database_id=DATABASE_ID,
            table_id="inventory",
            row_id=inventory_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Inventory {inventory_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
