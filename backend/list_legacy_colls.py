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
db_id = "697da223000cae31da10"

def list_collections():
    print(f"LISTING COLLECTIONS IN DB: {db_id}")
    try:
        # TablesDB list_tables? The SDK uses TablesDB for databases/tables
        # Actually it's often called list_tables in TablesDB service
        # Let's check signature or just try list() if it lists tables in a DB
        # Wait, the TablesDB.list() usually lists databases. 
        # TablesDB.list_tables(database_id) is what we need.
        try:
            res = tables_db.list_tables(db_id)
            print(f"Found {len(res['tables'])} collections:")
            for t in res['tables']:
                print(f" - [{t['$id']}] {t['name']}")
        except Exception as e:
            print(f"Error listing tables: {e}")
            
    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    list_collections()
