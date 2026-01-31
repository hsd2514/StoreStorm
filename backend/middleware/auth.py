"""
Authentication middleware for protected routes
"""
from fastapi import Header, HTTPException
from typing import Optional


async def verify_session(x_session_id: Optional[str] = Header(None)):
    """
    Verify Appwrite session token
    For now, this is a placeholder - actual verification done on frontend
    """
    if not x_session_id:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Please login."
        )
    
    # In production, verify the session with Appwrite
    # For now, we'll trust the frontend sends valid session
    return x_session_id


async def get_current_shop_id(x_shop_id: Optional[str] = Header(None)):
    """
    Extract shop_id from request headers
    Frontend should send this after login
    """
    if not x_shop_id:
        raise HTTPException(
            status_code=400,
            detail="Shop ID required"
        )
    
    return x_shop_id
