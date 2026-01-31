"""
Order Prompts - AI prompt templates for parsing voice/text orders
Used with Gemini 2.0 Flash Lite via FastRouter
"""

# ============================================================================
# ITEM EXTRACTION PROMPT
# ============================================================================

EXTRACT_ITEMS_PROMPT = """You are an AI assistant for a grocery store in India.
Parse the customer's order request and extract individual items.

RULES:
1. Extract product name, quantity, and unit for each item
2. Common units: kg, g, liter, ml, pcs, dozen, packet, bottle
3. If no quantity specified, assume 1
4. If no unit specified, assume "pcs" (pieces)
5. Normalize Hindi/Hinglish to English product names
6. Handle common variations (chawal=rice, atta=flour, tel=oil)

CUSTOMER INPUT:
{user_input}

Respond with a JSON array of items:
```json
[
  {{"raw": "2 kg rice", "product": "rice", "quantity": 2, "unit": "kg"}},
  {{"raw": "1 liter oil", "product": "oil", "quantity": 1, "unit": "liter"}}
]
```

If input is unclear or not an order, respond:
```json
{{"error": "not_an_order", "message": "Could not understand the order"}}
```
"""


# ============================================================================
# MENU MATCHING PROMPT
# ============================================================================

MATCH_MENU_PROMPT = """You are matching customer-requested items to a store's actual inventory.

STORE INVENTORY:
{inventory_json}

CUSTOMER REQUESTED ITEMS:
{items_json}

For each requested item, find the best matching product from inventory.
Consider:
1. Exact name match (highest priority)
2. Partial name match (e.g., "basmati rice" matches "rice")
3. Category match (e.g., "cooking oil" matches "sunflower oil")
4. Common aliases (e.g., "atta" = "wheat flour")

Respond with JSON:
```json
[
  {{
    "requested": "rice",
    "matched_id": "product_id_here",
    "matched_name": "Basmati Rice Premium",
    "price": 120,
    "confidence": 0.95,
    "matched": true
  }},
  {{
    "requested": "olive oil",
    "matched_id": null,
    "matched_name": null,
    "price": null,
    "confidence": 0,
    "matched": false,
    "suggestion": "We have Sunflower Oil instead"
  }}
]
```
"""


# ============================================================================
# CONFIRMATION MESSAGE PROMPT
# ============================================================================

CONFIRM_ORDER_PROMPT = """Generate a natural, concise order summary for voice/text confirmation.

ORDER ITEMS:
{items_json}

TOTAL AMOUNT: ₹{total_amount}

LANGUAGE: {language}

Generate a brief, natural confirmation message suitable for:
- Voice: Keep under 100 words, easy to understand when spoken
- Text: Can include formatting, emojis

Respond with JSON:
```json
{{
  "voice_message": "Your order: 2 kg Basmati Rice and 1 liter Sunflower Oil. Total is 320 rupees.",
  "text_message": "📦 Your Order:\\n• 2 kg Basmati Rice - ₹240\\n• 1 L Sunflower Oil - ₹80\\n\\n💰 Total: ₹320"
}}
```
"""


# ============================================================================
# ADDRESS PARSING PROMPT
# ============================================================================

PARSE_ADDRESS_PROMPT = """Extract and structure the delivery address from speech/text.

RAW INPUT:
{user_input}

Extract:
1. House/Flat number
2. Street/Road name
3. Area/Locality
4. Landmark (if mentioned)
5. City (if mentioned, default to shop's city)
6. Pincode (if mentioned)

Respond with JSON:
```json
{{
  "structured": {{
    "house": "42",
    "street": "MG Road",
    "area": "Sector 15",
    "landmark": "Near SBI Bank",
    "city": "Noida",
    "pincode": "201301"
  }},
  "formatted": "42, MG Road, Sector 15, Near SBI Bank, Noida - 201301",
  "confidence": 0.85
}}
```

If address is unclear:
```json
{{
  "error": "incomplete",
  "missing": ["house", "area"],
  "partial": "Near SBI Bank, Noida"
}}
```
"""


# ============================================================================
# INTENT CLASSIFICATION PROMPT
# ============================================================================

CLASSIFY_INTENT_PROMPT = """Classify the customer's message intent for a grocery ordering bot.

MESSAGE:
{user_input}

CURRENT STATE: {current_state}

Possible intents:
- NEW_ORDER: Customer wants to place a new order
- ADD_ITEM: Customer wants to add more items to current order
- REMOVE_ITEM: Customer wants to remove an item
- CONFIRM: Customer confirms the order (yes, haan, ok, confirm)
- CANCEL: Customer wants to cancel (no, nahi, cancel, ruko)
- CHECK_STATUS: Customer asking about existing order status
- HELP: Customer needs assistance
- GOODBYE: Customer ending conversation
- UNCLEAR: Cannot determine intent

Respond with JSON:
```json
{{
  "intent": "ADD_ITEM",
  "confidence": 0.92,
  "entities": {{"item": "milk", "quantity": 2}},
  "requires_clarification": false
}}
```
"""


# ============================================================================
# ERROR RECOVERY PROMPT
# ============================================================================

ERROR_RECOVERY_PROMPT = """The customer's input was unclear. Generate a helpful clarification request.

ORIGINAL INPUT: {user_input}
CONTEXT: {context}
CHANNEL: {channel}  # voice or text

For voice: Keep response under 50 words, simple language
For text: Can be slightly longer, use formatting

Respond with JSON:
```json
{{
  "clarification_voice": "I didn't catch that. Could you please repeat what you'd like to order?",
  "clarification_text": "Sorry, I didn't understand. Could you please tell me:\\n• What items you want\\n• How much of each"
}}
```
"""
