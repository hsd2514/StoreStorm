"""
Delivery System Dry Run
Demonstrates complete delivery workflow for a specific delivery partner
"""
import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
SHOP_ID = "your-shop-id-here"  # Replace with actual shop ID

# Delivery Partner for this dry run
DELIVERY_PARTNER = {
    "name": "Rajesh Kumar",
    "phone": "+91 98765 43210",
    "vehicle": "bike"
}

print("=" * 80)
print("STORESTORM DELIVERY SYSTEM - DRY RUN")
print(f"Delivery Partner: {DELIVERY_PARTNER['name']} ({DELIVERY_PARTNER['vehicle']})")
print("=" * 80)
print()

# Step 1: Create Sample Orders
print("STEP 1: Creating Sample Orders")
print("-" * 80)

sample_orders = [
    {
        "customer_id": "CUST-001",
        "delivery_address": "123 MG Road, Bangalore",
        "items": [{"product_id": "prod-1", "quantity": 2, "price": 50}],
        "total_amount": 100,
        "status": "confirmed"
    },
    {
        "customer_id": "CUST-002",
        "delivery_address": "456 Brigade Road, Bangalore",
        "items": [{"product_id": "prod-2", "quantity": 1, "price": 75}],
        "total_amount": 75,
        "status": "confirmed"
    },
    {
        "customer_id": "CUST-003",
        "delivery_address": "789 Koramangala 4th Block, Bangalore",
        "items": [{"product_id": "prod-3", "quantity": 3, "price": 30}],
        "total_amount": 90,
        "status": "confirmed"
    },
    {
        "customer_id": "CUST-004",
        "delivery_address": "321 Indiranagar 100 Feet Road, Bangalore",
        "items": [{"product_id": "prod-4", "quantity": 1, "price": 120}],
        "total_amount": 120,
        "status": "confirmed"
    },
    {
        "customer_id": "CUST-005",
        "delivery_address": "654 HSR Layout Sector 1, Bangalore",
        "items": [{"product_id": "prod-5", "quantity": 2, "price": 40}],
        "total_amount": 80,
        "status": "confirmed"
    }
]

created_order_ids = []

for idx, order in enumerate(sample_orders, 1):
    order['shop_id'] = SHOP_ID
    order['order_number'] = f"ORD-{datetime.now().strftime('%Y%m%d')}-{idx:03d}"
    
    # In real scenario, POST to /orders/
    # For dry run, we'll simulate
    print(f"  ✓ Created Order {order['order_number']}: {order['delivery_address']}")
    print(f"    Customer: {order['customer_id']}, Amount: ₹{order['total_amount']}")
    
    # Simulate order ID
    order_id = f"order_{idx}"
    created_order_ids.append(order_id)

print(f"\n✓ Created {len(created_order_ids)} confirmed orders ready for delivery")
print()

# Step 2: Create Delivery Route
print("STEP 2: Creating Delivery Route with Route Optimization")
print("-" * 80)

route_payload = {
    "shop_id": SHOP_ID,
    "order_ids": created_order_ids,
    "crate_capacity": 10,
    "delivery_partner": DELIVERY_PARTNER
}

print(f"Input:")
print(f"  • Orders to deliver: {len(created_order_ids)}")
print(f"  • Crate capacity: {route_payload['crate_capacity']} orders/crate")
print(f"  • Delivery partner: {DELIVERY_PARTNER['name']}")
print()

# Simulate route creation response
print("Route Calculation:")
print("  ➜ Fetching customer addresses...")
print("  ➜ Generating coordinates from addresses...")
print("  ➜ Applying Haversine distance calculation...")
print("  ➜ Running nearest-neighbor TSP algorithm...")
print()

# Mock route result
mock_route = {
    "id": "delivery_001",
    "batch_number": f"BATCH-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
    "shop_id": SHOP_ID,
    "order_ids": created_order_ids,
    "status": "planned",
    "crates": [
        {
            "id": "crate-1",
            "capacity": 10,
            "assigned_order_ids": created_order_ids
        }
    ],
    "capacity_used": len(created_order_ids),
    "route_stops": [
        {
            "order_id": created_order_ids[1],
            "customer_name": "CUST-002",
            "address": "456 Brigade Road, Bangalore",
            "latitude": 12.9698,
            "longitude": 77.5990,
            "status": "current",
            "sequence": 1
        },
        {
            "order_id": created_order_ids[0],
            "customer_name": "CUST-001",
            "address": "123 MG Road, Bangalore",
            "latitude": 12.9750,
            "longitude": 77.6065,
            "status": "pending",
            "sequence": 2
        },
        {
            "order_id": created_order_ids[2],
            "customer_name": "CUST-003",
            "address": "789 Koramangala 4th Block, Bangalore",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "status": "pending",
            "sequence": 3
        },
        {
            "order_id": created_order_ids[3],
            "customer_name": "CUST-004",
            "address": "321 Indiranagar 100 Feet Road, Bangalore",
            "latitude": 12.9784,
            "longitude": 77.6408,
            "status": "pending",
            "sequence": 4
        },
        {
            "order_id": created_order_ids[4],
            "customer_name": "CUST-005",
            "address": "654 HSR Layout Sector 1, Bangalore",
            "latitude": 12.9121,
            "longitude": 77.6446,
            "status": "pending",
            "sequence": 5
        }
    ],
    "route_geometry": {
        "type": "LineString",
        "coordinates": [
            [77.5946, 12.9716],  # Shop
            [77.5990, 12.9698],  # Stop 1
            [77.6065, 12.9750],  # Stop 2
            [77.6245, 12.9352],  # Stop 3
            [77.6408, 12.9784],  # Stop 4
            [77.6446, 12.9121]   # Stop 5
        ]
    },
    "total_distance": 18.45,  # km
    "estimated_time": 58,  # minutes
    "delivery_partner": DELIVERY_PARTNER
}

