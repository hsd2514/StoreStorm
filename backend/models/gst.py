from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class GSTReport(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shop_id: str
    period: str # YYYY-MM
    total_sales: float
    total_gst: float
    breakdown: Dict[str, float] # e.g. {"0": 100, "5": 50, ...}
    report_data: Dict[str, Any] # Detailed layout
    generated_at: datetime = Field(default_factory=datetime.now)
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
