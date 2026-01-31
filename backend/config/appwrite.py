from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.services.users import Users
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID', ''))
client.set_key(os.getenv('APPWRITE_API_KEY', ''))

# Initialize services
databases = Databases(client)
storage = Storage(client)
users = Users(client)

# Database ID
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', '697da223000cae31da10')

# Collection IDs (to be set after creating collections)
COLLECTION_SHOPS = 'shops'
COLLECTION_PRODUCTS = 'products'
COLLECTION_INVENTORY = 'inventory'
COLLECTION_CUSTOMERS = 'customers'
COLLECTION_ORDERS = 'orders'
COLLECTION_DELIVERIES = 'deliveries'
COLLECTION_GST_REPORTS = 'gst_reports'
COLLECTION_AI_INSIGHTS = 'ai_insights'
