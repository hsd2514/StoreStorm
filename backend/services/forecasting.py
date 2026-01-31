"""
Demand Forecasting Service
AI-powered demand prediction and inventory recommendations
"""
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict

from services.ai_service import AIService
from config.appwrite import tables_db, DATABASE_ID


FORECAST_PROMPT = """You are an AI inventory analyst for a local grocery store in India.
Analyze this sales data and provide demand forecasting.

SALES DATA (Last 30 days):
{sales_data}

CURRENT INVENTORY:
{inventory_data}

Provide predictions for the next 7 days. Consider:
- Day of week patterns (weekends may have higher sales)
- Product popularity trends
- Seasonal factors for Indian market
- Festival proximity if applicable

Respond with JSON:
```json
{
  "predictions": [
    {
      "product_id": "id",
      "product_name": "name",
      "current_stock": 50,
      "predicted_demand_7d": 35,
      "confidence": 0.85,
      "reorder_recommended": true,
      "reorder_quantity": 40,
      "insight": "High weekend demand expected"
    }
  ],
  "overall_insights": [
    "Rice and Oil show consistent daily demand",
    "Consider stocking extra sugar for upcoming festival"
  ],
  "risk_items": ["Product names that may run out"]
}
```
"""


async def get_order_history(shop_id: str, days: int = 30) -> List[Dict]:
    """Fetch order history for analysis"""
    try:
        # Get all orders
        result = tables_db.list_rows(DATABASE_ID, "orders")
        all_orders = result.get("rows", [])
        
        # Filter by shop and date
        cutoff_date = datetime.now() - timedelta(days=days)
        shop_orders = []
        
        for order in all_orders:
            if order.get("shop_id") != shop_id:
                continue
            
            # Parse order date
            created_at = order.get("$createdAt") or order.get("created_at")
            if created_at:
                try:
                    if isinstance(created_at, str):
                        order_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    else:
                        order_date = created_at
                    
                    if order_date.replace(tzinfo=None) >= cutoff_date:
                        shop_orders.append(order)
                except:
                    shop_orders.append(order)  # Include if date parsing fails
            else:
                shop_orders.append(order)
        
        return shop_orders
    except Exception as e:
        print(f"Error fetching order history: {e}")
        return []


async def get_shop_products(shop_id: str) -> List[Dict]:
    """Fetch current inventory"""
    try:
        result = tables_db.list_rows(DATABASE_ID, "products")
        all_products = result.get("rows", [])
        return [p for p in all_products if p.get("shop_id") == shop_id]
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []


def aggregate_sales_data(orders: List[Dict]) -> Dict[str, Dict]:
    """Aggregate sales by product"""
    product_sales = defaultdict(lambda: {
        "total_quantity": 0,
        "total_revenue": 0,
        "order_count": 0,
        "daily_sales": defaultdict(float)
    })
    
    for order in orders:
        try:
            items_str = order.get("items", "[]")
            items = json.loads(items_str) if isinstance(items_str, str) else items_str
            
            order_date = order.get("$createdAt", "")[:10]  # Get date part
            
            for item in items:
                product_name = item.get("product_name", "Unknown")
                quantity = float(item.get("quantity", 0))
                total = float(item.get("total", 0))
                
                product_sales[product_name]["total_quantity"] += quantity
                product_sales[product_name]["total_revenue"] += total
                product_sales[product_name]["order_count"] += 1
                product_sales[product_name]["daily_sales"][order_date] += quantity
        except Exception as e:
            print(f"Error processing order: {e}")
            continue
    
    return dict(product_sales)


def calculate_simple_forecast(
    sales_data: Dict[str, Dict],
    products: List[Dict],
    forecast_days: int = 7
) -> List[Dict]:
    """Calculate simple rule-based forecast"""
    forecasts = []
    
    for product in products:
        product_name = product.get("name", "")
        product_id = product.get("$id") or product.get("id")
        current_stock = product.get("quantity", 0) or 50  # Default stock if not tracked
        min_stock = product.get("low_stock_threshold", 10) or 10
        
        # Get sales data for this product
        sales = sales_data.get(product_name, {})
        total_quantity = sales.get("total_quantity", 0)
        order_count = sales.get("order_count", 0)
        
        # Calculate average daily sales (assume 30 day history)
        avg_daily_sales = total_quantity / 30 if total_quantity > 0 else 0.5
        
        # Predict demand for next 7 days
        predicted_demand = avg_daily_sales * forecast_days
        
        # Add weekend boost (20% more)
        predicted_demand *= 1.1
        
        # Calculate if reorder is needed
        stock_after_forecast = current_stock - predicted_demand
        reorder_recommended = stock_after_forecast < min_stock
        
        # Calculate reorder quantity (cover next 2 weeks + safety stock)
        reorder_quantity = max(0, (avg_daily_sales * 14) - stock_after_forecast + min_stock)
        
        # Confidence based on data availability
        confidence = min(0.9, 0.5 + (order_count * 0.05))
        
        forecasts.append({
            "product_id": product_id,
            "product_name": product_name,
            "current_stock": current_stock,
            "avg_daily_sales": round(avg_daily_sales, 2),
            "predicted_demand_7d": round(predicted_demand, 1),
            "confidence": round(confidence, 2),
            "reorder_recommended": reorder_recommended,
            "reorder_quantity": round(reorder_quantity, 0),
            "days_until_stockout": round(current_stock / avg_daily_sales, 1) if avg_daily_sales > 0 else 999,
            "insight": "High demand" if avg_daily_sales > 2 else "Normal demand"
        })
    
    # Sort by urgency (days until stockout)
    forecasts.sort(key=lambda x: x["days_until_stockout"])
    
    return forecasts


