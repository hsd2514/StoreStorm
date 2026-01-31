"""Check what products are in the database for matching"""
from config.appwrite import tables_db, DATABASE_ID

SHOP_ID = "697e104b00190c0dc4c2"

result = tables_db.list_rows(DATABASE_ID, "products", queries=[f'equal("shop_id", "{SHOP_ID}")'])
products = result.get("rows", [])

print("\n" + "="*60)
print("📦 PRODUCTS IN STORM MART DATABASE")
print("="*60)

if not products:
    print("❌ No products found! You need to seed the database first.")
else:
    print(f"Found {len(products)} products:\n")
    for p in products:
        print(f"  • {p.get('name', 'Unknown')} - ₹{p.get('price', 0)}/{p.get('unit', 'pcs')}")
        print(f"    Category: {p.get('category', 'N/A')}, Stock: {p.get('quantity', 0)}")

print("\n" + "="*60)
