import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Appwrite
    APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
    APPWRITE_PROJECT_ID = os.getenv('APPWRITE_PROJECT_ID', '')
    APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY', '')
    APPWRITE_DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', '')
    
    # OpenAI
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    
    # App
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')

settings = Settings()
