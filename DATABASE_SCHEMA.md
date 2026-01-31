# Appwrite Database Schema

**Database ID:** `697da223000cae31da10`  
**Database Name:** `storestorm_db`

---

## Collections

### 1. Shops
**Collection ID:** `shops`

Stores information about local shops using the platform.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string(255) | Yes | Shop name |
| `owner_id` | string(255) | Yes | Appwrite user ID of shop owner |
| `phone` | string(20) | Yes | Shop contact number |
| `address` | string(500) | Yes | Shop physical address |
| `category` | string(100) | No | Type of shop (grocery, pharmacy, etc.) |
| `gstin` | string(15) | No | GST Identification Number |
| `is_active` | boolean | Yes | Shop active status (default: true) |

**Indexes:**
- `owner_id_idx` - Query shops by owner
- `phone_idx` - Query by phone number

---

### 2. Products
**Collection ID:** `products`

Product catalog for each shop.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `shop_id` | string(255) | Yes | Reference to shop |
| `name` | string(255) | Yes | Product name |
| `category` | string(100) | Yes | Product category (Grains, Pulses, etc.) |
| `price` | double | Yes | Product price |
| `unit` | string(20) | Yes | Unit of measurement (kg, L, pcs) |
| `gst_rate` | integer | Yes | GST percentage (0, 5, 12, 18, 28) |
| `hsn_code` | string(20) | No | HSN/SAC code for GST |
| `image_url` | string(500) | No | Product image URL |
| `is_active` | boolean | Yes | Product availability (default: true) |

**Indexes:**
- `shop_id_idx` - Query products by shop
- `category_idx` - Query by category

---

### 3. Inventory
**Collection ID:** `inventory`

Stock tracking for products.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `shop_id` | string(255) | Yes | Reference to shop |
| `product_id` | string(255) | Yes | Reference to product |
| `stock_quantity` | double | Yes | Current stock level |
| `min_stock_level` | double | Yes | Minimum stock alert threshold |
| `last_restock_date` | datetime | No | Last restocking date |

**Indexes:**
- `shop_id_idx` - Query inventory by shop
- `product_id_idx` - Query by product

---

### 4. Customers
**Collection ID:** `customers`

Customer database for each shop.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `shop_id` | string(255) | Yes | Reference to shop |
| `name` | string(255) | Yes | Customer name |
| `phone` | string(20) | Yes | Customer phone number |
| `address` | string(500) | No | Delivery address |
| `total_orders` | integer | Yes | Total orders count (default: 0) |
| `total_spent` | double | Yes | Lifetime spending (default: 0.0) |

**Indexes:**
- `shop_id_idx` - Query customers by shop
- `phone_idx` - Query by phone number

---

### 5. Orders
**Collection ID:** `orders`

Order management and tracking.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `shop_id` | string(255) | Yes | Reference to shop |
| `customer_id` | string(255) | Yes | Reference to customer |
| `order_number` | string(50) | Yes | Unique order number (e.g., ORD-001) |
| `items` | string(10000) | Yes | Order items as JSON string |
| `total_amount` | double | Yes | Order total including GST |
| `gst_amount` | double | Yes | Total GST collected |
| `status` | string(50) | Yes | Order status |
| `source` | string(50) | Yes | Order source (whatsapp, voice, storefront) |
| `delivery_address` | string(500) | No | Delivery address |
| `delivery_batch_id` | string(255) | No | Reference to delivery batch |
| `notes` | string(1000) | No | Order notes/special instructions |

**Status Values:**
- `pending` - New order, not confirmed
- `confirmed` - Order confirmed by shop
- `preparing` - Order being prepared
- `out_for_delivery` - Out for delivery
- `delivered` - Order delivered
- `cancelled` - Order cancelled

**Indexes:**
- `shop_id_idx` - Query orders by shop
- `customer_id_idx` - Query by customer
- `order_number_idx` (UNIQUE) - Ensure unique order numbers
- `status_idx` - Filter by status

---

### 6. Deliveries
**Collection ID:** `deliveries`

Delivery batching and route optimization.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `shop_id` | string(255) | Yes | Reference to shop |
| `batch_number` | string(50) | Yes | Unique batch ID (e.g., BATCH-001) |
| `driver_name` | string(255) | No | Delivery person name |
| `driver_phone` | string(20) | No | Driver phone number |
| `order_ids` | string(5000) | Yes | JSON array of order IDs |
| `area` | string(255) | Yes | Delivery area/locality |
| `status` | string(50) | Yes | Batch status |
| `estimated_time` | integer | No | Estimated delivery time in minutes |
| `route_info` | string(5000) | No | Route information as JSON |
| `started_at` | datetime | No | Delivery start time |
| `completed_at` | datetime | No | Delivery completion time |

**Status Values:**
- `planned` - Batch created, not started
- `in_progress` - Delivery in progress
- `completed` - All deliveries completed

**Indexes:**
- `shop_id_idx` - Query batches by shop
- `batch_number_idx` (UNIQUE) - Ensure unique batch numbers
- `status_idx` - Filter by status

---

### 7. GST Reports
**Collection ID:** `gst_reports`

GST compliance and monthly reports.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `shop_id` | string(255) | Yes | Reference to shop |
| `period` | string(50) | Yes | Report period (e.g., "2026-01") |
| `total_sales` | double | Yes | Total sales for the period |
| `total_gst` | double | Yes | Total GST collected |
| `breakdown` | string(5000) | Yes | GST breakdown by slab as JSON |
| `status` | string(50) | Yes | Report status (pending, filed) |
| `filed_at` | datetime | No | Filing date |

**Breakdown JSON Format:**
```json
[
  {"rate": "0%", "amount": 45000, "tax": 0, "items": 12},
  {"rate": "5%", "amount": 120000, "tax": 6000, "items": 45},
  {"rate": "12%", "amount": 50000, "tax": 6000, "items": 18}
]
```

**Indexes:**
- `shop_id_idx` - Query reports by shop
- `period_idx` - Query by period

---

## Relationships

```
shops (1) ──────── (N) products
       │
       ├─────────── (N) inventory
       │
       ├─────────── (N) customers
       │
       ├─────────── (N) orders
       │
       ├─────────── (N) deliveries
       │
       └─────────── (N) gst_reports

customers (1) ──── (N) orders

products (1) ───── (N) inventory

orders (N) ──────── (1) deliveries
```

---

## Permissions

All collections use the following permission model:
- **Read:** `any` - Anyone can read (will be restricted by queries)
- **Create:** `users` - Authenticated users can create
- **Update:** `users` - Authenticated users can update
- **Delete:** `users` - Authenticated users can delete

> **Note:** In production, implement proper role-based access control (RBAC) to restrict access based on shop ownership.

---

## Setup Command

To recreate this schema, run:

```bash
cd backend
uv run python setup_database.py
```

This will:
1. Create the `storestorm_db` database
2. Create all 7 collections with attributes and indexes
3. Update `.env` with the database ID
4. Configure permissions

---

## Next Steps

1. ✅ Database schema created
2. Create Pydantic models matching this schema
3. Build FastAPI endpoints for CRUD operations
4. Implement authentication and authorization
5. Add real-time subscriptions for order updates
6. Build AI services for order parsing and insights
