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
db_id = os.getenv('APPWRITE_DATABASE_ID')

def debug_data():
    print(f"DEBUGGING DATABASE: {db_id}")
    
    # 1. Shops
    shops = tables_db.list_rows(db_id, 'shops')
    print(f"\nSHOPS FOUND: {shops['total']}")
    for s in shops['rows']:
        print(f" - [{s['$id']}] {s['name']} (Owner: {s['owner_id']})")
        
    # 2. Reports
    reports = tables_db.list_rows(db_id, 'gst_reports')
    print(f"\nREPORTS FOUND: {reports['total']}")
    for r in reports['rows']:
        print(f" - [{r['$id']}] Shop: {r['shop_id']}, Period: {r['period']}, Sales: {r['total_sales']}")

if __name__ == "__main__":
    debug_data()
