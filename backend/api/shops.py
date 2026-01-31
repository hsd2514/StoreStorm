"""
API Router for Shop endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import tables_db, DATABASE_ID
from models.shop import Shop

router = APIRouter(prefix="/shops", tags=["Shops"])


@router.get("/", response_model=dict)
async def list_shops(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    owner_id: Optional[str] = None
):
    """List all shops with optional filtering"""
    print(f"📡 API: list_shops called with owner_id={owner_id}")
    try:
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if owner_id:
            queries.append(Query.equal("owner_id", owner_id))
        
        result = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="shops",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "shops": [Shop(**doc) for doc in result['rows']]
        }
    except Exception as e:
        print(f"❌ Error in list_shops: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{shop_id}", response_model=Shop)
async def get_shop(shop_id: str):
    """Get a single shop by ID"""
    try:
        shop = tables_db.get_row(
            database_id=DATABASE_ID,
            table_id="shops",
            row_id=shop_id
        )
        return Shop(**shop)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Shop {shop_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Shop, status_code=201)
async def create_shop(shop_data: Shop):
    """Create a new shop"""
    try:
        from appwrite.id import ID
        
        data = shop_data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        
        shop = tables_db.create_row(
            database_id=DATABASE_ID,
            table_id="shops",
            row_id=ID.unique(),
            data=data
        )
        return Shop(**shop)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{shop_id}", response_model=Shop)
async def update_shop(shop_id: str, shop_data: dict):
    """Update a shop"""
    try:
        shop = tables_db.update_row(
            database_id=DATABASE_ID,
            table_id="shops",
            row_id=shop_id,
            data=shop_data
        )
        return Shop(**shop)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Shop {shop_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{shop_id}", status_code=204)
async def delete_shop(shop_id: str):
    """Delete a shop"""
    try:
        tables_db.delete_row(
            database_id=DATABASE_ID,
            table_id="shops",
            row_id=shop_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Shop {shop_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
