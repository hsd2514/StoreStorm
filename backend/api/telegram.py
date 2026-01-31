"""
Telegram Bot Webhook Router
Handles incoming messages for text-based ordering
"""
import json
import httpx
from typing import Optional
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from models.channel_order import (
    TelegramUpdate, ChannelSession, ParsedOrderItem,
    OrderChannel, IntakeState
)
from services.menu_validator import (
    validate_items_against_menu, calculate_order_total, format_items_summary
)
from services.ai_service import AIService
from services.order_prompts import EXTRACT_ITEMS_PROMPT
from config.appwrite import tables_db, DATABASE_ID
from config.settings import settings
from appwrite.id import ID

router = APIRouter(prefix="/telegram", tags=["Telegram Bot"])

# In-memory session cache (for demo; production should use Redis/Appwrite)
telegram_sessions: dict[int, ChannelSession] = {}

# Default shop for demo
DEFAULT_SHOP_ID = "697e104b00190c0dc4c2"
DEFAULT_SHOP_NAME = "Storm Mart"

# Telegram API base URL
TELEGRAM_API = "https://api.telegram.org/bot{token}"

# Vision prompt for parsing images
IMAGE_ORDER_PROMPT = """You are an AI assistant for a grocery store in India.
Analyze this shopping list image and extract the items.

For each item found, identify:
- Product name (normalize to common names like rice, oil, sugar, dal)
- Quantity (number)
- Unit (kg, liter, pcs, g, ml)

Respond ONLY with a JSON array:
```json
[
  {"raw": "original text", "product": "product name", "quantity": 2, "unit": "kg"},
  ...
]
```

If you cannot read the image or find no items, return:
```json
{"error": "Could not parse image"}
```
"""


async def get_telegram_file_url(file_id: str) -> Optional[str]:
    """Get the download URL for a Telegram file"""
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not token:
        return None
    
    async with httpx.AsyncClient() as client:
        # Get file path from Telegram
        response = await client.get(
            f"{TELEGRAM_API.format(token=token)}/getFile",
            params={"file_id": file_id}
        )
        data = response.json()
        
        if data.get("ok") and data.get("result", {}).get("file_path"):
            file_path = data["result"]["file_path"]
            return f"https://api.telegram.org/file/bot{token}/{file_path}"
    return None


