"""
DELIVERY PARTNER DRY RUN - PUNE ROUTES
Creates test delivery data for Rajesh Kumar in Pune
"""
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.query import Query
from datetime import datetime
import json

# Appwrite config  
client = Client()
client.set_endpoint("https://nyc.cloud.appwrite.io/v1")
client.set_project("697d8a13002af46d00e6")
client.set_key("standard_2a9ee8481aac1d5e228eef3027b7cd276ce8b55368215c3d84e46d5456b9d4570a3f6953dc1fbcc2be833552412b5753fb9cc631f895cece72e768bb951a918d0bac3f673ae34f9f568443425240b8c5b1a7996a0c3b600d2974c460a771d558593567390a291a761e658eea7b20a881d37588106f9a8b0c8f666a6a8fd27719")

db = Databases(client)
DB_ID = "697da223000cae31da10"

print("=" * 60)
print("🚴 DELIVERY DRY RUN - PUNE ROUTE FOR RAJESH KUMAR")
print("=" * 60)

# Get shop
print("\n1. Finding shop...")
shops = db.list_documents(DB_ID, "shops", [Query.limit(1)])
if not shops['documents']:
    print("❌ No shop found!")
    exit()
    
shop = shops['documents'][0]
SHOP_ID = shop['$id']
print(f"   ✓ Shop: {shop.get('name', 'Shop')} ({SHOP_ID})")

# Create delivery with PUNE locations
print("\n2. Creating delivery route for PUNE...")

batch_num = f"PUNE-{datetime.now().strftime('%H%M%S')}"

# Pune Route Info - Shop pickup + 5 delivery stops
route_info = {
    "stops": [
        {"seq": 0, "name": "SHOP - Pickup Location", "addr": "MG Road, Camp (PICKUP)", "lat": 18.5204, "lon": 73.8567, "status": "delivered"},  # Shop pickup
        {"seq": 1, "name": "Priya Kulkarni", "addr": "FC Road, Shivajinagar", "lat": 18.5308, "lon": 73.8474, "status": "current"},
        {"seq": 2, "name": "Amit Deshmukh", "addr": "MG Road, Camp", "lat": 18.5204, "lon": 73.8567, "status": "pending"},
        {"seq": 3, "name": "Kavita Patil", "addr": "Koregaon Park", "lat": 18.5362, "lon": 73.8939, "status": "pending"},
        {"seq": 4, "name": "Rahul Joshi", "addr": "Baner Road", "lat": 18.5590, "lon": 73.7868, "status": "pending"},
        {"seq": 5, "name": "Sneha Gaikwad", "addr": "Kothrud", "lat": 18.5074, "lon": 73.8077, "status": "pending"}
    ],
    "geometry": [
        [73.8567, 18.5204],  # Shop START
        [73.8474, 18.5308],  # Stop 1 - FC Road
        [73.8567, 18.5204],  # Stop 2 - MG Road
        [73.8939, 18.5362],  # Stop 3 - Koregaon Park
        [73.7868, 18.5590],  # Stop 4 - Baner
        [73.8077, 18.5074]   # Stop 5 - Kothrud
    ],
    "total_km": 22.5,
    "est_mins": 65
}

delivery_data = {
    "shop_id": SHOP_ID,
    "batch_number": batch_num,
    "driver_name": "Rajesh Kumar",
    "driver_phone": "+91 98765 43210",
    "order_ids": json.dumps(["ORD-P001", "ORD-P002", "ORD-P003", "ORD-P004", "ORD-P005"]),
    "area": "Pune Central",
    "status": "pending",  # Ready for driver to accept
    "estimated_time": 65,
    "route_info": json.dumps(route_info)
}

try:
    delivery = db.create_document(DB_ID, "deliveries", ID.unique(), delivery_data)
    print(f"   ✓ Batch: {batch_num}")
    print(f"   ✓ ID: {delivery['$id']}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit()

print("\n" + "=" * 60)
print("✅ PUNE DELIVERY ROUTE CREATED!")
print("=" * 60)
print(f"""
📋 DELIVERY FOR RAJESH KUMAR:
   Batch: {batch_num}
   Driver: Rajesh Kumar 🚴
   Phone: +91 98765 43210
   Area: Pune Central  
   Status: PENDING (Ready to accept)
   Est. Time: 65 min
   Distance: 22.5 km

🗺️ PUNE ROUTE (6 stops):
   0. 🏪 SHOP - Pickup Location - MG Road, Camp (PICKED UP)
   1. 🔵 Priya Kulkarni - FC Road, Shivajinagar (CURRENT)
   2. ⚫ Amit Deshmukh - MG Road, Camp
   3. ⚫ Kavita Patil - Koregaon Park
   4. ⚫ Rahul Joshi - Baner Road
   5. ⚫ Sneha Gaikwad - Kothrud

👉 Open: http://localhost:5173/driver
   Enter phone: +91 98765 43210
   Click "Take Delivery" to accept!
""")
