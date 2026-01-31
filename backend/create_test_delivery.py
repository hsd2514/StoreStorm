"""
Create test delivery route via API
Uses the backend API directly for clean data seeding
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("🌱 CREATING TEST DELIVERY ROUTE FOR RAJESH KUMAR")
print("=" * 80)
print()

# Step 1: Get shop ID
print("🏪 Step 1: Fetching shop...")
try:
    response = requests.get(f"{BASE_URL}/shops/?limit=1")
    response.raise_for_status()
    shops = response.json()
    
    if not shops:
        print("  ✗ No shops found. Please create a shop first.")
        exit(1)
    
    shop = shops[0]
    SHOP_ID = shop['id']
    print(f"  ✓ Using shop: {shop.get('name', 'Unknown')} (ID: {SHOP_ID})")
except Exception as e:
    print(f"  ✗ Failed to fetch shop: {e}")
    exit(1)

print()

# Step 2: Create test orders
print("📦 Step 2: Creating 5 test orders...")

sample_orders = [
    {
        "shop_id": SHOP_ID,
        "customer_id": "Priya Sharma",
        "order_number": "TEST-001",
        "source": "storefront",
        "delivery_address": "123 MG Road, Bangalore",
        "items": json.dumps([{
            "product_id": "test-1",
            "product_name": "Rice",
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
        "order_number": "TEST-002",
        "source": "storefront",
        "delivery_address": "456 Brigade Road, Bangalore",
        "items": json.dumps([{
            "product_id": "test-2",
            "product_name": "Wheat Flour",
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
        "order_number": "TEST-003",
        "source": "storefront",
        "delivery_address": "789 Koramangala 4th Block, Bangalore",
        "items": json.dumps([{
            "product_id": "test-3",
            "product_name": "Sugar",
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
        "order_number": "TEST-004",
        "source": "storefront",
        "delivery_address": "321 Indiranagar 100 Feet Road, Bangalore",
        "items": json.dumps([{
            "product_id": "test-4",
            "product_name": "Cooking Oil",
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
        "order_number": "TEST-005",
        "source": "storefront",
        "delivery_address": "654 HSR Layout Sector 1, Bangalore",
        "items": json.dumps([{
            "product_id": "test-5",
            "product_name": "Dal",
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

created_order_ids = []

for order in sample_orders:
    try:
        response = requests.post(f"{BASE_URL}/orders/", json=order)
        response.raise_for_status()
        created_order = response.json()
        created_order_ids.append(created_order['id'])
        print(f"  ✓ Created {order['order_number']}: {order['customer_id']}")
    except requests.exceptions.HTTPError as e:
        # Order might already exist, try to fetch it
        try:
            response = requests.get(f"{BASE_URL}/orders/?shop_id={SHOP_ID}&order_number={order['order_number']}")
            orders_list = response.json()
            if orders_list and'orders' in orders_list and orders_list['orders']:
                created_order_ids.append(orders_list['orders'][0]['id'])
                print(f"  ⚠️  Order {order['order_number']} already exists, using existing")
            else:
                print(f"  ✗ Failed to create order {order['order_number']}: {e}")
        except:
            print(f"  ✗ Failed to create order {order['order_number']}: {e}")

if len(created_order_ids) == 0:
    print("\n✗ No orders created. Cannot proceed.")
    exit(1)

print(f"\n✓ Ready with {len(created_order_ids)} orders")
print()

# Step 3: Create delivery route
print("🗺️  Step 3: Creating delivery route...")

route_data = {
    "shop_id": SHOP_ID,
    "order_ids": created_order_ids,
    "crate_capacity": 10,
    "delivery_partner": {
        "name": "Rajesh Kumar",
        "phone": "+91 98765 43210",
        "vehicle": "bike"
    }
}

try:
    response = requests.post(f"{BASE_URL}/deliveries/create-route", json=route_data)
    response.raise_for_status()
    delivery = response.json()
    
    print(f"  ✓ Route created successfully!")
    print(f"  • Batch: {delivery['batch_number']}")
    print(f"  • Partner: {delivery['delivery_partner']['name']}")
    print(f"  • Stops: {len(delivery['route_stops'])}")
    print(f"  • Distance: {delivery['total_distance']} km")
    print(f"  • Est. Time: {delivery['estimated_time']} min")
    print(f"  • Status: {delivery['status']}")
    
except requests.exceptions.HTTPError as e:
    print(f"  ✗ Failed to create route: {e}")
    print(f"  Response: {e.response.text if e.response else 'No response'}")
    exit(1)

print()
print("=" * 80)
print("✅ TEST DELIVERY ROUTE CREATED SUCCESSFULLY!")
print("=" * 80)
print()
print("📋 Next Steps:")
print("1. Open http://localhost:5173/delivery")
print("2. Look for batch:", delivery['batch_number'])
print("3. Click 'View Map' to see the interactive route")
print()
print("🗺️  Route Details:")
for stop in delivery['route_stops']:
    status_emoji = "🔵" if stop['status'] == 'current' else "⚫" if stop['status'] == 'pending' else "✅"
    print(f"  {status_emoji} Stop #{stop['sequence']}: {stop['customer_name']}")
    print(f"     {stop['address']}")
print()
print("=" * 80)