print("✓ Route Created Successfully!")
print(f"  • Batch Number: {mock_route['batch_number']}")
print(f"  • Total Distance: {mock_route['total_distance']} km")
print(f"  • Estimated Time: {mock_route['estimated_time']} minutes")
print(f"  • Number of Stops: {len(mock_route['route_stops'])}")
print(f"  • Crates Used: {len(mock_route['crates'])}")
print()

print("Optimized Route Sequence:")
for stop in mock_route['route_stops']:
    print(f"  {stop['sequence']}. {stop['address']}")
    print(f"     → Customer: {stop['customer_name']}, Status: {stop['status'].upper()}")
print()

# Step 3: Status Transitions
print("STEP 3: Delivery Workflow - Status Transitions")
print("-" * 80)
print()

# Transition 1: Shop Owner marks ready
print("⏰ 08:00 AM - Shop Owner marks route as READY_FOR_PICKUP")
print(f"  Actor: shop_owner")
print(f"  Transition: planned → READY_FOR_PICKUP")
print(f"  ✓ Transition successful")
print(f"  Status: READY_FOR_PICKUP")
print()

# Transition 2: Delivery partner picks up
print("⏰ 08:30 AM - Rajesh Kumar picks up the delivery")
print(f"  Actor: delivery_partner (Rajesh Kumar)")
print(f"  Transition: READY_FOR_PICKUP → PICKED_UP")
print(f"  ✓ Transition successful")
print(f"  Status: PICKED_UP")
print(f"  Started At: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Transition 3: Auto to in transit
print("⏰ 08:31 AM - System auto-transitions to IN_TRANSIT")
print(f"  Actor: system")
print(f"  Transition: PICKED_UP → IN_TRANSIT")
print(f"  ✓ Transition successful")
print(f"  Status: IN_TRANSIT")
print()

# Step 4: Delivery Progress
print("STEP 4: Live Delivery Progress")
print("-" * 80)
print()

print("🚴 Rajesh Kumar is now on the route!")
print()

delivery_timeline = [
    ("08:45 AM", 1, "456 Brigade Road, Bangalore", "CUST-002", "delivered"),
    ("09:00 AM", 2, "123 MG Road, Bangalore", "CUST-001", "delivered"),
    ("09:20 AM", 3, "789 Koramangala 4th Block, Bangalore", "CUST-003", "delivered"),
    ("09:45 AM", 4, "321 Indiranagar 100 Feet Road, Bangalore", "CUST-004", "current"),
    ("--:--", 5, "654 HSR Layout Sector 1, Bangalore", "CUST-005", "pending"),
]

for time, seq, address, customer, status in delivery_timeline:
    status_icon = {
        "delivered": "✅",
        "current": "🚴",
        "pending": "⏳"
    }
    print(f"  {status_icon[status]} Stop #{seq} - {time if time != '--:--' else 'Upcoming'}")
    print(f"     {address}")
    print(f"     Customer: {customer} | Status: {status.upper()}")
    print()

# Step 5: Completion
print("STEP 5: Delivery Completion")
print("-" * 80)
print()

print("⏰ 10:15 AM - All deliveries completed")
print(f"  Actor: delivery_partner (Rajesh Kumar)")
print(f"  Transition: IN_TRANSIT → DELIVERED")
print(f"  ✓ All {len(mock_route['route_stops'])} stops delivered successfully")
print(f"  Completed At: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Step 6: Summary Report
print("=" * 80)
print("DELIVERY SUMMARY REPORT")
print("=" * 80)
print()

print(f"Batch Number: {mock_route['batch_number']}")
print(f"Delivery Partner: {DELIVERY_PARTNER['name']} ({DELIVERY_PARTNER['phone']})")
print(f"Vehicle: {DELIVERY_PARTNER['vehicle'].upper()}")
print()

print("Performance Metrics:")
print(f"  • Total Orders Delivered: {len(created_order_ids)}")
print(f"  • Total Distance Covered: {mock_route['total_distance']} km")
print(f"  • Estimated Time: {mock_route['estimated_time']} min")
print(f"  • Actual Time: 1h 45min")
print(f"  • Efficiency: {(mock_route['estimated_time'] / 105) * 100:.1f}%")
print()

print("Financial Summary:")
total_revenue = sum([order['total_amount'] for order in sample_orders])
print(f"  • Total Order Value: ₹{total_revenue}")
print(f"  • Delivery Fee (estimated): ₹{len(created_order_ids) * 20}")
print()

print("Route Optimization Stats:")
print(f"  • Algorithm Used: Nearest-Neighbor TSP")
print(f"  • Computation Time: <50ms")
print(f"  • Distance Saved vs Random: ~25%")
print()

print("✅ Dry Run Completed Successfully!")
print("=" * 80)
