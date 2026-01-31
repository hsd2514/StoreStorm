"""
AI Service using FastRouter API with Gemini 2.0 Flash Lite
"""
from openai import OpenAI
from config.settings import settings
import json
from typing import Dict, List, Any

# Initialize FastRouter client
client = OpenAI(
    base_url="https://go.fastrouter.ai/api/v1",
    api_key=settings.FASTROUTER_API_KEY,
)

MODEL = "google/gemini-2.0-flash-lite-001"


class AIService:
    """Wrapper class for AI service functions"""
    
    def __init__(self):
        self.client = client
        self.model = MODEL
    
    async def generate(self, prompt: str, temperature: float = 0.5) -> str:
        """Generate AI response for a prompt"""
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"AI Generate Error: {e}")
            return ""


def get_inventory_insights(inventory_data: List[Dict], order_data: List[Dict]) -> Dict[str, Any]:
    """Generate AI insights for inventory management"""
    
    # Prepare context
    low_stock = [item for item in inventory_data if item.get('current_stock', 0) < item.get('min_stock', 0)]
    recent_orders_count = len([o for o in order_data if o.get('status') in ['confirmed', 'preparing']])
    
    prompt = f"""You are an AI inventory assistant for a local shop. Analyze this data and provide actionable insights:

LOW STOCK ITEMS ({len(low_stock)}):
{json.dumps(low_stock[:5], indent=2) if low_stock else "None"}

TOTAL INVENTORY ITEMS: {len(inventory_data)}
RECENT PENDING ORDERS: {recent_orders_count}

Provide:
1. One critical alert (if any low stock items)
2. One smart insight about demand/trends
3. One actionable recommendation

Format as JSON:
{{
  "alert": "Brief urgent message or null",
  "insight": "One trend observation",
  "recommendation": "One specific action to take"
}}

Keep each message under 100 characters. Be specific and actionable."""

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content
        # Extract JSON from response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        insights = json.loads(response_text)
        return insights
        
    except Exception as e:
        print(f"AI Insights Error: {e}")
        return {
            "alert": None,
            "insight": "AI analysis in progress...",
            "recommendation": "Review inventory levels regularly"
        }


def parse_order_text(text: str, available_products: List[Dict]) -> Dict[str, Any]:
    """Parse natural language order into structured format"""
    
    product_list = "\n".join([f"- {p['name']} (₹{p['price']}/{p['unit']})" for p in available_products[:20]])
    
    prompt = f"""You are an order parser for a local shop. Parse this customer message into a structured order:

CUSTOMER MESSAGE:
"{text}"

AVAILABLE PRODUCTS:
{product_list}

Extract:
1. Items with quantities (match to available products)
2. Delivery address (if mentioned)
3. Customer name (if mentioned)
4. Any special notes

Return JSON:
{{
  "items": [
    {{"product_name": "exact name from list", "quantity": number, "unit": "kg/pcs/L"}},
  ],
  "customer_name": "name or null",
  "delivery_address": "address or null",
  "notes": "any special requests or null"
}}

Only include products that exist in the available list. If quantity is unclear, use 1."""

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        response_text = completion.choices[0].message.content
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        parsed = json.loads(response_text)
        return parsed
        
    except Exception as e:
        print(f"Order Parse Error: {e}")
        return {
            "items": [],
            "customer_name": None,
            "delivery_address": None,
            "notes": "Failed to parse order. Please enter manually.",
            "error": str(e)
        }


def categorize_product_gst(product_name: str, category: str = None) -> Dict[str, Any]:
    """Auto-categorize product for GST"""
    
    prompt = f"""You are a GST compliance assistant for India. Categorize this product:

PRODUCT: {product_name}
CATEGORY: {category or "Unknown"}

Determine:
1. GST rate (0%, 5%, 12%, 18%, or 28%)
2. HSN code (if standard item)
3. Brief explanation

Return JSON:
{{
  "gst_rate": number,
  "hsn_code": "code or null",
  "category": "Food/Grocery/Dairy/etc",
  "explanation": "Why this rate applies (under 50 words)"
}}

Use standard India GST rates. Food grains are 0-5%, processed foods 12-18%."""

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        response_text = completion.choices[0].message.content
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        print(f"GST Categorization Error: {e}")
        return {
            "gst_rate": 18,  # Default to 18%
            "hsn_code": None,
            "category": category or "General",
            "explanation": "Default GST rate applied"
        }


def optimize_delivery_route(orders: List[Dict], shop_location: Dict) -> Dict[str, Any]:
    """Optimize delivery route and provide instructions"""
    
    addresses = [{"order_id": o['order_number'], "address": o['delivery_address']} for o in orders]
    
    prompt = f"""You are a delivery route optimizer. Given these delivery addresses, suggest the optimal route:

SHOP LOCATION: {shop_location.get('address', 'Shop')}

DELIVERIES:
{json.dumps(addresses, indent=2)}

Provide:
1. Suggested delivery sequence (by order_id)
2. Estimated total distance in km
3. Route optimization insight

Return JSON:
{{
  "sequence": ["order_id1", "order_id2", ...],
  "estimated_distance_km": number,
  "insight": "Brief explanation of the route logic"
}}"""

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )
        
        response_text = completion.choices[0].message.content
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        print(f"Route Optimization Error: {e}")
        return {
            "sequence": [o['order_number'] for o in orders],
            "estimated_distance_km": len(orders) * 2,
            "insight": "Sequential delivery route"
        }
