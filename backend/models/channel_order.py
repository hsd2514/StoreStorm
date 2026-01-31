"""
Channel Order Models - State machine for multi-channel order intake
Supports: Twilio Voice, Telegram Chat
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class OrderChannel(str, Enum):
    """Order intake channel types"""
    VOICE = "voice"      # Twilio phone call
    TELEGRAM = "telegram"  # Telegram bot
    WHATSAPP = "whatsapp"  # WhatsApp (future)


class IntakeState(str, Enum):
    """State machine states for order intake"""
    GREETING = "greeting"           # Initial welcome
    COLLECTING_ITEMS = "collecting" # Gathering order items
    CONFIRMING = "confirming"       # Order confirmation
    COLLECTING_ADDRESS = "address"  # Getting delivery address
    COMPLETE = "complete"           # Order finalized
    CANCELLED = "cancelled"         # User cancelled


class ParsedOrderItem(BaseModel):
    """Single item extracted from voice/text input"""
    raw_text: str                          # Original text: "2 kg rice"
    product_name: str                      # Extracted: "rice"
    quantity: float = 1.0                  # Extracted: 2
    unit: str = "pcs"                      # Extracted: "kg"
    
    # Menu matching results
    matched: bool = False                  # Did we find it in inventory?
    product_id: Optional[str] = None       # Matched product ID
    matched_name: Optional[str] = None     # Actual product name from inventory
    price: Optional[float] = None          # Price from inventory
    confidence: float = 0.0                # Match confidence (0-1)


class ChannelSession(BaseModel):
    """
    Tracks a multi-step order intake session.
    Stored in Appwrite 'channel_sessions' collection.
    """
    id: Optional[str] = Field(None, alias="$id")
    
    # Identity
    user_id: str                           # Phone number or Telegram ID
    shop_id: str                           # Associated shop
    channel: OrderChannel                  # voice, telegram, whatsapp
    
    # State machine
    state: IntakeState = IntakeState.GREETING
    
    # Collected data
    items: List[ParsedOrderItem] = []
    delivery_address: Optional[str] = None
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    
    # Raw inputs (for debugging/replay)
    raw_inputs: List[str] = []
    
    # Metadata
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")
    expires_at: Optional[datetime] = None  # Session timeout
    
    # Final order reference
    order_id: Optional[str] = None         # Created order ID
    
    class Config:
        populate_by_name = True
        use_enum_values = True


class VoiceWebhookPayload(BaseModel):
    """Twilio voice webhook payload"""
    CallSid: str
    From: str                              # Caller phone number
    To: str                                # Twilio number called
    CallStatus: str
    SpeechResult: Optional[str] = None     # Transcribed speech
    Digits: Optional[str] = None           # DTMF keypad input
    Confidence: Optional[float] = None     # Speech recognition confidence


class TelegramUpdate(BaseModel):
    """Telegram webhook update payload"""
    update_id: int
    message: Optional[Dict[str, Any]] = None
    callback_query: Optional[Dict[str, Any]] = None  # Inline button clicks
    
    @property
    def chat_id(self) -> Optional[int]:
        if self.message:
            return self.message.get("chat", {}).get("id")
        if self.callback_query:
            return self.callback_query.get("message", {}).get("chat", {}).get("id")
        return None
    
    @property
    def text(self) -> Optional[str]:
        if self.message:
            return self.message.get("text")
        return None
    
    @property
    def user_id(self) -> Optional[int]:
        if self.message:
            return self.message.get("from", {}).get("id")
        if self.callback_query:
            return self.callback_query.get("from", {}).get("id")
        return None


class OrderIntakeResponse(BaseModel):
    """Response from order intake processing"""
    success: bool
    state: IntakeState
    message: str                           # Human-readable response
    items: List[ParsedOrderItem] = []
    total_amount: float = 0.0
    order_id: Optional[str] = None
    needs_clarification: bool = False
    unmatched_items: List[str] = []
