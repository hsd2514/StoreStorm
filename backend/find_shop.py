import os
import json
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB

load_dotenv()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

tables_db = TablesDB(client)

def find_rogue_shop():
    target_id = "697e104b00190c0dc4c2"
    print(f"DEBUGGING ROGUE SHOP ID: {target_id}")
    
    # Check current DB
    db_id = os.getenv('APPWRITE_DATABASE_ID')
    try:
        shop = tables_db.get_row(db_id, 'shops', target_id)
        print(f"✅ Found in current database ({db_id})!")
        print(f" - Name: {shop['name']}, Owner: {shop['owner_id']}")
    except:
        print(f"❌ Not found in current database ({db_id})")

    # Check all databases
    try:
        dbs = tables_db.list()['databases']
        for db in dbs:
            if db['$id'] == db_id: continue
            print(f"Checking database: {db['name']} ({db['$id']})...")
            try:
                shop = tables_db.get_row(db['$id'], 'shops', target_id)
                print(f"✅ FOUND IN DB: {db['name']} ({db['$id']})!!!")
                print(f" - Name: {shop.get('name')}, Owner: {shop.get('owner_id')}")
            except:
                pass
    except Exception as e:
        print(f"Error listing databases: {e}")

if __name__ == "__main__":
    find_rogue_shop()
