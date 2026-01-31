"""
API Router for Product endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from appwrite.exception import AppwriteException

from config.appwrite import databases, DATABASE_ID
from models.product import Product

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=dict)
async def list_products(
    limit: int = Query(default=25, le=100),
    offset: int = Query(default=0, ge=0),
    shop_id: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """List products with filtering"""
    try:
        from appwrite.query import Query
        queries = [
            Query.limit(limit),
            Query.offset(offset)
        ]
        
        if shop_id:
            queries.append(Query.equal("shop_id", shop_id))
        if category:
            queries.append(Query.equal("category", category))
        if is_active is not None:
            queries.append(Query.equal("is_active", is_active))
        
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="products",
            queries=queries
        )
        
        return {
            "total": result['total'],
            "products": [Product(**doc) for doc in result['documents']]
        }
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    try:
        product = databases.get_document(
            database_id=DATABASE_ID,
            collection_id="products",
            document_id=product_id
        )
        return Product(**product)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=Product, status_code=201)
async def create_product(product_data: Product):
    """Create a new product"""
    try:
        from appwrite.id import ID
        
        # Exclude ID and timestamps for creation
        data = product_data.model_dump(by_alias=True, exclude={"id", "created_at", "updated_at"})
        
        product = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="products",
            document_id=ID.unique(),
            data=data
        )
        return Product(**product)
    except AppwriteException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: dict):
    """Update a product"""
    try:
        product = databases.update_document(
            database_id=DATABASE_ID,
            collection_id="products",
            document_id=product_id,
            data=product_data
        )
        return Product(**product)
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: str):
    """Delete a product"""
    try:
        databases.delete_document(
            database_id=DATABASE_ID,
            collection_id="products",
            document_id=product_id
        )
        return None
    except AppwriteException as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
        raise HTTPException(status_code=500, detail=str(e))
