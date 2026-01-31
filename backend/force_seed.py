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
# FORCE THE STALE DB ID
db_id = "697da223000cae31da10"
shop_id = "697e104b00190c0dc4c2"

def force_seed():
    print(f"FORCING GST SEED IN DB: {db_id} FOR SHOP: {shop_id}")
    
    period = "2026-01"
    gst_data = {
        "shop_id": shop_id,
        "period": period,
        "total_sales": 15450.0,
        "total_gst": 1240.0,
        "breakdown": json.dumps({"0": 200, "5": 450, "12": 590}),
        "status": "pending",
        "report_data": json.dumps({"status": "ready", "filing_deadline": "2026-02-15"}),
        "generated_at": datetime.now().isoformat()
    }
    
    try:
        res = tables_db.create_row(db_id, "gst_reports", ID.unique(), gst_data)
        print(f"✅ Success! Report created: {res['$id']}")
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    force_seed()
