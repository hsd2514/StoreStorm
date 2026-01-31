"""
Complete working script to create test delivery route
Uses proper Appwrite SDK syntax
"""
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.query import Query

# Load environment
load_dotenv()

# Setup Appwrite client
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID')

def create_test_delivery():
    """Create complete test delivery with orders and route"""
    
    print("=" * 80)
    print("🚀 CREATING TEST DELIVERY FOR RAJESH KUMAR")
    print("=" * 80)
    print()
    
    # Step 1: Get shop
    print("🏪 Step 1: Getting shop...")
    try:
        shops = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="shops",
            queries=[Query.limit(1)]
        )
        
        if not shops['documents']:
            print("  ✗ No shops found! Please register a shop first.")
            return
        
        shop = shops['documents'][0]
        SHOP_ID = shop['$id']
        shop_name = shop.get('name', 'Unknown Shop')
        print(f"  ✓ Using shop: {shop_name} (ID: {SHOP_ID})")
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return
    
    print()
    
    # Step 2: Create orders
    print("📦 Step 2: Creating test orders...")
    
    timestamp = datetime.now().strftime('%H%M%S')
    
    test_orders = [
        {
            "shop_id": SHOP_ID,
            "customer_id": "Priya Sharma",
            "order_number": f"DRY-{timestamp}-001",
            "source": "storefront",
            "delivery_address": "123 MG Road, Bangalore",
            "items": json.dumps([{
                "product_id": "test-1",
                "product_name": "Premium Basmati Rice",
                "quantity": 2.0,
                "unit": "kg",
                "price": 50.0,
                "total": 100.0
            }]),
            "total_amount": 100.0,
            "gst_amount": 5.0,
            "status": "confirmed"
        },
        {
            "shop_id": SHOP_ID,
            "customer_id": "Amit Verma",
            "order_number": f"DRY-{timestamp}-002",
            "source": "storefront",
            "delivery_address": "456 Brigade Road, Bangalore",
            "items": json.dumps([{
                "product_id": "test-2",
                "product_name": "Organic Wheat Flour",
                "quantity": 1.0,
                "unit": "kg",
                "price": 75.0,
                "total": 75.0
            }]),
            "total_amount": 75.0,
            "gst_amount": 3.75,
            "status": "confirmed"
        },
        {
            "shop_id": SHOP_ID,
            "customer_id": "Kavita Reddy",
            "order_number": f"DRY-{timestamp}-003",
            "source": "storefront",
            "delivery_address": "789 Koramangala 4th Block, Bangalore",
            "items": json.dumps([{
                "product_id": "test-3",
                "product_name": "White Sugar",
                "quantity": 3.0,
                "unit": "kg",
                "price": 30.0,
                "total": 90.0
            }]),
            "total_amount": 90.0,
            "gst_amount": 4.5,
            "status": "confirmed"
        },
        {
            "shop_id": SHOP_ID,
            "customer_id": "Ravi Kumar",
            "order_number": f"DRY-{timestamp}-004",
            "source": "storefront",
            "delivery_address": "321 Indiranagar 100 Feet Road, Bangalore",
            "items": json.dumps([{
                "product_id": "test-4",
                "product_name": "Sunflower Oil",
                "quantity": 1.0,
                "unit": "L",
                "price": 120.0,
                "total": 120.0
            }]),
            "total_amount": 120.0,
            "gst_amount": 6.0,
            "status": "confirmed"
        },
        {
            "shop_id": SHOP_ID,
            "customer_id": "Sneha Patel",
            "order_number": f"DRY-{timestamp}-005",
            "source": "storefront",
            "delivery_address": "654 HSR Layout Sector 1, Bangalore",
            "items": json.dumps([{
                "product_id": "test-5",
                "product_name": "Toor Dal",
                "quantity": 2.0,
                "unit": "kg",
                "price": 40.0,
                "total": 80.0
            }]),
            "total_amount": 80.0,
            "gst_amount": 4.0,
            "status": "confirmed"
        }
    ]
    
    order_ids = []
    
    for order in test_orders:
        try:
            created = databases.create_document(
                database_id=DATABASE_ID,
                collection_id="orders",
                document_id=ID.unique(),
                data=order
            )
            order_ids.append(created['$id'])
            print(f"  ✓ {order['order_number']}: {order['customer_id']} - ₹{order['total_amount']}")
        except Exception as e:
            print(f"  ✗ Failed {order['order_number']}: {e}")
    
    if not order_ids:
        print("\n✗ No orders created. Cannot continue.")
        return
    
    print(f"\n✓ Created {len(order_ids)} confirmed orders")
    print()
    
    # Step 3: Create delivery route
    print("🗺️  Step 3: Creating delivery route with Rajesh Kumar...")
    
    # Build route stops
    route_stops = [
        {
            "order_id": order_ids[1] if len(order_ids) > 1 else order_ids[0],
            "customer_name": "Amit Verma",
            "address": "456 Brigade Road, Bangalore",
            "latitude": 12.9698,
            "longitude": 77.5990,
            "status": "current",
            "sequence": 1
        },
        {
            "order_id": order_ids[0],
            "customer_name": "Priya Sharma",
            "address": "123 MG Road, Bangalore",
            "latitude": 12.9750,
            "longitude": 77.6065,
            "status": "pending",
            "sequence": 2
        }
    ]
    
    if len(order_ids) > 2:
        route_stops.append({
            "order_id": order_ids[2],
            "customer_name": "Kavita Reddy",
            "address": "789 Koramangala 4th Block, Bangalore",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "status": "pending",
            "sequence": 3
        })
    
    if len(order_ids) > 3:
        route_stops.append({
            "order_id": order_ids[3],
            "customer_name": "Ravi Kumar",
            "address": "321 Indiranagar 100 Feet Road, Bangalore",
            "latitude": 12.9784,
            "longitude": 77.6408,
            "status": "pending",
            "sequence": 4
        })
    
    if len(order_ids) > 4:
        route_stops.append({
            "order_id": order_ids[4],
            "customer_name": "Sneha Patel",
            "address": "654 HSR Layout Sector 1, Bangalore",
            "latitude": 12.9121,
            "longitude": 77.6446,
            "status": "pending",
            "sequence": 5
        })
    
    # Create route geometry
    route_coords = [[77.5946, 12.9716]]  # Shop
    for stop in route_stops:
        route_coords.append([stop['longitude'], stop['latitude']])
    
    delivery_data = {
        "shop_id": SHOP_ID,
        "batch_number": f"RAJESH-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "order_ids": order_ids,
        "status": "PICKED_UP",
        "crates": [
            {
                "id": "crate-1",
                "capacity": 10,
                "assigned_order_ids": order_ids
            }
        ],
        "capacity_used": len(order_ids),
        "route_stops": route_stops,
        "route_geometry": {
            "type": "LineString",
            "coordinates": route_coords
        },
        "total_distance": 18.45,
        "estimated_time": 58,
        "delivery_partner": {
            "name": "Rajesh Kumar",
            "phone": "+91 98765 43210",
            "vehicle": "bike"
        },
        "started_at": datetime.utcnow().isoformat()
    }
    
    try:
        delivery = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=ID.unique(),
            data=delivery_data
        )
        
        print(f"  ✓ Route created: {delivery_data['batch_number']}")
        print(f"  • Delivery ID: {delivery['$id']}")
        print(f"  • Partner: {delivery_data['delivery_partner']['name']} 🚴")
        print(f"  • Vehicle: {delivery_data['delivery_partner']['vehicle']}")
        print(f"  • Phone: {delivery_data['delivery_partner']['phone']}")
        print(f"  • Status: {delivery_data['status']}")
        print(f"  • Stops: {len(route_stops)}")
        print(f"  • Distance: {delivery_data['total_distance']} km")
        print(f"  • Est. Time: {delivery_data['estimated_time']} min")
        
    except Exception as e:
        print(f"  ✗ Failed to create delivery: {e}")
        return
    
    print()
    print("=" * 80)
    print("✅ TEST DELIVERY CREATED SUCCESSFULLY!")
    print("=" * 80)
    print()
    print("🗺️  Route Sequence:")
    for stop in route_stops:
        icon = "🔵" if stop['status'] == 'current' else "⚫"
        print(f"  {icon} Stop #{stop['sequence']}: {stop['customer_name']}")
        print(f"     📍 {stop['address']}")
    print()
    print("📋 Next Steps:")
    print("  1. Open: http://localhost:5173/delivery")
    print(f"  2. Look for batch: {delivery_data['batch_number']}")
    print("  3. Click 'View Map' button")
    print("  4. See the interactive Leaflet map with:")
    print("     • 🟣 Purple shop marker (start)")
    print("     • 1️⃣ 2️⃣ 3️⃣ Numbered delivery stops")
    print("     • Purple dashed route line")
    print("  5. Click markers for customer details")
    print("  6. Use status buttons to manage delivery")
    print()
    print("=" * 80)

if __name__ == "__main__":
    create_test_delivery()
