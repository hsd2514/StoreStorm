from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

class Shop(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    name: str
    category: Literal['grocery', 'pharmacy', 'food', 'electronics']
    owner_id: str
    phone: str
    address: str
    latitude: float
    longitude: float
    gstin: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
