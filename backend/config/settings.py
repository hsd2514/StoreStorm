import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Appwrite
    APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
    APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID', '')
    APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY', '')
    APPWRITE_DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', '')
    
    # FastRouter AI
    FASTROUTER_API_KEY = os.getenv('FASTROUTER_API_KEY', '')
    
    # Twilio Voice
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER', '')
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
    TELEGRAM_WEBHOOK_SECRET = os.getenv('TELEGRAM_WEBHOOK_SECRET', '')
    
    # App
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')

settings = Settings()
