from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

class Delivery(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shopId: str
    batchNumber: str
    orderIds: List[str]
    status: Literal['planned', 'in_progress', 'completed']
    optimizedRoute: List[Dict[str, Any]] # Or specific structure
    deliveryPersonId: Optional[str] = None
    estimatedTime: Optional[int] = None # In minutes
    startedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
