from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.ai_service import (
    get_inventory_insights,
    parse_order_text,
    categorize_product_gst,
    optimize_delivery_route
)
from config.appwrite import tables_db, DATABASE_ID
from appwrite.query import Query

router = APIRouter(prefix="/ai", tags=["AI"])


class InventoryInsightsRequest(BaseModel):
    shop_id: str


class OrderParseRequest(BaseModel):
    text: str
    shop_id: str


class GSTCategorizeRequest(BaseModel):
    product_name: str
    category: Optional[str] = None


class RouteOptimizeRequest(BaseModel):
    shop_id: str
    order_ids: List[str]


@router.post("/insights/inventory")
async def get_ai_inventory_insights(request: InventoryInsightsRequest):
    """Get AI-powered inventory insights"""
    try:
        # Fetch inventory
        inv_result = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="inventory",
            queries=[Query.equal("shop_id", request.shop_id)]
        )
        inventory = inv_result['rows']
        
        # Fetch orders
        orders_result = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="orders",
            queries=[Query.equal("shop_id", request.shop_id)]
        )
        orders = orders_result['rows']
        
        # Generate insights
        insights = get_inventory_insights(inventory, orders)
        
        return {
            "success": True,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse/order")
async def parse_order(request: OrderParseRequest):
    """Parse natural language order text into structured format"""
    try:
        # Get available products
        prod_result = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="products",
            queries=[Query.equal("shop_id", request.shop_id), Query.equal("is_active", True)]
        )
        products = prod_result['rows']
        
        # Parse order
        parsed_order = parse_order_text(request.text, products)
        
        return {
            "success": True,
            "parsed_order": parsed_order
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/categorize/gst")
async def categorize_gst(request: GSTCategorizeRequest):
    """Auto-categorize product for GST"""
    try:
        result = categorize_product_gst(request.product_name, request.category)
        
        return {
            "success": True,
            "gst_info": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize/route")
async def optimize_route(request: RouteOptimizeRequest):
    """Optimize delivery route for given orders"""
    try:
        # Fetch shop location
        shop = tables_db.get_row(
            database_id=DATABASE_ID,
            table_id="shops",
            row_id=request.shop_id
        )
        
        # Fetch orders
        orders = []
        for order_id in request.order_ids:
            try:
                order = tables_db.get_row(
                    database_id=DATABASE_ID,
                    table_id="orders",
                    row_id=order_id
                )
                orders.append(order)
            except:
                continue
        
        # Optimize route
        optimized = optimize_delivery_route(orders, shop)
        
        return {
            "success": True,
            "optimized_route": optimized
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
