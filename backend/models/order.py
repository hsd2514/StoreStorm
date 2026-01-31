from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    productId: str
    productName: str
    quantity: float
    unit: str
    price: float
    total: float

class Order(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shopId: str
    customerId: str
    orderNumber: str
    source: Literal['whatsapp', 'voice', 'storefront']
    rawInput: Optional[str] = None
    items: List[Dict[str, Any]] # Or List[OrderItem] if strict
    totalAmount: float
    gstAmount: float
    status: Literal['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
    deliveryAddress: str
    deliveryLatitude: Optional[float] = None
    deliveryLongitude: Optional[float] = None
    preferredDeliveryTime: Optional[str] = None
    assignedBatchId: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
