import json
import random
from datetime import datetime, timedelta
from appwrite.id import ID
from appwrite.query import Query
from config.appwrite import client, tables_db, users, DATABASE_ID

# Test Data
USER_EMAIL = "test@storestorm.com"
USER_PWD = "password123"
USER_NAME = "Test Merchant"
SHOP_NAME = "Storm Mart Central"

def seed_everything():
    print("=" * 60)
    print("🚀 SEEDING TEST USER & SHOP DATA")
    print("=" * 60)

    # 1. User
    print("\n1. Checking for existing user...")
    try:
        user_list = users.list(search=USER_EMAIL)
        if user_list['users']:
            user = user_list['users'][0]
            print(f"   ✓ User already exists: {user['email']}")
        else:
            user = users.create(ID.unique(), USER_EMAIL, USER_PWD, name=USER_NAME)
            print(f"   ✓ User created: {user['email']}")
        user_id = user['$id']
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return

    # 2. Shop
    print("\n2. Checking for shop...")
    shops = tables_db.list_rows(DATABASE_ID, "shops", [Query.equal("owner_id", user_id)])
    if shops['rows']:
        shop = shops['rows'][0]
        print(f"   ✓ Shop exists: {shop['name']}")
    else:
        shop = tables_db.create_row(DATABASE_ID, "shops", ID.unique(), {
            "name": SHOP_NAME, "owner_id": user_id, "phone": "+91 99999 88888",
            "address": "123 Tech Park, Bangalore", "category": "grocery", 
            "is_active": True, "latitude": 12.9716, "longitude": 77.5946
        })
        print(f"   ✓ Shop created: {shop['name']}")
    shop_id = shop['$id']

    # 3. Products & Inventory
    print("\n3. Seeding products & inventory...")
    sample_products = [
        {"name": "Organic Rice", "category": "Grains", "price": 85.0, "unit": "kg", "gst_rate": 5},
        {"name": "Sunflower Oil", "category": "Oil", "price": 145.0, "unit": "L", "gst_rate": 12},
        {"name": "Wheat Flour", "category": "Grains", "price": 45.0, "unit": "kg", "gst_rate": 5},
        {"name": "Fresh Milk", "category": "Dairy", "price": 32.0, "unit": "L", "gst_rate": 0},
        {"name": "Moong Dal", "category": "Pulses", "price": 120.0, "unit": "kg", "gst_rate": 5}
    ]

    product_ids = []
    for p_data in sample_products:
        existing = tables_db.list_rows(DATABASE_ID, "products", [
            Query.equal("shop_id", shop_id), Query.equal("name", p_data['name'])
        ])
        if not existing['rows']:
            p_data['shop_id'] = shop_id
            prod = tables_db.create_row(DATABASE_ID, "products", ID.unique(), p_data)
            p_id = prod['$id']
            print(f"   ✓ Product added: {p_data['name']}")
        else:
            p_id = existing['rows'][0]['$id']
            print(f"   - Product exists: {p_data['name']}")
        
        product_ids.append(p_id)
        
        # Seed Inventory
        inv_existing = tables_db.list_rows(DATABASE_ID, "inventory", [Query.equal("product_id", p_id)])
        if not inv_existing['rows']:
            stock = random.randint(2, 50)
            tables_db.create_row(DATABASE_ID, "inventory", ID.unique(), {
                "shop_id": shop_id,
                "product_id": p_id,
                "stock_quantity": float(stock),
                "min_stock_level": 10.0
            })
            print(f"     ↳ Inventory seeded (Stock: {stock})")

    # 4. Customers
    print("\n4. Seeding customers...")
    sample_customers = [
        {"name": "Rajesh Kumar", "phone": "9876543210", "address": "Indiranagar, Bangalore"},
        {"name": "Sneha Roy", "phone": "9988776655", "address": "Koramangala, Bangalore"},
        {"name": "Amit Shah", "phone": "9123456789", "address": "Whitefield, Bangalore"}
    ]
    customer_ids = []
    for c_data in sample_customers:
        existing = tables_db.list_rows(DATABASE_ID, "customers", [
            Query.equal("shop_id", shop_id), Query.equal("phone", c_data['phone'])
        ])
        if not existing['rows']:
            c_data['shop_id'] = shop_id
            cust = tables_db.create_row(DATABASE_ID, "customers", ID.unique(), c_data)
            customer_ids.append(cust['$id'])
            print(f"   ✓ Customer added: {c_data['name']}")
        else:
            customer_ids.append(existing['rows'][0]['$id'])
            print(f"   - Customer exists: {c_data['name']}")

    # 5. Orders
    print("\n5. Seeding orders...")
    order_ids = []
    for i in range(8):
        cust_id = random.choice(customer_ids)
        status = random.choice(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'])
        source = random.choice(['whatsapp', 'voice', 'storefront'])
        
        # 1-3 random products per order
        order_items = []
        total_amount = 0
        total_gst = 0
        for _ in range(random.randint(1, 3)):
            p_idx = random.randint(0, len(sample_products)-1)
            p_info = sample_products[p_idx]
            qty = random.randint(1, 5)
            item_total = p_info['price'] * qty
            item_gst = (item_total * p_info['gst_rate']) / 100
            order_items.append({
                "product_id": product_ids[p_idx],
                "product_name": p_info['name'],
                "quantity": float(qty),
                "unit": p_info['unit'],
                "price": p_info['price'],
                "total": item_total
            })
            total_amount += item_total
            total_gst += item_gst

        order_data = {
            "shop_id": shop_id,
            "customer_id": cust_id,
            "order_number": f"ORD-{random.randint(1000, 9999)}",
            "source": source,
            "items": json.dumps(order_items),
            "total_amount": total_amount + total_gst,
            "gst_amount": total_gst,
            "status": status,
            "delivery_address": "Mock Delivery Address, Bangalore"
        }
        
        ord = tables_db.create_row(DATABASE_ID, "orders", ID.unique(), order_data)
        order_ids.append(ord['$id'])
        print(f"   ✓ Order created: {order_data['order_number']} ({status})")

    # 6. Deliveries
    print("\n6. Seeding deliveries...")
    delivery_data = {
        "shop_id": shop_id,
        "batch_number": f"BATCH-{datetime.now().strftime('%Y%m%d-%H%M')}",
        "order_ids": json.dumps(order_ids[:3]),
        "status": "in_progress",
        "area": "South Bangalore",
        "driver_name": "Suresh Delivery",
        "driver_phone": "+91 90000 11111",
        "capacity_used": 3,
        "total_distance": 5.4,
        "estimated_time": 25
    }
    tables_db.create_row(DATABASE_ID, "deliveries", ID.unique(), delivery_data)
    print("   ✓ Active delivery batch seeded")

    # 7. GST Report
    print("\n7. Seeding GST report...")
    period = datetime.now().strftime('%Y-%m')
    gst_data = {
        "shop_id": shop_id,
        "period": period,
        "total_sales": 15450.0,
        "total_gst": 1240.0,
        "breakdown": json.dumps({"0": 200, "5": 450, "12": 590}),
        "status": "pending",
        "report_data": json.dumps({"status": "ready", "filing_deadline": (datetime.now() + timedelta(days=10)).isoformat()}),
        "generated_at": datetime.now().isoformat()
    }
    tables_db.create_row(DATABASE_ID, "gst_reports", ID.unique(), gst_data)
    print(f"   ✓ GST report for {period} seeded")

    print("\n" + "=" * 60)
    print("✅ SEEDING COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    seed_everything()
