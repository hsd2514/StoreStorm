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
# THE ACTIVE LEGACY DB
db_id = "697da223000cae31da10"
shop_id = "697e104b00190c0dc4c2"

def seed_everything():
    print(f"🌟 SUPER SEEDING DB: {db_id} FOR SHOP: {shop_id}")
    
    # 1. Clean old reports for this shop
    try:
        res = tables_db.list_rows(db_id, 'gst_reports', queries=[f'equal("shop_id", "{shop_id}")'])
        for r in res['rows']:
            tables_db.delete_row(db_id, 'gst_reports', r['$id'])
            print(f"🗑️ Deleted old report: {r['$id']}")
    except: pass

    # 2. Seed GST Report (Jan 2026)
    gst_data = {
        "shop_id": shop_id,
        "period": "2026-01",
        "total_sales": 15450.0,
        "total_gst": 1240.0,
        "breakdown": json.dumps({"0": 200, "5": 450, "12": 590}),
        "status": "pending",
        "report_data": json.dumps({"status": "ready", "filing_deadline": "2026-02-15"}),
        "generated_at": datetime.now().isoformat()
    }
    res = tables_db.create_row(db_id, "gst_reports", ID.unique(), gst_data)
    print(f"✅ GST Report Created: {res['$id']}")

    # 3. Seed some dummy orders to make dashboard look alive
    for i in range(5):
        order_data = {
            "shop_id": shop_id,
            "customer_id": "test_customer",
            "order_number": f"ORD-100{i}",
            "items": json.dumps([{"name": "Rice", "qty": 2, "price": 100}]),
            "total_amount": 210.0,
            "gst_amount": 10.0,
            "status": "delivered" if i < 3 else "pending",
            "source": "storefront",
            "created_at": datetime.now().isoformat()
        }
        try:
            tables_db.create_row(db_id, "orders", ID.unique(), order_data)
            print(f"📦 Order Created: {order_data['order_number']}")
        except Exception as e:
            print(f"❌ Order Failed: {e}")

if __name__ == "__main__":
    seed_everything()
