from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class Customer(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shop_id: str
    name: str
    phone: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_orders: int = 0
    total_spent: float = 0.0
    preferred_language: str = "en"
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
