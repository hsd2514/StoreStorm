"""
Menu Validator - Match parsed items against shop inventory
Uses fuzzy matching + AI disambiguation
"""
import json
from typing import List, Tuple, Optional
from difflib import SequenceMatcher

from models.channel_order import ParsedOrderItem
from services.ai_service import AIService
from services.order_prompts import MATCH_MENU_PROMPT
from config.appwrite import tables_db, DATABASE_ID


# Common product aliases (Hindi/Hinglish → English)
PRODUCT_ALIASES = {
    # Grains
    "chawal": "rice",
    "basmati": "rice",
    "atta": "wheat flour",
    "gehu": "wheat",
    "maida": "refined flour",
    "besan": "gram flour",
    "suji": "semolina",
    "rava": "semolina",
    "poha": "flattened rice",
    "daliya": "broken wheat",
    
    # Pulses
    "dal": "lentils",
    "chana": "chickpeas",
    "rajma": "kidney beans",
    "moong": "green gram",
    "urad": "black gram",
    "masoor": "red lentils",
    "toor": "pigeon peas",
    "arhar": "pigeon peas",
    
    # Oils
    "tel": "oil",
    "sarso": "mustard oil",
    "sunflower": "sunflower oil",
    "groundnut": "groundnut oil",
    "mungfali": "groundnut oil",
    "refined": "refined oil",
    
    # Dairy
    "doodh": "milk",
    "dahi": "curd",
    "paneer": "cottage cheese",
    "ghee": "clarified butter",
    "makhan": "butter",
    
    # Spices
    "namak": "salt",
    "cheeni": "sugar",
    "shakkar": "sugar",
    "mirch": "chili",
    "haldi": "turmeric",
    "jeera": "cumin",
    "dhania": "coriander",
    
    # Vegetables
    "aloo": "potato",
    "pyaz": "onion",
    "tamatar": "tomato",
    "baingan": "eggplant",
    "bhindi": "okra",
    "gobhi": "cauliflower",
    "palak": "spinach",
    "matar": "peas",
}


def normalize_product_name(name: str) -> str:
    """Normalize product name using aliases"""
    name_lower = name.lower().strip()
    
    # Check direct alias
    if name_lower in PRODUCT_ALIASES:
        return PRODUCT_ALIASES[name_lower]
    
    # Check if alias is part of the name
    for alias, canonical in PRODUCT_ALIASES.items():
        if alias in name_lower:
            return name_lower.replace(alias, canonical)
    
    return name_lower


def fuzzy_match_score(s1: str, s2: str) -> float:
    """Calculate similarity score between two strings"""
    s1 = s1.lower().strip()
    s2 = s2.lower().strip()
    
    # Exact match
    if s1 == s2:
        return 1.0
    
    # One contains the other
    if s1 in s2 or s2 in s1:
        return 0.9
    
    # Sequence matching
    return SequenceMatcher(None, s1, s2).ratio()


async def get_shop_inventory(shop_id: str) -> List[dict]:
    """Fetch all products for a shop"""
    try:
        # Fetch all products (Appwrite query syntax varies by SDK version)
        result = tables_db.list_rows(DATABASE_ID, "products")
        all_products = result.get("rows", [])
        
        # Filter by shop_id in Python (more reliable than query)
        shop_products = [p for p in all_products if p.get("shop_id") == shop_id]
        
        print(f"📊 Found {len(shop_products)} products for shop {shop_id}")
        return shop_products
    except Exception as e:
        print(f"Error fetching inventory: {e}")
        return []


