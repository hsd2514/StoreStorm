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
# Specifically checking the database the user is stuck on
db_id = "697da223000cae31da10"
shop_id = "697e104b00190c0dc4c2"

def verify_reports():
    print(f"VERIFYING REPORTS IN DB: {db_id}")
    print(f"TARGET SHOP: {shop_id}")
    
    try:
        # 1. Check Shop existence again to be 100% sure
        shop = tables_db.get_row(db_id, 'shops', shop_id)
        print(f"✅ Shop exists: {shop['name']}")
        
        # 2. List all reports in this DB
        reports = tables_db.list_rows(db_id, 'gst_reports')
        print(f"\nTOTAL REPORTS IN DB: {reports['total']}")
        
        found_count = 0
        for r in reports['rows']:
            if r['shop_id'] == shop_id:
                found_count += 1
                print(f"MATCHED REPORT:")
                print(f" - ID: {r['$id']}")
                print(f" - Period: {r['period']}")
                print(f" - Sales: {r['total_sales']}")
                print(f" - Breakdown: {r['breakdown']}")
        
        if found_count == 0:
            print(f"❌ No reports found for shop {shop_id} in this collection.")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    verify_reports()
