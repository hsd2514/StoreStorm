from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class Inventory(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shop_id: str
    product_id: str
    stock_quantity: float
    min_stock_level: float
    last_restock_date: Optional[datetime] = None
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