async def match_item_to_inventory(
    item: ParsedOrderItem,
    inventory: List[dict],
    threshold: float = 0.6
) -> ParsedOrderItem:
    """
    Match a single parsed item against inventory.
    Returns updated item with match information.
    """
    normalized_name = normalize_product_name(item.product_name)
    
    best_match = None
    best_score = 0.0
    
    for product in inventory:
        product_name = product.get("name", "")
        
        # Calculate match score
        score = fuzzy_match_score(normalized_name, product_name)
        
        # Also check against category
        category = product.get("category", "")
        category_score = fuzzy_match_score(normalized_name, category)
        
        # Use the better score
        final_score = max(score, category_score * 0.8)
        
        if final_score > best_score:
            best_score = final_score
            best_match = product
    
    # Apply match if above threshold
    if best_match and best_score >= threshold:
        item.matched = True
        item.product_id = best_match.get("$id") or best_match.get("id")
        item.matched_name = best_match.get("name")
        item.price = best_match.get("price", 0)
        item.confidence = best_score
    else:
        item.matched = False
        item.confidence = best_score
    
    return item


async def validate_items_against_menu(
    items: List[ParsedOrderItem],
    shop_id: str
) -> Tuple[List[ParsedOrderItem], List[ParsedOrderItem]]:
    """
    Validate all items against shop's menu.
    Returns: (matched_items, unmatched_items)
    """
    inventory = await get_shop_inventory(shop_id)
    
    if not inventory:
        # No inventory = all items unmatched
        return [], items
    
    matched = []
    unmatched = []
    
    for item in items:
        validated = await match_item_to_inventory(item, inventory)
        
        if validated.matched:
            matched.append(validated)
        else:
            unmatched.append(validated)
    
    return matched, unmatched


async def ai_match_items(
    items: List[ParsedOrderItem],
    shop_id: str,
    ai_service: Optional[AIService] = None
) -> List[ParsedOrderItem]:
    """
    Use AI to match items when fuzzy matching fails.
    More expensive but more accurate.
    """
    if not ai_service:
        ai_service = AIService()
    
    # Get inventory
    inventory = await get_shop_inventory(shop_id)
    if not inventory:
        return items
    
    # Prepare inventory JSON (simplified)
    inventory_simple = [
        {"id": p.get("$id") or p.get("id"), "name": p.get("name"), "price": p.get("price")}
        for p in inventory
    ]
    
    # Prepare items JSON
    items_simple = [
        {"product": item.product_name, "quantity": item.quantity, "unit": item.unit}
        for item in items
    ]
    
    # Call AI
    prompt = MATCH_MENU_PROMPT.format(
        inventory_json=json.dumps(inventory_simple, indent=2),
        items_json=json.dumps(items_simple, indent=2)
    )
    
    try:
        response = await ai_service.generate(prompt)
        matches = json.loads(response)
        
        # Update items with AI matches
        for i, match in enumerate(matches):
            if i < len(items) and match.get("matched"):
                items[i].matched = True
                items[i].product_id = match.get("matched_id")
                items[i].matched_name = match.get("matched_name")
                items[i].price = match.get("price")
                items[i].confidence = match.get("confidence", 0.8)
        
        return items
        
    except Exception as e:
        print(f"AI matching failed: {e}")
        # Fall back to fuzzy matching
        matched, unmatched = await validate_items_against_menu(items, shop_id)
        return matched + unmatched


def calculate_order_total(items: List[ParsedOrderItem]) -> float:
    """Calculate total amount for matched items"""
    total = 0.0
    for item in items:
        if item.matched and item.price:
            total += item.price * item.quantity
    return total


def format_items_summary(items: List[ParsedOrderItem], language: str = "hi") -> str:
    """Format items into a readable summary for voice/text"""
    if not items:
        return "No items" if language == "en" else "Koi item nahi"
    
    parts = []
    for item in items:
        if item.matched:
            name = item.matched_name or item.product_name
            qty = int(item.quantity) if item.quantity == int(item.quantity) else item.quantity
            unit = item.unit
            parts.append(f"{qty} {unit} {name}")
    
    if language == "hi":
        return ", ".join(parts[:-1]) + f" aur {parts[-1]}" if len(parts) > 1 else parts[0] if parts else ""
    else:
        return ", ".join(parts[:-1]) + f" and {parts[-1]}" if len(parts) > 1 else parts[0] if parts else ""
