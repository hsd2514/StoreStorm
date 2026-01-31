"""
Appwrite Database Setup Script
Creates database and collections for StoreStorm platform
"""
import os
import sys
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.id import ID
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

load_dotenv()

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

tables_db = TablesDB(client)

# Database configuration
DATABASE_NAME = 'storestorm_db'

# Collection schemas
COLLECTIONS = {
    'shops': {
        'name': 'Shops',
        'attributes': [
            {'key': 'name', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'owner_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'phone', 'type': 'string', 'size': 20, 'required': True},
            {'key': 'address', 'type': 'string', 'size': 500, 'required': True},
            {'key': 'category', 'type': 'string', 'size': 100, 'required': False},
            {'key': 'gstin', 'type': 'string', 'size': 15, 'required': False},
            {'key': 'latitude', 'type': 'double', 'required': False},
            {'key': 'longitude', 'type': 'double', 'required': False},
            {'key': 'is_active', 'type': 'boolean', 'required': False, 'default': True},
        ],
        'indexes': [
            {'key': 'owner_id_idx', 'type': 'key', 'attributes': ['owner_id']},
            {'key': 'phone_idx', 'type': 'key', 'attributes': ['phone']},
        ]
    },
    'products': {
        'name': 'Products',
        'attributes': [
            {'key': 'shop_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'name', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'category', 'type': 'string', 'size': 100, 'required': True},
            {'key': 'price', 'type': 'double', 'required': True},
            {'key': 'unit', 'type': 'string', 'size': 20, 'required': True},
            {'key': 'gst_rate', 'type': 'integer', 'required': False, 'default': 0},
            {'key': 'hsn_code', 'type': 'string', 'size': 20, 'required': False},
            {'key': 'image_url', 'type': 'string', 'size': 500, 'required': False},
            {'key': 'is_active', 'type': 'boolean', 'required': False, 'default': True},
        ],
        'indexes': [
            {'key': 'shop_id_idx', 'type': 'key', 'attributes': ['shop_id']},
            {'key': 'category_idx', 'type': 'key', 'attributes': ['category']},
        ]
    },
    'inventory': {
        'name': 'Inventory',
        'attributes': [
            {'key': 'shop_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'product_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'stock_quantity', 'type': 'double', 'required': True},
            {'key': 'min_stock_level', 'type': 'double', 'required': True},
            {'key': 'last_restock_date', 'type': 'datetime', 'required': False},
        ],
        'indexes': [
            {'key': 'shop_id_idx', 'type': 'key', 'attributes': ['shop_id']},
            {'key': 'product_id_idx', 'type': 'key', 'attributes': ['product_id']},
        ]
    },
    'customers': {
        'name': 'Customers',
        'attributes': [
            {'key': 'shop_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'name', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'phone', 'type': 'string', 'size': 20, 'required': True},
            {'key': 'address', 'type': 'string', 'size': 500, 'required': False},
            {'key': 'total_orders', 'type': 'integer', 'required': False, 'default': 0},
            {'key': 'total_spent', 'type': 'double', 'required': False, 'default': 0.0},
        ],
        'indexes': [
            {'key': 'shop_id_idx', 'type': 'key', 'attributes': ['shop_id']},
            {'key': 'phone_idx', 'type': 'key', 'attributes': ['phone']},
        ]
    },
    'orders': {
        'name': 'Orders',
        'attributes': [
            {'key': 'shop_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'customer_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'order_number', 'type': 'string', 'size': 50, 'required': True},
            {'key': 'items', 'type': 'string', 'size': 10000, 'required': True},  # JSON string
            {'key': 'total_amount', 'type': 'double', 'required': True},
            {'key': 'gst_amount', 'type': 'double', 'required': True},
            {'key': 'status', 'type': 'string', 'size': 50, 'required': True},  # pending, confirmed, preparing, out_for_delivery, delivered, cancelled
            {'key': 'source', 'type': 'string', 'size': 50, 'required': True},  # whatsapp, voice, storefront
            {'key': 'delivery_address', 'type': 'string', 'size': 500, 'required': False},
            {'key': 'delivery_batch_id', 'type': 'string', 'size': 255, 'required': False},
            {'key': 'notes', 'type': 'string', 'size': 1000, 'required': False},
        ],
        'indexes': [
            {'key': 'shop_id_idx', 'type': 'key', 'attributes': ['shop_id']},
            {'key': 'customer_id_idx', 'type': 'key', 'attributes': ['customer_id']},
            {'key': 'order_number_idx', 'type': 'unique', 'attributes': ['order_number']},
            {'key': 'status_idx', 'type': 'key', 'attributes': ['status']},
        ]
    },
    'deliveries': {
        'name': 'Deliveries',
        'attributes': [
            {'key': 'shop_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'batch_number', 'type': 'string', 'size': 50, 'required': True},
            {'key': 'driver_name', 'type': 'string', 'size': 255, 'required': False},
            {'key': 'driver_phone', 'type': 'string', 'size': 20, 'required': False},
            {'key': 'order_ids', 'type': 'string', 'size': 500, 'required': True},  # JSON array
            {'key': 'area', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'status', 'type': 'string', 'size': 50, 'required': True},  # planned, in_progress, completed
            {'key': 'estimated_time', 'type': 'integer', 'required': False},  # minutes
            {'key': 'route_info', 'type': 'string', 'size': 500, 'required': False},  # JSON
            {'key': 'crates', 'type': 'string', 'size': 500, 'required': False},  # JSON
            {'key': 'capacity_used', 'type': 'integer', 'required': False, 'default': 0},
            {'key': 'route_stops', 'type': 'string', 'size': 1000, 'required': False},  # JSON
            {'key': 'route_geometry', 'type': 'string', 'size': 1000, 'required': False},  # JSON
            {'key': 'total_distance', 'type': 'double', 'required': False},
            {'key': 'delivery_partner', 'type': 'string', 'size': 500, 'required': False},  # JSON
            {'key': 'started_at', 'type': 'datetime', 'required': False},
            {'key': 'completed_at', 'type': 'datetime', 'required': False},
        ],
        'indexes': [
            {'key': 'shop_id_idx', 'type': 'key', 'attributes': ['shop_id']},
            {'key': 'batch_number_idx', 'type': 'unique', 'attributes': ['batch_number']},
            {'key': 'status_idx', 'type': 'key', 'attributes': ['status']},
        ]
    },
    'gst_reports': {
        'name': 'GST Reports',
        'attributes': [
            {'key': 'shop_id', 'type': 'string', 'size': 255, 'required': True},
            {'key': 'period', 'type': 'string', 'size': 50, 'required': True},  # e.g., "2026-01"
            {'key': 'total_sales', 'type': 'double', 'required': True},
            {'key': 'total_gst', 'type': 'double', 'required': True},
            {'key': 'breakdown', 'type': 'string', 'size': 1000, 'required': True},  # JSON
            {'key': 'report_data', 'type': 'string', 'size': 1000, 'required': False}, # JSON
            {'key': 'status', 'type': 'string', 'size': 50, 'required': True},  # pending, filed
            {'key': 'generated_at', 'type': 'datetime', 'required': False},
            {'key': 'filed_at', 'type': 'datetime', 'required': False},
        ],
        'indexes': [
            {'key': 'shop_id_idx', 'type': 'key', 'attributes': ['shop_id']},
            {'key': 'period_idx', 'type': 'key', 'attributes': ['period']},
        ]
    },
}


def create_database():
    """Create the main database"""
    try:
        # Try to create database
        database = tables_db.create(
            database_id=ID.unique(),
            name=DATABASE_NAME
        )
        database_id = database['$id']
        print(f"✅ Created database: {DATABASE_NAME} (ID: {database_id})")
        return database_id
    except AppwriteException as e:
        if 'already exists' in str(e).lower():
            print(f"⚠️  Database '{DATABASE_NAME}' already exists. Using existing database.")
            # List databases to find the ID
            try:
                db_list = tables_db.list()
                for db in db_list['databases']:
                    if db['name'] == DATABASE_NAME:
                        return db['$id']
            except:
                pass
        print(f"❌ Error creating database: {e}")
        return None


def create_collection(database_id, collection_id, schema):
    """Create a collection with attributes and indexes"""
    try:
        # Create collection
        collection = tables_db.create_table(
            database_id=database_id,
            table_id=collection_id,
            name=schema['name'],
            permissions=[
                'read("any")',
                'create("users")',
                'update("users")',
                'delete("users")'
            ]
        )
        print(f"  ✅ Created collection: {schema['name']}")
        
        # Create attributes
        for attr in schema['attributes']:
            try:
                attr_type = attr['type']
                key = attr['key']
                
                if attr_type == 'string':
                    tables_db.create_string_column(
                        database_id=database_id,
                        table_id=collection_id,
                        key=key,
                        size=attr['size'],
                        required=attr['required'],
                        default=attr.get('default')
                    )
                elif attr_type == 'integer':
                    tables_db.create_integer_column(
                        database_id=database_id,
                        table_id=collection_id,
                        key=key,
                        required=attr['required'],
                        default=attr.get('default')
                    )
                elif attr_type == 'double':
                    tables_db.create_float_column(
                        database_id=database_id,
                        table_id=collection_id,
                        key=key,
                        required=attr['required'],
                        default=attr.get('default')
                    )
                elif attr_type == 'boolean':
                    tables_db.create_boolean_column(
                        database_id=database_id,
                        table_id=collection_id,
                        key=key,
                        required=attr['required'],
                        default=attr.get('default')
                    )
                elif attr_type == 'datetime':
                    tables_db.create_datetime_column(
                        database_id=database_id,
                        table_id=collection_id,
                        key=key,
                        required=attr['required']
                    )
                
                print(f"    • Added attribute: {key} ({attr_type})")
            except AppwriteException as e:
                if 'already exists' not in str(e).lower():
                    print(f"    ⚠️  Error creating attribute {key}: {e}")
        
        # Wait for attributes to be fully created before adding indexes
        import time
        print(f"    ⏳ Waiting for attributes to be ready...")
        time.sleep(5)
        
        # Create indexes
        for idx in schema.get('indexes', []):
            try:
                tables_db.create_index(
                    database_id=database_id,
                    table_id=collection_id,
                    key=idx['key'],
                    type=idx['type'],
                    columns=idx['attributes']
                )
                print(f"    • Added index: {idx['key']}")
            except AppwriteException as e:
                if 'already exists' not in str(e).lower():
                    print(f"    ⚠️  Error creating index {idx['key']}: {e}")
        
        return True
    except AppwriteException as e:
        if 'already exists' in str(e).lower():
            print(f"  ⚠️  Collection '{schema['name']}' already exists")
        else:
            print(f"  ❌ Error creating collection: {e}")
        return False


def main():
    """Main setup function"""
    print("\n🚀 Starting Appwrite Database Setup for StoreStorm\n")
    
    # Create database
    database_id = create_database()
    if not database_id:
        print("\n❌ Failed to create/find database. Exiting.")
        sys.exit(1)
    
    # Update .env file with database_id
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            env_content = f.read()
        
        # Replace existing DATABASE_ID with new one
        import re
        env_content = re.sub(
            r'APPWRITE_DATABASE_ID=.*',
            f'APPWRITE_DATABASE_ID={database_id}',
            env_content
        )
        
        with open(env_path, 'w') as f:
            f.write(env_content)
        
        print(f"\n✅ Updated backend .env with DATABASE_ID: {database_id}")

    # Update frontend .env if it exists
    frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env')
    if os.path.exists(frontend_env_path):
        with open(frontend_env_path, 'r') as f:
            f_env_content = f.read()
        
        import re
        f_env_content = re.sub(
            r'VITE_APPWRITE_DATABASE_ID=.*',
            f'VITE_APPWRITE_DATABASE_ID={database_id}',
            f_env_content
        )
        
        with open(frontend_env_path, 'w') as f:
            f.write(f_env_content)
        print(f"✅ Updated frontend .env with DATABASE_ID: {database_id}")

    # Update config file
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'appwrite.py')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config_content = f.read()
        
        import re
        # Support both '' and specific IDs in the regex
        config_content = re.sub(
            r"DATABASE_ID = os\.getenv\('APPWRITE_DATABASE_ID', '.*'\)",
            f"DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', '{database_id}')",
            config_content
        )
        
        with open(config_path, 'w') as f:
            f.write(config_content)
        print(f"✅ Updated config/appwrite.py with DATABASE_ID: {database_id}")
    
    # Create collections
    print("\n📦 Creating Collections:\n")
    for collection_id, schema in COLLECTIONS.items():
        create_collection(database_id, collection_id, schema)
        print()
    
    print("\n" + "="*60)
    print("✅ Database Setup Complete!")
    print("="*60)
    print(f"\nDatabase ID: {database_id}")
    print(f"Collections Created: {len(COLLECTIONS)}")
    print("\n📝 Collection IDs:")
    for coll_id in COLLECTIONS.keys():
        print(f"  • {coll_id}")
    print("\n🎉 You're all set! Start building your features.\n")