async def generate_ai_forecast(
    shop_id: str,
    sales_data: Dict[str, Dict],
    products: List[Dict]
) -> Dict[str, Any]:
    """Generate AI-powered forecast with insights"""
    ai = AIService()
    
    # Prepare data for AI
    sales_summary = []
    for product_name, data in sales_data.items():
        sales_summary.append({
            "product": product_name,
            "total_sold": data["total_quantity"],
            "orders": data["order_count"],
            "avg_daily": round(data["total_quantity"] / 30, 2)
        })
    
    inventory_summary = []
    for product in products:
        inventory_summary.append({
            "id": product.get("$id") or product.get("id"),
            "name": product.get("name"),
            "price": product.get("price"),
            "stock": product.get("quantity", 50)
        })
    
    prompt = FORECAST_PROMPT.format(
        sales_data=json.dumps(sales_summary, indent=2),
        inventory_data=json.dumps(inventory_summary, indent=2)
    )
    
    try:
        response = await ai.generate(prompt, temperature=0.3)
        
        # Better JSON extraction using regex
        import re
        
        # Try to find JSON object in response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            json_str = json_match.group()
            forecast_data = json.loads(json_str)
            return forecast_data
        else:
            print(f"No JSON found in AI response: {response[:200]}...")
            return {
                "predictions": [],
                "overall_insights": ["AI insights processing..."],
                "risk_items": []
            }
        
    except json.JSONDecodeError as e:
        print(f"AI forecast JSON error: {e}")
        return {
            "predictions": [],
            "overall_insights": ["AI analysis unavailable - JSON parse error"],
            "risk_items": []
        }
    except Exception as e:
        print(f"AI forecast error: {e}")
        return {
            "predictions": [],
            "overall_insights": ["AI analysis unavailable"],
            "risk_items": []
        }


async def get_demand_forecast(shop_id: str, use_ai: bool = True) -> Dict[str, Any]:
    """
    Main forecasting function.
    Returns demand predictions and recommendations.
    """
    print(f"\n📊 Generating forecast for shop: {shop_id}")
    
    # Fetch data
    orders = await get_order_history(shop_id, days=30)
    products = await get_shop_products(shop_id)
    
    print(f"   Orders analyzed: {len(orders)}")
    print(f"   Products tracked: {len(products)}")
    
    # Aggregate sales
    sales_data = aggregate_sales_data(orders)
    
    # Calculate simple forecast
    simple_forecast = calculate_simple_forecast(sales_data, products)
    
    # Get AI insights if enabled
    ai_insights = {"overall_insights": [], "risk_items": []}
    if use_ai and sales_data:
        ai_insights = await generate_ai_forecast(shop_id, sales_data, products)
    
    # Build response
    result = {
        "shop_id": shop_id,
        "generated_at": datetime.now().isoformat(),
        "forecast_period_days": 7,
        "data_period_days": 30,
        "orders_analyzed": len(orders),
        "products_tracked": len(products),
        "predictions": simple_forecast,
        "insights": ai_insights.get("overall_insights", []),
        "risk_items": [p["product_name"] for p in simple_forecast if p["days_until_stockout"] < 7],
        "summary": {
            "items_need_reorder": len([p for p in simple_forecast if p["reorder_recommended"]]),
            "items_critical": len([p for p in simple_forecast if p["days_until_stockout"] < 3]),
            "total_reorder_value": sum(
                p["reorder_quantity"] * next(
                    (prod.get("price", 0) for prod in products if prod.get("name") == p["product_name"]),
                    0
                )
                for p in simple_forecast if p["reorder_recommended"]
            )
        }
    }
    
    return result
