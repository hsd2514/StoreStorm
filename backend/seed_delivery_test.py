"""
Seed test delivery data for dry run
Creates sample orders and a delivery route for testing
"""
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.query import Query
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Appwrite configuration
client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID')

def seed_delivery_data():
    """Seed sample orders and delivery route for testing"""
    
    print("🌱 Seeding delivery test data...")
    print("=" * 80)
    
    # Step 1: Fetch first shop from database
    print("\n🏪 Fetching shop...")
    try:
        shops = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id="shops",
            queries=[Query.limit(1)]
        )
        
        if not shops['documents']:
            print("  ✗ No shops found! Please create a shop first.")
            return
        
        shop = shops['documents'][0]
        SHOP_ID = shop['$id']
        print(f"  ✓ Using shop: {shop.get('name', 'Unknown')} (ID: {SHOP_ID})")
    except Exception as e:
        print(f"  ✗ Failed to fetch shop: {e}")
        return
    
    # Step 2: Create sample orders
    print("\n📦 Creating sample orders...")
    
    sample_orders = [
        {
            "order_number": f"ORD-{datetime.now().strftime('%Y%m%d')}-001",
            "shop_id": SHOP_ID,
            "customer_id": "Priya Sharma",
            "source": "storefront",
            "delivery_address": "123 MG Road, Bangalore",
            "items": [{
                "product_id": "prod-1",
                "product_name": "Rice",
                "quantity": 2.0,
                "unit": "kg",
                "price": 50.0,
                "total": 100.0
            }],
            "total_amount": 100.0,
            "gst_amount": 5.0,
            "status": "confirmed"
        },
        {
            "order_number": f"ORD-{datetime.now().strftime('%Y%m%d')}-002",
            "shop_id": SHOP_ID,
            "customer_id": "Amit Verma",
            "source": "storefront",
            "delivery_address": "456 Brigade Road, Bangalore",
            "items": [{
                "product_id": "prod-2",
                "product_name": "Wheat Flour",
                "quantity": 1.0,
                "unit": "kg",
                "price": 75.0,
                "total": 75.0
            }],
            "total_amount": 75.0,
            "gst_amount": 3.75,
            "status": "confirmed"
        },
        {
            "order_number": f"ORD-{datetime.now().strftime('%Y%m%d')}-003",
            "shop_id": SHOP_ID,
            "customer_id": "Kavita Reddy",
            "source": "storefront",
            "delivery_address": "789 Koramangala 4th Block, Bangalore",
            "items": [{
                "product_id": "prod-3",
                "product_name": "Sugar",
                "quantity": 3.0,
                "unit": "kg",
                "price": 30.0,
                "total": 90.0
            }],
            "total_amount": 90.0,
            "gst_amount": 4.5,
            "status": "confirmed"
        },
        {
            "order_number": f"ORD-{datetime.now().strftime('%Y%m%d')}-004",
            "shop_id": SHOP_ID,
            "customer_id": "Ravi Kumar",
            "source": "storefront",
            "delivery_address": "321 Indiranagar 100 Feet Road, Bangalore",
            "items": [{
                "product_id": "prod-4",
                "product_name": "Cooking Oil",
                "quantity": 1.0,
                "unit": "L",
                "price": 120.0,
                "total": 120.0
            }],
            "total_amount": 120.0,
            "gst_amount": 6.0,
            "status": "confirmed"
        },
        {
            "order_number": f"ORD-{datetime.now().strftime('%Y%m%d')}-005",
            "shop_id": SHOP_ID,
            "customer_id": "Sneha Patel",
            "source": "storefront",
            "delivery_address": "654 HSR Layout Sector 1, Bangalore",
            "items": [{
                "product_id": "prod-5",
                "product_name": "Dal",
                "quantity": 2.0,
                "unit": "kg",
                "price": 40.0,
                "total": 80.0
            }],
            "total_amount": 80.0,
            "gst_amount": 4.0,
            "status": "confirmed"
        }
    ]
    
    created_order_ids = []
    
    for order in sample_orders:
        try:
            # Convert items to JSON string for Appwrite
            order_data = order.copy()
            order_data['items'] = json.dumps(order['items'])
            
            created = databases.create_document(
                database_id=DATABASE_ID,
                collection_id="orders",
                document_id=ID.unique(),
                data=order_data
            )
            created_order_ids.append(created['$id'])
            print(f"  ✓ Created {order['order_number']}: {order['customer_id']}")
        except Exception as e:
            print(f"  ✗ Failed to create order {order['order_number']}: {e}")
    
    if not created_order_ids:
        print("\n✗ No orders were created. Cannot proceed.")
        return
    
    print(f"\n✓ Created {len(created_order_ids)} orders")
    
    # Step 3: Create delivery route
    print("\n🗺️  Creating delivery route...")
    
    # Calculate route stops with coordinates
    route_stops = [
        {
            "order_id": created_order_ids[1] if len(created_order_ids) > 1 else created_order_ids[0],
            "customer_name": "Amit Verma",
            "address": "456 Brigade Road, Bangalore",
            "latitude": 12.9698,
            "longitude": 77.5990,
            "status": "current",
            "sequence": 1
        },
        {
            "order_id": created_order_ids[0],
            "customer_name": "Priya Sharma",
            "address": "123 MG Road, Bangalore",
            "latitude": 12.9750,
            "longitude": 77.6065,
            "status": "pending",
            "sequence": 2
        },
    ]
    
    if len(created_order_ids) > 2:
        route_stops.append({
            "order_id": created_order_ids[2],
            "customer_name": "Kavita Reddy",
            "address": "789 Koramangala 4th Block, Bangalore",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "status": "pending",
            "sequence": 3
        })
    
    if len(created_order_ids) > 3:
        route_stops.append({
            "order_id": created_order_ids[3],
            "customer_name": "Ravi Kumar",
            "address": "321 Indiranagar 100 Feet Road, Bangalore",
            "latitude": 12.9784,
            "longitude": 77.6408,
            "status": "pending",
            "sequence": 4
        })
    
    if len(created_order_ids) > 4:
        route_stops.append({
            "order_id": created_order_ids[4],
            "customer_name": "Sneha Patel",
            "address": "654 HSR Layout Sector 1, Bangalore",
            "latitude": 12.9121,
            "longitude": 77.6446,
            "status": "pending",
            "sequence": 5
        })
    
    # Create route geometry
    route_coords = [[77.5946, 12.9716]]  # Shop starting point
    for stop in route_stops:
        route_coords.append([stop['longitude'], stop['latitude']])
    
    route_geometry = {
        "type": "LineString",
        "coordinates": route_coords
    }
    
    delivery_data = {
        "shop_id": SHOP_ID,
        "batch_number": f"BATCH-RAJESH-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "order_ids": created_order_ids,
        "status": "PICKED_UP",  # Ready for delivery partner to view
        "crates": [
            {
                "id": "crate-1",
                "capacity": 10,
                "assigned_order_ids": created_order_ids
            }
        ],
        "capacity_used": len(created_order_ids),
        "route_stops": route_stops,
        "route_geometry": route_geometry,
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
        created_delivery = databases.create_document(
            database_id=DATABASE_ID,
            collection_id="deliveries",
            document_id=ID.unique(),
            data=delivery_data
        )
        print(f"  ✓ Created delivery route: {delivery_data['batch_number']}")
        print(f"  ✓ Delivery ID: {created_delivery['$id']}")
        print(f"  ✓ Partner: {delivery_data['delivery_partner']['name']}")
        print(f"  ✓ Status: {delivery_data['status']}")
        print(f"  ✓ Stops: {len(route_stops)}")
        print(f"  ✓ Distance: {delivery_data['total_distance']} km")
    except Exception as e:
        print(f"  ✗ Failed to create delivery: {e}")
        return
    
    print("\n" + "=" * 80)
    print("✅ Test data seeded successfully!")
    print("\n📋 Next Steps:")
    print("1. Open http://localhost:5173/delivery in your browser")
    print("2. You should see the delivery route card for Rajesh Kumar")
    print("3. Click 'View Map' button to see the interactive Leaflet map")
    print("4. The map will show:")
    print("   • Purple shop marker (starting point)")
    print("   • Numbered stop markers (1, 2, 3...)")
    print("   • Purple dashed route line connecting all stops")
    print("5. Click markers to see customer details")
    print("6. Use status buttons to transition delivery states")
    print("=" * 80)

if __name__ == "__main__":
    seed_delivery_data()
