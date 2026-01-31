"""
API Router for Shop endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID
from models.shop import Shop

router = APIRouter(prefix="/shops", tags=["Shops"])


@router.get("/", response_model=dict)
async def list_shops(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    owner_id: Optional[str] = None
):
    """List all shops with optional filtering"""
    try:
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if owner_id:
            queries.append(Query.equal("owner_id", owner_id))
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="shops",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "shops": [Shop(**doc) for doc in result['documents']]
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{shop_id}", response_model=Shop)
async def get_shop(shop_id: str):
    """Get a single shop by ID"""
    try:
        shop = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="shops",
            document_id=shop_id
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
        
        shop = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="shops",
            document_id=ID.unique(),
            data=data
        )
        return Shop(**shop)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{shop_id}", response_model=Shop)
async def update_shop(shop_id: str, shop_data: dict):
    """Update a shop"""
    try:
        shop = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="shops",
            document_id=shop_id,
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
        databases.delete_document(
            database_id=DATABASE_ID,
            collection_id="shops",
            document_id=shop_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Shop {shop_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
