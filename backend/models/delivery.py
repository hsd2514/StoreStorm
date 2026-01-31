from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class Delivery(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shop_id: str
    batch_number: str
    order_ids: List[str]
    status: Literal['planned', 'in_progress', 'completed']
    optimized_route: List[Dict[str, Any]] # Or specific structure
    delivery_person_id: Optional[str] = None
    estimated_time: Optional[int] = None # In minutes
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
