from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

class Product(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shopId: str
    name: str
    category: str
    price: float
    unit: str
    gstRate: float
    imageUrl: Optional[str] = None
    isActive: bool = True
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    @field_validator('gstRate')
    def validate_gst_rate(cls, v):
        allowed_rates = [0.0, 5.0, 12.0, 18.0, 28.0]
        if v not in allowed_rates:
            raise ValueError(f'GST Rate must be one of {allowed_rates}')
        return v

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
