from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class Inventory(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shopId: str
    productId: str
    currentStock: int
    minStock: int
    lastRestocked: Optional[datetime] = None
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
