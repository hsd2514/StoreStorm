from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    unit: str
    price: float
    total: float

class Order(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shop_id: str
    customer_id: str
    order_number: str
    source: Literal['whatsapp', 'voice', 'storefront']
    raw_input: Optional[str] = None
    items: List[Dict[str, Any]] # Or List[OrderItem] if strict
    total_amount: float
    gst_amount: float
    status: Literal['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
    delivery_address: str
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    preferred_delivery_time: Optional[str] = None
    delivery_batch_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
