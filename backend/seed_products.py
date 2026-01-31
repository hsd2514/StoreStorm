"""Seed products for Storm Mart shop - CORRECT SCHEMA"""
from config.appwrite import tables_db, DATABASE_ID
from appwrite.id import ID

SHOP_ID = "697e104b00190c0dc4c2"

# Products with correct schema (no 'quantity' - that's in inventory table)
PRODUCTS = [
    {"name": "Basmati Rice", "category": "Grains", "price": 120, "unit": "kg", "gst_rate": 5},
    {"name": "Sunflower Oil", "category": "Oils", "price": 180, "unit": "liter", "gst_rate": 5},
    {"name": "Toor Dal", "category": "Pulses", "price": 140, "unit": "kg", "gst_rate": 5},
    {"name": "Sugar", "category": "Grocery", "price": 45, "unit": "kg", "gst_rate": 5},
    {"name": "Wheat Flour Atta", "category": "Grains", "price": 50, "unit": "kg", "gst_rate": 5},
    {"name": "Milk", "category": "Dairy", "price": 60, "unit": "liter", "gst_rate": 0},
    {"name": "Salt", "category": "Grocery", "price": 25, "unit": "kg", "gst_rate": 5},
    {"name": "Tea Chai", "category": "Beverages", "price": 350, "unit": "kg", "gst_rate": 5},
    {"name": "Rice", "category": "Grains", "price": 80, "unit": "kg", "gst_rate": 5},
    {"name": "Oil", "category": "Oils", "price": 150, "unit": "liter", "gst_rate": 5},
]

print("\n" + "="*60)
print("📦 SEEDING PRODUCTS FOR STORM MART (Correct Schema)")
print("="*60)

created = 0
for product in PRODUCTS:
    try:
        data = {
            "shop_id": SHOP_ID,
            "name": product["name"],
            "category": product["category"],
            "price": product["price"],
            "unit": product["unit"],
            "gst_rate": product["gst_rate"],
            "is_active": True,
        }
        result = tables_db.create_row(DATABASE_ID, "products", ID.unique(), data)
        print(f"  ✅ {product['name']} - ₹{product['price']}/{product['unit']}")
        created += 1
    except Exception as e:
        print(f"  ⚠️ {product['name']}: {e}")

print(f"\n✅ Created {created} products!")
print("="*60)
