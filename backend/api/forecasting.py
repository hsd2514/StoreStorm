"""
Forecasting API Router
Demand prediction and inventory recommendations
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from services.forecasting import get_demand_forecast

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])


class ForecastResponse(BaseModel):
    shop_id: str
    generated_at: str
    forecast_period_days: int
    data_period_days: int
    orders_analyzed: int
    products_tracked: int
    predictions: list
    insights: list
    risk_items: list
    summary: dict


@router.get("/predict/{shop_id}")
async def get_forecast(
    shop_id: str,
    use_ai: bool = Query(True, description="Use AI for enhanced insights")
):
    """
    Get demand forecast for a shop.
    
    Returns:
    - Product-level demand predictions for next 7 days
    - Reorder recommendations
    - AI-powered insights
    - Risk items (products likely to run out)
    """
    print(f"\n🔮 FORECAST REQUEST")
    print(f"   Shop: {shop_id}")
    print(f"   AI Enabled: {use_ai}")
    
    try:
        forecast = await get_demand_forecast(shop_id, use_ai=use_ai)
        
        print(f"\n✅ Forecast generated!")
        print(f"   Products: {forecast['products_tracked']}")
        print(f"   Orders analyzed: {forecast['orders_analyzed']}")
        print(f"   Items need reorder: {forecast['summary']['items_need_reorder']}")
        
        return forecast
        
    except Exception as e:
        print(f"❌ Forecast error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quick-insights/{shop_id}")
async def get_quick_insights(shop_id: str):
    """
    Get quick AI insights without full forecast calculation.
    Faster response for dashboard widgets.
    """
    try:
        # Use rule-based forecast for reliability
        forecast = await get_demand_forecast(shop_id, use_ai=False)
        
        # Extract just the key insights
        critical_items = [p for p in forecast["predictions"] if p["days_until_stockout"] < 3]
        need_reorder = [p for p in forecast["predictions"] if p["reorder_recommended"]]
        
        return {
            "shop_id": shop_id,
            "generated_at": datetime.now().isoformat(),
            "alerts": [
                {
                    "type": "critical",
                    "message": f"{p['product_name']} will run out in {p['days_until_stockout']:.0f} days",
                    "product": p["product_name"],
                    "action": f"Reorder {p['reorder_quantity']:.0f} units"
                }
                for p in critical_items[:3]
            ],
            "recommendations": [
                {
                    "product": p["product_name"],
                    "current_stock": p["current_stock"],
                    "predicted_demand": p["predicted_demand_7d"],
                    "reorder_qty": p["reorder_quantity"]
                }
                for p in need_reorder[:5]
            ],
            "insights": forecast.get("insights", [])[:3],
            "summary": {
                "total_products": forecast["products_tracked"],
                "needs_attention": len(need_reorder),
                "critical": len(critical_items)
            }
        }
        
    except Exception as e:
        print(f"Quick insights error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends/{shop_id}/{product_name}")
async def get_product_trends(shop_id: str, product_name: str):
    """
    Get detailed trends for a specific product.
    """
    forecast = await get_demand_forecast(shop_id, use_ai=False)
    
    # Find the product
    product_forecast = next(
        (p for p in forecast["predictions"] if p["product_name"].lower() == product_name.lower()),
        None
    )
    
    if not product_forecast:
        raise HTTPException(status_code=404, detail=f"Product '{product_name}' not found")
    
    return {
        "product": product_name,
        "shop_id": shop_id,
        "forecast": product_forecast,
        "recommendation": (
            f"Reorder {product_forecast['reorder_quantity']:.0f} units within "
            f"{max(0, product_forecast['days_until_stockout'] - 2):.0f} days"
            if product_forecast["reorder_recommended"]
            else "Stock levels adequate for next 7 days"
        )
    }
