from datetime import datetime
from typing import Optional, List, Dict, Any, Literal, Union
from pydantic import BaseModel, Field, field_validator
import json

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
    items: Union[List[Dict[str, Any]], str] = []  # Can be list or JSON string
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

    @field_validator('items', mode='before')
    @classmethod
    def parse_items(cls, v):
        """Parse items if it's a JSON string"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
