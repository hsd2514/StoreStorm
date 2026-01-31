"""
Twilio Voice Webhook Router
Handles incoming phone calls for voice ordering
"""
import json
from typing import Optional
from fastapi import APIRouter, Form, Response, HTTPException
from fastapi.responses import PlainTextResponse

from models.channel_order import (
    VoiceWebhookPayload, ChannelSession, ParsedOrderItem,
    OrderChannel, IntakeState, OrderIntakeResponse
)
from utils.twiml_templates import (
    greeting_twiml, greeting_english_twiml,
    confirm_order_twiml, confirm_english_twiml,
    order_success_twiml, order_cancelled_twiml,
    error_twiml, unmatched_items_twiml, collect_address_twiml
)
from services.menu_validator import (
    validate_items_against_menu, calculate_order_total, format_items_summary
)
from services.ai_service import AIService
from services.order_prompts import EXTRACT_ITEMS_PROMPT
from config.appwrite import tables_db, DATABASE_ID
from appwrite.id import ID

router = APIRouter(prefix="/twilio", tags=["Twilio Voice"])

# In-memory session cache (for demo; production should use Redis/Appwrite)
voice_sessions: dict[str, ChannelSession] = {}

# Default shop for demo (in production, route based on Twilio number)
DEFAULT_SHOP_ID = "697e104b00190c0dc4c2"
DEFAULT_SHOP_NAME = "Storm Mart"


def twiml_response(content: str) -> Response:
    """Return TwiML as XML response"""
    return Response(content=content, media_type="application/xml")


async def get_or_create_session(call_sid: str, caller: str) -> ChannelSession:
    """Get existing session or create new one"""
    if call_sid in voice_sessions:
        return voice_sessions[call_sid]
    
    session = ChannelSession(
        user_id=caller,
        shop_id=DEFAULT_SHOP_ID,
        channel=OrderChannel.VOICE,
        state=IntakeState.GREETING
    )
    voice_sessions[call_sid] = session
    return session


async def parse_speech_to_items(speech: str) -> list[ParsedOrderItem]:
    """Use AI to parse speech into order items"""
    ai = AIService()
    prompt = EXTRACT_ITEMS_PROMPT.format(user_input=speech)
    
    try:
        response = await ai.generate(prompt)
        # Extract JSON from response
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
        print(f"Speech parsing error: {e}")
        return []


@router.post("/voice")
async def handle_incoming_call(
    CallSid: str = Form(...),
    From: str = Form(...),
    To: str = Form(...),
    CallStatus: str = Form(...)
):
    """
    Initial webhook when customer calls.
    Plays greeting and starts gathering order.
    """
    print("\n" + "="*60)
    print(f"📞 INCOMING CALL")
    print(f"   From: {From}")
    print(f"   SID:  {CallSid}")
    print(f"   Shop: {DEFAULT_SHOP_NAME}")
    print("="*60)
    
    # Create session
    session = await get_or_create_session(CallSid, From)
    session.state = IntakeState.COLLECTING_ITEMS
    
    print(f"🎙️  Playing greeting... Waiting for order...")
    
    # Return greeting TwiML
    return twiml_response(greeting_twiml(DEFAULT_SHOP_NAME))