async def download_telegram_image(file_url: str) -> Optional[bytes]:
    """Download image bytes from Telegram"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(file_url)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"Error downloading image: {e}")
            return None


async def parse_image_to_items(image_bytes: bytes) -> list[ParsedOrderItem]:
    """Use AI Vision to parse image into order items"""
    import base64
    from openai import OpenAI
    
    # Encode image to base64
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
    
    # Use FastRouter with vision model
    client = OpenAI(
        base_url="https://go.fastrouter.ai/api/v1",
        api_key=settings.FASTROUTER_API_KEY,
    )
    
    try:
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-lite-001",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": IMAGE_ORDER_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_b64}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.3
        )
        
        result_text = response.choices[0].message.content
        
        # Extract JSON
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0]
        
        data = json.loads(result_text.strip())
        
        if isinstance(data, dict) and "error" in data:
            print(f"Vision AI error: {data['error']}")
            return []
        
        items = []
        for item_data in data:
            items.append(ParsedOrderItem(
                raw_text=item_data.get("raw", ""),
                product_name=item_data.get("product", ""),
                quantity=float(item_data.get("quantity", 1)),
                unit=item_data.get("unit", "pcs")
            ))
        return items
        
    except Exception as e:
        print(f"Vision parsing error: {e}")
        return []


async def handle_photo_message(chat_id: int, user_id: int, photo: list):
    """Process a photo message - parse shopping list from image"""
    session = await get_or_create_session(user_id)
    
    print("\n" + "="*60)
    print(f"📸 TELEGRAM PHOTO RECEIVED")
    print(f"   From User: {user_id}")
    print(f"   Photo sizes: {len(photo)}")
    print("="*60)
    
    # Get the largest photo (best quality)
    largest_photo = max(photo, key=lambda p: p.get("file_size", 0))
    file_id = largest_photo.get("file_id")
    
    if not file_id:
        await send_telegram_message(chat_id, "❌ Could not process the image.")
        return
    
    # Send processing message
    await send_telegram_message(chat_id, "🔍 Analyzing your shopping list image...")
    
    # Get file URL and download
    print(f"📥 Downloading image...")
    file_url = await get_telegram_file_url(file_id)
    if not file_url:
        await send_telegram_message(chat_id, "❌ Could not download the image.")
        return
    
    image_bytes = await download_telegram_image(file_url)
    if not image_bytes:
        await send_telegram_message(chat_id, "❌ Could not download the image.")
        return
    
    print(f"🧠 AI VISION PARSING...")
    # Parse image with AI
    parsed_items = await parse_image_to_items(image_bytes)
    
    if not parsed_items:
        print("❌ No items found in image")
        await send_telegram_message(
            chat_id,
            "🤔 I couldn't find any items in that image.\n"
            "Please send a clear photo of your shopping list, or type your order."
        )
        return
    
    print(f"📦 PARSED FROM IMAGE:")
    for item in parsed_items:
        print(f"   • {item.quantity} {item.unit} {item.product_name}")
    
    # Validate against menu
    print(f"🔎 Matching against inventory...")
    matched, unmatched = await validate_items_against_menu(parsed_items, session.shop_id)
    
    # Add matched items to session
    session.items.extend(matched)
    
    if matched:
        print(f"✅ MATCHED ITEMS:")
        for item in matched:
            print(f"   • {item.quantity} {item.unit} {item.matched_name} @ ₹{item.price}")
    
    # Build response
    response_text = "📸 <b>Items found in image:</b>\n\n"
    
    if matched:
        response_text += "✅ <b>Added to cart:</b>\n"
        for item in matched:
            response_text += f"  • {item.quantity} {item.unit} {item.matched_name} - ₹{item.price * item.quantity:.0f}\n"
    
    if unmatched:
        response_text += "\n⚠️ <b>Not found in store:</b>\n"
        for item in unmatched:
            response_text += f"  • {item.product_name}\n"
    
    if session.items:
        total = calculate_order_total(session.items)
        response_text += f"\n💰 <b>Cart Total: ₹{total:.0f}</b>"
        
        await send_telegram_message(
            chat_id,
            response_text,
            reply_markup=get_add_more_keyboard()
        )
    else:
        await send_telegram_message(chat_id, response_text)


async def send_telegram_message(
    chat_id: int,
    text: str,
    reply_markup: Optional[dict] = None
):
    """Send a message to Telegram chat"""
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not token:
        print("⚠️ TELEGRAM_BOT_TOKEN not configured")
        return
    
    url = f"{TELEGRAM_API.format(token=token)}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    
    if reply_markup:
        payload["reply_markup"] = json.dumps(reply_markup)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
        except Exception as e:
            print(f"Telegram send error: {e}")


def get_confirm_keyboard() -> dict:
    """Inline keyboard for order confirmation"""
    return {
        "inline_keyboard": [
            [
                {"text": "✅ Confirm Order", "callback_data": "confirm_order"},
                {"text": "❌ Cancel", "callback_data": "cancel_order"}
            ]
        ]
    }


def get_add_more_keyboard() -> dict:
    """Inline keyboard for adding more items"""
    return {
        "inline_keyboard": [
            [
                {"text": "➕ Add More Items", "callback_data": "add_more"},
                {"text": "✅ That's All", "callback_data": "done_adding"}
            ]
        ]
    }


async def get_or_create_session(user_id: int) -> ChannelSession:
    """Get existing session or create new one"""
    if user_id in telegram_sessions:
        return telegram_sessions[user_id]
    
    session = ChannelSession(
        user_id=str(user_id),
        shop_id=DEFAULT_SHOP_ID,
        channel=OrderChannel.TELEGRAM,
        state=IntakeState.GREETING
    )
    telegram_sessions[user_id] = session
    return session


async def parse_text_to_items(text: str) -> list[ParsedOrderItem]:
    """Use AI to parse text into order items"""
    ai = AIService()
    prompt = EXTRACT_ITEMS_PROMPT.format(user_input=text)
    
    try:
        response = await ai.generate(prompt)
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0]
        
        data = json.loads(response)
        
        if isinstance(data, dict) and "error" in data:
            return []
        
        items = []
        for item_data in data:
            items.append(ParsedOrderItem(
                raw_text=item_data.get("raw", ""),
                product_name=item_data.get("product", ""),
                quantity=float(item_data.get("quantity", 1)),
                unit=item_data.get("unit", "pcs")
            ))
        return items
        
    except Exception as e:
        print(f"Text parsing error: {e}")
        return []


async def handle_text_message(chat_id: int, user_id: int, text: str):
    """Process a text message from user"""
    session = await get_or_create_session(user_id)
    
    # Handle /start command
    if text.startswith("/start"):
        print(f"\n" + "="*60)
        print(f"🤖 TELEGRAM: New session started")
        print(f"   User ID: {user_id}")
        print(f"   Shop: {DEFAULT_SHOP_NAME}")
        print("="*60)
        
        session.state = IntakeState.COLLECTING_ITEMS
        session.items = []
        await send_telegram_message(
            chat_id,
            f"🛒 <b>Welcome to {DEFAULT_SHOP_NAME}!</b>\n\n"
            f"Tell me what you'd like to order.\n"
            f"Example: <i>2 kg rice and 1 liter oil</i>\n\n"
            f"Type /cancel to cancel anytime."
        )
        return
    
    # Handle /cancel command
    if text.startswith("/cancel"):
        session.state = IntakeState.CANCELLED
        if user_id in telegram_sessions:
            del telegram_sessions[user_id]
        await send_telegram_message(chat_id, "❌ Order cancelled. Send /start to begin a new order.")
        return
    
    # Handle /status command
    if text.startswith("/status"):
        if session.items:
            total = calculate_order_total(session.items)
            summary = format_items_for_telegram(session.items)
            await send_telegram_message(
                chat_id,
                f"📦 <b>Current Order:</b>\n{summary}\n\n💰 <b>Total: ₹{total:.0f}</b>"
            )
        else:
            await send_telegram_message(chat_id, "🛒 Your cart is empty. Tell me what you'd like to order!")
        return
    
    # Store raw input
    session.raw_inputs.append(text)
    
    print("\n" + "-"*60)
    print(f"💬 TELEGRAM MESSAGE")
    print(f"   From User: {user_id}")
    print(f"   Text: '{text}'")
    print("-"*60)
    
    # Parse text into items
    print(f"🔍 AI PARSING ORDER...")
    parsed_items = await parse_text_to_items(text)
    
    if not parsed_items:
        print("❌ Could not parse any items")
        await send_telegram_message(
            chat_id,
            "🤔 I couldn't understand that. Please tell me what you'd like to order.\n"
            "Example: <i>2 kg rice, 1 liter oil, 500g sugar</i>"
        )
        return
    
    print(f"📦 PARSED ITEMS:")
    for item in parsed_items:
        print(f"   • {item.quantity} {item.unit} {item.product_name}")
    
    # Validate against menu
    print(f"🔎 Matching against inventory...")
    matched, unmatched = await validate_items_against_menu(parsed_items, session.shop_id)
    
    # Add matched items to session
    session.items.extend(matched)
    
    if matched:
        print(f"✅ MATCHED ITEMS:")
        for item in matched:
            print(f"   • {item.quantity} {item.unit} {item.matched_name} @ ₹{item.price}")
    
    # Build response
    response_text = ""
    
    if matched:
        response_text += "✅ <b>Added to cart:</b>\n"
        for item in matched:
            response_text += f"  • {item.quantity} {item.unit} {item.matched_name} - ₹{item.price * item.quantity:.0f}\n"
    
    if unmatched:
        response_text += "\n⚠️ <b>Not found in store:</b>\n"
        for item in unmatched:
            response_text += f"  • {item.product_name}\n"
    
    if session.items:
        total = calculate_order_total(session.items)
        response_text += f"\n💰 <b>Cart Total: ₹{total:.0f}</b>"
        
        await send_telegram_message(
            chat_id,
            response_text,
            reply_markup=get_add_more_keyboard()
        )
    else:
        await send_telegram_message(chat_id, response_text)


async def handle_callback_query(chat_id: int, user_id: int, callback_data: str, message_id: int):
    """Handle inline button clicks"""
    session = telegram_sessions.get(user_id)
    
    if not session:
        await send_telegram_message(chat_id, "Session expired. Send /start to begin a new order.")
        return
    
    if callback_data == "add_more":
        session.state = IntakeState.COLLECTING_ITEMS
        await send_telegram_message(chat_id, "➕ Tell me what else you'd like to add:")
    
    elif callback_data == "done_adding":
        session.state = IntakeState.CONFIRMING
        total = calculate_order_total(session.items)
        summary = format_items_for_telegram(session.items)
        
        await send_telegram_message(
            chat_id,
            f"📦 <b>Order Summary:</b>\n{summary}\n\n💰 <b>Total: ₹{total:.0f}</b>\n\nConfirm your order?",
            reply_markup=get_confirm_keyboard()
        )
    
    elif callback_data == "confirm_order":
        # Create actual order
        try:
            order_number = f"TG-{user_id % 100000:05d}"
            
            print("\n" + "*"*60)
            print(f"🎉 TELEGRAM ORDER CONFIRMED!")
            print(f"   Order #: {order_number}")
            print(f"   User: {user_id}")
            print(f"   Items:")
            for item in session.items:
                if item.matched:
                    print(f"      • {item.quantity} {item.unit} {item.matched_name} - ₹{(item.price or 0) * item.quantity:.0f}")
            print(f"   Total: ₹{calculate_order_total(session.items):.0f}")
            print("*"*60)
            
            order_data = {
                "shop_id": session.shop_id,
                "customer_id": session.user_id,
                "order_number": order_number,
                "source": "telegram",
                "items": json.dumps([{
                    "product_id": item.product_id,
                    "product_name": item.matched_name or item.product_name,
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "price": item.price or 0,
                    "total": (item.price or 0) * item.quantity
                } for item in session.items if item.matched]),
                "total_amount": calculate_order_total(session.items),
                "gst_amount": 0,
                "status": "pending",
                "delivery_address": session.delivery_address or "To be confirmed via chat",
                "notes": f"Telegram order from user {user_id}"
            }
            
            import uuid
            unique_id = str(uuid.uuid4()).replace('-', '')[:20]
            result = tables_db.create_row(DATABASE_ID, "orders", unique_id, order_data)
            session.order_id = result.get("$id")
            session.state = IntakeState.COMPLETE
            
            print(f"💾 Order saved to database! ID: {session.order_id}")
            
            # Cleanup session
            del telegram_sessions[user_id]
            
            await send_telegram_message(
                chat_id,
                f"🎉 <b>Order Confirmed!</b>\n\n"
                f"📦 Order Number: <code>{order_number}</code>\n"
                f"💰 Total: ₹{calculate_order_total(session.items):.0f}\n\n"
                f"Your order will be delivered soon!\n"
                f"Send /start to place another order."
            )
            
        except Exception as e:
            print(f"Order creation failed: {e}")
            await send_telegram_message(
                chat_id,
                "❌ Sorry, there was an error creating your order. Please try again."
            )
    
    elif callback_data == "cancel_order":
        session.state = IntakeState.CANCELLED
        if user_id in telegram_sessions:
            del telegram_sessions[user_id]
        await send_telegram_message(chat_id, "❌ Order cancelled. Send /start to begin a new order.")


def format_items_for_telegram(items: list[ParsedOrderItem]) -> str:
    """Format items list for Telegram message"""
    lines = []
    for item in items:
        if item.matched:
            name = item.matched_name or item.product_name
            total = (item.price or 0) * item.quantity
            lines.append(f"  • {item.quantity} {item.unit} {name} — ₹{total:.0f}")
    return "\n".join(lines) if lines else "  (empty)"


@router.post("/webhook")
async def telegram_webhook(request: Request):
    """
    Main Telegram webhook endpoint.
    Configure this URL in Telegram BotFather.
    """
    try:
        data = await request.json()
        update = TelegramUpdate(**data)
        
        chat_id = update.chat_id
        user_id = update.user_id
        
        if not chat_id or not user_id:
            return {"ok": True}
        
        # Handle regular messages
        if update.message and update.text:
            await handle_text_message(chat_id, user_id, update.text)
        
        # Handle photo messages
        elif update.message and update.message.get("photo"):
            await handle_photo_message(chat_id, user_id, update.message["photo"])
        
        # Handle callback queries (button clicks)
        elif update.callback_query:
            callback_data = update.callback_query.get("data", "")
            message_id = update.callback_query.get("message", {}).get("message_id")
            await handle_callback_query(chat_id, user_id, callback_data, message_id)
        
        return {"ok": True}
        
    except Exception as e:
        print(f"Telegram webhook error: {e}")
        return {"ok": False, "error": str(e)}


@router.get("/set-webhook")
async def set_telegram_webhook(url: str):
    """
    Helper endpoint to set the Telegram webhook URL.
    Call with: /telegram/set-webhook?url=https://your-domain.com/telegram/webhook
    """
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    if not token:
        raise HTTPException(status_code=500, detail="TELEGRAM_BOT_TOKEN not configured")
    
    api_url = f"{TELEGRAM_API.format(token=token)}/setWebhook"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(api_url, json={"url": url})
        return response.json()
