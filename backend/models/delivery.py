from datetime import datetime
from typing import Optional, List, Dict, Any, Literal, Union
from pydantic import BaseModel, Field, field_validator
import json

class Crate(BaseModel):
    """A physical crate that holds multiple orders"""
    id: str
    capacity: int = 10
    assigned_order_ids: List[str] = []
    weight: Optional[float] = None

class DeliveryStop(BaseModel):
    """A single stop in the delivery route"""
    order_id: str
    customer_name: str
    address: str
    latitude: float
    longitude: float
    status: Literal['pending', 'current', 'delivered'] = 'pending'
    sequence: int

class DeliveryPartner(BaseModel):
    """Delivery partner metadata"""
    name: str
    phone: str = ""
    vehicle: Literal['bike', 'car', 'van'] = 'bike'

class Delivery(BaseModel):
    id: Optional[str] = Field(None, alias="$id")
    shop_id: str
    batch_number: str
    
    # Order IDs - can be list or JSON string from DB
    order_ids: Optional[Union[List[str], str]] = []
    
    # Old schema fields (from existing DB)
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    area: Optional[str] = None
    route_info: Optional[Union[Dict, str]] = None
    
    # New schema fields
    crates: Optional[Union[List[Crate], str]] = []
    capacity_used: int = 0
    route_stops: Optional[Union[List[DeliveryStop], str]] = []
    route_geometry: Optional[Union[Dict[str, Any], str]] = None
    total_distance: Optional[float] = None
    
    # Status - handle both cases
    status: str = 'planned'
    
    # Partner information - can be dict or constructed from driver fields
    delivery_partner: Optional[Union[DeliveryPartner, Dict, str]] = None
    
    # Time tracking
    estimated_time: Optional[int] = None
    started_at: Optional[Union[datetime, str]] = None
    completed_at: Optional[Union[datetime, str]] = None
    created_at: Optional[datetime] = Field(None, alias="$createdAt")
    updated_at: Optional[datetime] = Field(None, alias="$updatedAt")

    @field_validator('order_ids', mode='before')
    @classmethod
    def parse_order_ids(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []
    
    @field_validator('crates', mode='before')
    @classmethod
    def parse_crates(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []
    
    @field_validator('route_stops', mode='before')
    @classmethod
    def parse_route_stops(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return []
        return v or []
    
    @field_validator('route_geometry', mode='before')
    @classmethod
    def parse_route_geometry(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return None
        return v
    
    @field_validator('delivery_partner', mode='before')
    @classmethod
    def parse_delivery_partner(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return None
        return v
    
    @field_validator('route_info', mode='before')
    @classmethod 
    def parse_route_info(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except:
                return None
        return v

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
