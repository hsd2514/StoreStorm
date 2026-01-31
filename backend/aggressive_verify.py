import os
import json
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.id import ID

load_dotenv()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

tables_db = TablesDB(client)
db_id = "697da223000cae31da10"
shop_id = "697e104b00190c0dc4c2"

def aggressive_verification():
    print(f"🕵️ AGGRESSIVE VERIFICATION - DB: {db_id}")
    
    # 1. List ALL tables to double check IDs
    tables = tables_db.list_tables(db_id)
    print(f"Tables available: {[t['$id'] for t in tables['tables']]}")
    
    # 2. Check gst_reports content regardless of shop_id
    try:
        res = tables_db.list_rows(db_id, 'gst_reports')
        print(f"Total rows in 'gst_reports': {res['total']}")
        for r in res['rows']:
            print(f" - Row: {r['$id']}, Shop: {r['shop_id']}, Period: {r['period']}")
    except Exception as e:
        print(f"Error listing gst_reports: {e}")

    # 3. If 0, try to create ONE row and see if it appears immediately
    if True: # Always try one
        print("\nAttempting to create ONE probe report...")
        gst_data = {
            "shop_id": shop_id,
            "period": "PROBE",
            "total_sales": 1.0,
            "total_gst": 1.0,
            "breakdown": "{}",
            "status": "pending"
        }
        try:
            new_row = tables_db.create_row(db_id, "gst_reports", ID.unique(), gst_data)
            print(f"✅ Created probe row: {new_row['$id']}")
            
            # Re-list
            res2 = tables_db.list_rows(db_id, 'gst_reports')
            print(f"New total rows: {res2['total']}")
        except Exception as e:
            print(f"❌ Creation failed: {e}")

if __name__ == "__main__":
    aggressive_verification()
