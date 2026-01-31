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

print(f"DATABASE_ID: {db_id}")

try:
    print("\n--- SH局部 ---")
    shops = tables_db.list_rows(db_id, 'shops')
    print(f"Total Shops: {shops['total']}")
    for s in shops['rows']:
        print(f"Name: {s['name']}, ID: {s['$id']}, Owner: {s['owner_id']}")

    print("\n--- GST REPORTS ---")
    reports = tables_db.list_rows(db_id, 'gst_reports')
    print(f"Total Reports: {reports['total']}")
    for r in reports['rows']:
        print(f"ID: {r['$id']}, Shop: {r['shop_id']}, Period: {r['period']}, Sales: {r['total_sales']}")

    print("\n--- ORDERS ---")
    orders = tables_db.list_rows(db_id, 'orders', limit=5)
    print(f"Total Orders: {orders['total']}")
    for o in orders['rows']:
        print(f"ID: {o['$id']}, Shop: {o['shop_id']}, Number: {o['order_number']}, GST: {o['gst_amount']}")

except Exception as e:
    print(f"Error: {e}")
