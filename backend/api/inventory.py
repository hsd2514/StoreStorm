"""
API Router for Inventory endpoints
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID

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
        queries = []
        if shop_id:
            queries.append(f'shop_id="{shop_id}"')
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="inventory",
            queries=queries
        )
        
        # Filter low stock items if requested
        items = result['documents']
        if low_stock:
            items = [
                item for item in items 
                if item.get('stock_quantity', 0) <= item.get('min_stock_level', 0)
            ]
        
        return {
            "total": len(items) if low_stock else result['total'],
            "inventory": items
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{inventory_id}", response_model=dict)
async def get_inventory_item(inventory_id: str):
    """Get a single inventory item by ID"""
    try:
        item = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="inventory",
            document_id=inventory_id
        )
        return item
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Inventory {inventory_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, status_code=201)
async def create_inventory_item(inventory_data: dict):
    """Create a new inventory item"""
    try:
        from appwrite.id import ID
        
        item = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="inventory",
            document_id=ID.unique(),
            data=inventory_data
        )
        return item
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{inventory_id}", response_model=dict)
async def update_inventory_item(inventory_id: str, inventory_data: dict):
    """Update an inventory item"""
    try:
        item = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="inventory",
            document_id=inventory_id,
            data=inventory_data
        )
        return item
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Inventory {inventory_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{inventory_id}", status_code=204)
async def delete_inventory_item(inventory_id: str):
    """Delete an inventory item"""
    try:
        databases.delete_document(
            database_id=DATABASE_ID,
            collection_id="inventory",
            document_id=inventory_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Inventory {inventory_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
