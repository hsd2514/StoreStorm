"""
Fix missing attributes and indexes in existing collections
"""
import os
import time
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

load_dotenv()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID')

print("\n🔧 Fixing Missing Attributes and Indexes\n")

# Fix shops collection
print("📦 Fixing Shops collection...")
try:
    databases.create_boolean_attribute(
        database_id=DATABASE_ID,
        collection_id='shops',
        key='is_active',
        required=False,
        default=True
    )
    print("  ✅ Added is_active attribute")
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("  ⚠️  is_active already exists")
    else:
        print(f"  ❌ Error: {e}")

# Fix products collection  
print("\n📦 Fixing Products collection...")
try:
    databases.create_integer_attribute(
        database_id=DATABASE_ID,
        collection_id='products',
        key='gst_rate',
        required=False,
        default=0
    )
    print("  ✅ Added gst_rate attribute")
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("  ⚠️  gst_rate already exists")
    else:
        print(f"  ❌ Error: {e}")

try:
    databases.create_boolean_attribute(
        database_id=DATABASE_ID,
        collection_id='products',
        key='is_active',
        required=False,
        default=True
    )
    print("  ✅ Added is_active attribute")
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("  ⚠️  is_active already exists")
    else:
        print(f"  ❌ Error: {e}")

# Fix customers collection
print("\n📦 Fixing Customers collection...")
try:
    databases.create_integer_attribute(
        database_id=DATABASE_ID,
        collection_id='customers',
        key='total_orders',
        required=False,
        default=0
    )
    print("  ✅ Added total_orders attribute")
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("  ⚠️  total_orders already exists")
    else:
        print(f"  ❌ Error: {e}")

try:
    databases.create_float_attribute(
        database_id=DATABASE_ID,
        collection_id='customers',
        key='total_spent',
        required=False,
        default=0.0
    )
    print("  ✅ Added total_spent attribute")
except AppwriteException as e:
    if 'already exists' in str(e).lower():
        print("  ⚠️  total_spent already exists")
    else:
        print(f"  ❌ Error: {e}")

# Wait for attributes to be ready
print("\n⏳ Waiting for attributes to be fully created...")
time.sleep(10)

# Fix indexes
print("\n🔍 Creating Missing Indexes...")

indexes_to_create = [
    ('inventory', 'product_id_idx', 'key', ['product_id']),
    ('customers', 'shop_id_idx', 'key', ['shop_id']),
    ('customers', 'phone_idx', 'key', ['phone']),
    ('orders', 'status_idx', 'key', ['status']),
    ('deliveries', 'batch_number_idx', 'unique', ['batch_number']),
    ('deliveries', 'status_idx', 'key', ['status']),
    ('gst_reports', 'period_idx', 'key', ['period']),
]

for collection_id, index_key, index_type, attributes in indexes_to_create:
    try:
        databases.create_index(
            database_id=DATABASE_ID,
            collection_id=collection_id,
            key=index_key,
            type=index_type,
            attributes=attributes
        )
        print(f"  ✅ {collection_id}.{index_key}")
    except AppwriteException as e:
        if 'already exists' in str(e).lower():
            print(f"  ⚠️  {collection_id}.{index_key} already exists")
        else:
            print(f"  ❌ {collection_id}.{index_key}: {e}")

print("\n" + "="*60)
print("✅ Fix Complete!")
print("="*60)
print("\n🎉 All attributes and indexes should now be in place.\n")
