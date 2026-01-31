"""
API Router for Customer endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID
from models.customer import Customer

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/", response_model=dict)
async def list_customers(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    shop_id: Optional[str] = None,
    phone: Optional[str] = None
):
    """List customers with filtering"""
    try:
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if shop_id:
            queries.append(Query.equal("shop_id", shop_id))
        if phone:
            queries.append(Query.equal("phone", phone))
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="customers",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "customers": [Customer(**doc) for doc in result['documents']]
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    """Get a single customer by ID"""
    try:
        customer = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="customers",
            document_id=customer_id
        )
        return Customer(**customer)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Customer, status_code=201)
async def create_customer(customer_data: Customer):
    """Create a new customer"""
    try:
        from appwrite.id import ID
        
        data = customer_data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        
        customer = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="customers",
            document_id=ID.unique(),
            data=data
        )
        return Customer(**customer)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: dict):
    """Update a customer"""
    try:
        customer = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="customers",
            document_id=customer_id,
            data=customer_data
        )
        return Customer(**customer)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: str):
    """Delete a customer"""
    try:
        databases.delete_document(
            database_id=DATABASE_ID,
            collection_id="customers",
            document_id=customer_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
