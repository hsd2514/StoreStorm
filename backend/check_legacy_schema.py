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

def check_schema():
    for coll in ['gst_reports', 'orders']:
        print(f"\nSCHEMA FOR: {coll}")
        try:
            res = tables_db.get_table(db_id, coll)
            # Some versions return attributes as 'attributes' or columns as 'columns' 
            # In TablesDB it's often 'attributes' in the response but sometimes SDK hides it
            # Let's print the keys first
            print(f"Available keys: {res.keys()}")
            if 'attributes' in res:
                print(f"Attributes: {[a['key'] for a in res['attributes']]}")
            elif 'columns' in res:
                print(f"Columns: {[c['key'] for c in res['columns']]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