@router.post("/gather")
async def handle_speech_input(
    CallSid: str = Form(...),
    From: str = Form(...),
    SpeechResult: Optional[str] = Form(None),
    Confidence: Optional[float] = Form(None),
    Digits: Optional[str] = Form(None)
):
    """
    Handle gathered speech/DTMF input.
    Parses order items and either confirms or asks for more.
    """
    print("\n" + "-"*60)
    print(f"🎤 SPEECH RECEIVED")
    print(f"   Text: '{SpeechResult}'")
    print(f"   Confidence: {Confidence}")
    print("-"*60)
    
    session = await get_or_create_session(CallSid, From)
    
    if not SpeechResult:
        print("⚠️  No speech detected, replaying greeting...")
        return twiml_response(greeting_twiml(DEFAULT_SHOP_NAME))
    
    # Store raw input
    session.raw_inputs.append(SpeechResult)
    
    # Check for "done" / "bas" / "that's all" - use word boundary check
    done_keywords = ["bas", "done", "that's all", "that is all", "thats it", "finish", "complete", "ho gaya", "khatam"]
    speech_words = SpeechResult.lower().split()
    is_done = any(kw in speech_words for kw in done_keywords) or SpeechResult.lower().strip() in done_keywords
    
    if is_done:
        if session.items:
            session.state = IntakeState.CONFIRMING
            total = calculate_order_total(session.items)
            summary = format_items_summary(session.items, "hi")
            print(f"✅ Customer finished ordering. Moving to confirmation...")
            return twiml_response(confirm_order_twiml(summary, total))
        else:
            print("⚠️  No items in cart yet!")
            return twiml_response(error_twiml("Aapne koi item nahi bataya. Kripya dubara order karein."))
    
    # Parse speech into items
    print(f"🔍 AI PARSING ORDER...")
    parsed_items = await parse_speech_to_items(SpeechResult)
    
    if not parsed_items:
        print("❌ Could not parse any items from speech")
        return twiml_response(error_twiml(
            "Maaf kijiye, mujhe samajh nahi aaya. Kripya apna order dobara bataiye."
        ))
    
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
    
    if unmatched:
        print(f"❌ UNMATCHED ITEMS:")
        unmatched_names = [item.product_name for item in unmatched]
        for name in unmatched_names:
            print(f"   • {name} (not in inventory)")
        matched_summary = format_items_summary(matched, "hi") if matched else ""
        return twiml_response(unmatched_items_twiml(unmatched_names, matched_summary))
    
    # All items matched - confirm order
    session.state = IntakeState.CONFIRMING
    total = calculate_order_total(session.items)
    summary = format_items_summary(session.items, "hi")
    
    print(f"\n💰 ORDER TOTAL: ₹{total:.0f}")
    print(f"📋 Summary: {summary}")
    print(f"\n⏳ Asking customer to confirm...")
    
    return twiml_response(confirm_order_twiml(summary, total))


@router.post("/confirm")
async def handle_confirmation(
    CallSid: str = Form(...),
    From: str = Form(...),
    SpeechResult: Optional[str] = Form(None),
    Digits: Optional[str] = Form(None)
):
    """
    Handle order confirmation.
    1 or "yes" = confirm, 2 or "no" = cancel
    """
    session = voice_sessions.get(CallSid)
    
    if not session:
        return twiml_response(error_twiml())
    
    # Check for confirmation
    confirmed = False
    cancelled = False
    
    if Digits == "1" or (SpeechResult and any(w in SpeechResult.lower() for w in ["yes", "haan", "ha", "confirm", "ok", "okay"])):
        confirmed = True
    elif Digits == "2" or (SpeechResult and any(w in SpeechResult.lower() for w in ["no", "nahi", "cancel", "ruko"])):
        cancelled = True
    
    if confirmed:
        # Create actual order in database
        try:
            order_number = f"VO-{CallSid[-6:].upper()}"
            
            print("\n" + "*"*60)
            print(f"🎉 ORDER CONFIRMED!")
            print(f"   Order #: {order_number}")
            print(f"   Customer: {session.user_id}")
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
                "source": "voice",
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
                "delivery_address": session.delivery_address or "To be confirmed",
                "notes": f"Voice order from {session.user_id}"
            }
            
            result = tables_db.create_row(DATABASE_ID, "orders", ID.unique(), order_data)
            session.order_id = result.get("$id")
            session.state = IntakeState.COMPLETE
            
            print(f"💾 Order saved to database! ID: {session.order_id}")
            
            # Cleanup session
            del voice_sessions[CallSid]
            
            return twiml_response(order_success_twiml(order_number))
            
        except Exception as e:
            print(f"Order creation failed: {e}")
            return twiml_response(error_twiml("Order create karne mein problem hui. Kripya baad mein try karein."))
    
    elif cancelled:
        session.state = IntakeState.CANCELLED
        del voice_sessions[CallSid]
        return twiml_response(order_cancelled_twiml())
    
    else:
        # Unclear, ask again
        total = calculate_order_total(session.items)
        summary = format_items_summary(session.items, "hi")
        return twiml_response(confirm_order_twiml(summary, total))


@router.post("/status")
async def handle_call_status(
    CallSid: str = Form(...),
    CallStatus: str = Form(...)
):
    """Handle call status callbacks (completed, failed, etc.)"""
    print(f"📞 Call {CallSid} status: {CallStatus}")
    
    # Cleanup session on call end
    if CallStatus in ["completed", "failed", "busy", "no-answer"]:
        if CallSid in voice_sessions:
            del voice_sessions[CallSid]
    
    return PlainTextResponse("OK")
