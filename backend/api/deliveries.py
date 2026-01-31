"""
API Router for Delivery endpoints
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID

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
        queries = []
        if shop_id:
            queries.append(f'shop_id="{shop_id}"')
        if status:
            queries.append(f'status="{status}"')
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "deliveries": result['documents']
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{delivery_id}", response_model=dict)
async def get_delivery(delivery_id: str):
    """Get a single delivery batch by ID"""
    try:
        delivery = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id
        )
        return delivery
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, status_code=201)
async def create_delivery_batch(delivery_data: dict):
    """Create a new delivery batch"""
    try:
        from appwrite.id import ID
        
        delivery = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=ID.unique(),
            data=delivery_data
        )
        return delivery
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}", response_model=dict)
async def update_delivery(delivery_id: str, delivery_data: dict):
    """Update a delivery batch"""
    try:
        delivery = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=delivery_id,
            data=delivery_data
        )
        return delivery
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}/start", response_model=dict)
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
        return delivery
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{delivery_id}/complete", response_model=dict)
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
        return delivery
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
