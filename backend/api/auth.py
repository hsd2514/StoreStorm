"""
Authentication API Router
Handles user registration, login, and session management using Appwrite
"""
from fastapi import APIRouter, HTTPException, Response, Depends, Header
from pydantic import BaseModel, EmailStr 
from appwrite.exception import AppwriteException
from appwrite.id import ID
from typing import Optional

from config.appwrite import client, tables_db, DATABASE_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Request/Response Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    shop_name: str
    phone: str
    address: str
    category: str = "grocery"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user: dict
    shop: dict
    message: str


@router.post("/register", response_model=dict, status_code=201)
async def register(data: RegisterRequest):
    """
    Register a new shop owner
    1. Create Appwrite user account
    2. Create shop in database
    3. Return user + shop info
    """
    try:
        from appwrite.services.account import Account
        from appwrite.services.users import Users
        
        # Create user in Appwrite
        users = Users(client)
        
        user = users.create(
            user_id=ID.unique(),
            email=data.email,
            password=data.password,
            name=data.name
        )
        
        # Create shop for this user
        shop = tables_db.create_row(
            database_id=DATABASE_ID,
            table_id="shops",
            row_id=ID.unique(),
            data={
                "name": data.shop_name,
                "owner_id": user['$id'],
                "phone": data.phone,
                "address": data.address,
                "category": data.category,
                "is_active": True
            }
        )
        
        return {
            "message": "Registration successful",
            "user": {
                "id": user['$id'],
                "email": user['email'],
                "name": user['name']
            },
            "shop": {
                "id": shop['$id'],
                "name": shop['name'],
                "category": shop['category']
            }
        }
        
    except AppwriteException as e:
        if "user already exists" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=dict)
async def login(data: LoginRequest):
    """
    Login shop owner
    Validates credentials and returns user + shop info
    """
    try:
        from appwrite.services.account import Account
        from appwrite.services.users import Users as AdminUsers
        from appwrite.client import Client
        
        # 1. Create a temporary client for password validation
        user_client = Client()
        user_client.set_endpoint(APPWRITE_ENDPOINT)
        user_client.set_project(APPWRITE_PROJECT_ID)
        
        account = Account(user_client)
        
        # 2. Create email session (this validates the password)
        session = account.create_email_password_session(
            email=data.email,
            password=data.password
        )
        
        # 3. Fetch user details using ADMIN privileges (bypasses "Account" scope issues)
        admin_users = AdminUsers(client)
        user = admin_users.get(user_id=session['userId'])
        
        # 4. Get user's shop using global tables_db service (Admin)
        from appwrite.query import Query
        shop_docs = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="shops",
            queries=[Query.equal("owner_id", user["$id"])]
        )
        
        if not shop_docs['rows']:
            raise HTTPException(status_code=404, detail="No shop found for this user")
        
        shop = shop_docs['rows'][0]
        
        return {
            "message": "Login successful",
            "session": {
                "id": session['$id'],
                "userId": session['userId'],
                "expire": session['expire']
            },
            "user": {
                "id": user['$id'],
                "email": user['email'],
                "name": user['name']
            },
            "shop": {
                "id": shop['$id'],
                "name": shop['name'],
                "category": shop.get('category', 'retail')
            }
        }
        
    except AppwriteException as e:
        error_msg = str(e).lower()
        if "invalid credentials" in error_msg or "unauthorized" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_current_user(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Get current authenticated user info from session ID
    """
    if not x_session_id:
         raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        from appwrite.services.account import Account
        from appwrite.client import Client
        from appwrite.query import Query
        
        # Create a client for this specific session
        temp_client = Client()
        temp_client.set_endpoint(APPWRITE_ENDPOINT)
        temp_client.set_project(APPWRITE_PROJECT_ID)
        temp_client.set_session(x_session_id)
        
        account = Account(temp_client)
        user = account.get()
        
        # Get user's shop using Admin service
        shops = tables_db.list_rows(
            database_id=DATABASE_ID,
            table_id="shops",
            queries=[Query.equal("owner_id", user["$id"])]
        )
        
        shop = shops['rows'][0] if shops['rows'] else None
        
        return {
            "user": {
                "id": user['$id'],
                "email": user['email'],
                "name": user['name']
            },
            "shop": shop
        }
        
    except AppwriteException as e:
        raise HTTPException(status_code=401, detail="Session invalid or expired")
