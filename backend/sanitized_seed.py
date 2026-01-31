import os
import json
from datetime import datetime, timedelta
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.id import ID
from dotenv import load_dotenv

load_dotenv()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

tables_db = TablesDB(client)
db_id = "697da223000cae31da10"
shop_id = "697e104b00190c0dc4c2"

def sanitized_seed():
    print(f"🧹 SANITIZED SEEDING - DB: {db_id}")
    
    # 1. Clean existing (if any)
    try:
        res = tables_db.list_rows(db_id, 'gst_reports')
        for r in res['rows']:
            tables_db.delete_row(db_id, 'gst_reports', r['$id'])
    except: pass

    # 2. Seed GST Report (Jan 2026) - No 'report_data'
    gst_data = {
        "shop_id": shop_id,
        "period": "2026-01",
        "total_sales": 15450.0,
        "total_gst": 1240.0,
        "breakdown": json.dumps({"0": 200, "5": 450, "12": 590}),
        "status": "pending"
    }
    
    try:
        row = tables_db.create_row(db_id, "gst_reports", ID.unique(), gst_data)
        print(f"✅ GST Report Created: {row['$id']}")
    except Exception as e:
        print(f"❌ GST Failed: {e}")

    # 3. Seed Orders - No 'created_at' (Appwrite will set $createdAt)
    for i in range(3):
        order_data = {
            "shop_id": shop_id,
            "customer_id": "Seed Customer",
            "order_number": f"ORD-FINAL-{i+1}",
            "items": json.dumps([{"name": "Organic Rice", "qty": 1, "price": 120}]),
            "total_amount": 126.0,
            "gst_amount": 6.0,
            "status": "delivered",
            "source": "whatsapp"
        }
        try:
            tables_db.create_row(db_id, "orders", ID.unique(), order_data)
            print(f"✅ Order Created: {order_data['order_number']}")
        except Exception as e:
            print(f"❌ Order Failed: {e}")

if __name__ == "__main__":
    sanitized_seed()
