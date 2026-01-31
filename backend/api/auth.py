"""
Authentication API Router
Handles user registration, login, and session management using Appwrite
"""
from fastapi import APIRouter, HTTPException, Response, Depends
from pydantic import BaseModel, EmailStr
from appwrite.exception import AppwriteException
from appwrite.id import ID

from config.appwrite import client, databases, DATABASE_ID

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
        shop = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="shops",
            document_id=ID.unique(),
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
    Note: For full session management, use Appwrite SDK on frontend
    This endpoint validates credentials and returns user info
    """
    try:
        from appwrite.services.account import Account
        
        # Create a new client for this user session
        from appwrite.client import Client
        user_client = Client()
        user_client.set_endpoint(client.endpoint)
        user_client.set_project(client.project)
        
        account = Account(user_client)
        
        # Create email session
        session = account.create_email_password_session(
            email=data.email,
            password=data.password
        )
        
        # Get user details
        user = account.get()
        
        # Get user's shop
        shops = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="shops",
            queries=[f'owner_id="{user["$id"]}"']
        )
        
        if not shops['documents']:
            raise HTTPException(status_code=404, detail="No shop found for this user")
        
        shop = shops['documents'][0]
        
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
                "category": shop['category']
            }
        }
        
    except AppwriteException as e:
        if "invalid credentials" in str(e).lower() or "unauthorized" in str(e).lower():
            raise HTTPException(status_code=401, detail="Invalid email or password")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/logout")
async def logout():
    """
    Logout user (handled on frontend via Appwrite SDK)
    """
    return {"message": "Logout successful"}


@router.get("/me")
async def get_current_user():
    """
    Get current authenticated user
    This requires the session cookie to be passed
    """
    try:
        from appwrite.services.account import Account
        
        account = Account(client)
        user = account.get()
        
        # Get user's shop
        shops = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="shops",
            queries=[f'owner_id="{user["$id"]}"']
        )
        
        shop = shops['documents'][0] if shops['documents'] else None
        
        return {
            "user": {
                "id": user['$id'],
                "email": user['email'],
                "name": user['name']
            },
            "shop": shop
        }
        
    except AppwriteException as e:
        raise HTTPException(status_code=401, detail="Not authenticated")
