# StoreStorm API Documentation

## Base URL
```
http://localhost:8000
```

## Interactive Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Endpoints

### 🏪 Shops (`/shops`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/shops/` | List all shops (supports filtering by `owner_id`) |
| `GET` | `/shops/{shop_id}` | Get a single shop |
| `POST` | `/shops/` | Create a new shop |
| `PATCH` | `/shops/{shop_id}` | Update a shop |
| `DELETE` | `/shops/{shop_id}` | Delete a shop |

**Query Parameters:**
- `limit` (default: 25, max: 100)
- `offset` (default: 0)
- `owner_id` (optional filter)

---

### 📦 Products (`/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products/` | List all products (with filters) |
| `GET` | `/products/{product_id}` | Get a single product |
| `POST` | `/products/` | Create a new product |
| `PATCH` | `/products/{product_id}` | Update a product |
| `DELETE` | `/products/{product_id}` | Delete a product |

**Query Parameters:**
- `limit`, `offset` (pagination)
- `shop_id` (filter by shop)
- `category` (filter by category)
- `is_active` (filter by status)

---

### 📊 Inventory (`/inventory`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/inventory/` | List inventory items |
| `GET` | `/inventory/{inventory_id}` | Get a single inventory item |
| `POST` | `/inventory/` | Create inventory item |
| `PATCH` | `/inventory/{inventory_id}` | Update inventory item |
| `DELETE` | `/inventory/{inventory_id}` | Delete inventory item |

**Query Parameters:**
- `limit`, `offset` (pagination)
- `shop_id` (filter by shop)
- `low_stock` (boolean - filter items with stock ≤ min_stock_level)

---

### 👥 Customers (`/customers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers/` | List all customers |
| `GET` | `/customers/{customer_id}` | Get a single customer |
| `POST` | `/customers/` | Create a new customer |
| `PATCH` | `/customers/{customer_id}` | Update a customer |
| `DELETE` | `/customers/{customer_id}` | Delete a customer |

**Query Parameters:**
- `limit`, `offset` (pagination)
- `shop_id` (filter by shop)
- `phone` (search by phone number)

---

### 🛒 Orders (`/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders/` | List all orders |
| `GET` | `/orders/{order_id}` | Get a single order |
| `POST` | `/orders/` | Create a new order |
| `PATCH` | `/orders/{order_id}` | Update an order |
| `PATCH` | `/orders/{order_id}/status` | Update order status |
| `DELETE` | `/orders/{order_id}` | Delete an order |

**Query Parameters:**
- `limit`, `offset` (pagination)
- `shop_id` (filter by shop)
- `customer_id` (filter by customer)
- `status` (filter by status)
- `source` (filter by source: whatsapp, voice, storefront)

**Valid Status Values:**
- `pending` → `confirmed` → `preparing` → `out_for_delivery` → `delivered`
- `cancelled` (can be set anytime)

---

### 🚚 Deliveries (`/deliveries`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/deliveries/` | List delivery batches |
| `GET` | `/deliveries/{delivery_id}` | Get a single delivery batch |
| `POST` | `/deliveries/` | Create a delivery batch |
| `PATCH` | `/deliveries/{delivery_id}` | Update a delivery batch |
| `PATCH` | `/deliveries/{delivery_id}/start` | Start delivery (sets status & started_at) |
| `PATCH` | `/deliveries/{delivery_id}/complete` | Complete delivery (sets status & completed_at) |
| `DELETE` | `/deliveries/{delivery_id}` | Delete a delivery batch |

**Query Parameters:**
- `limit`, `offset` (pagination)
- `shop_id` (filter by shop)
- `status` (filter by status: planned, in_progress, completed)

---

### 📝 GST Reports (`/gst-reports`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/gst-reports/` | List GST reports |
| `GET` | `/gst-reports/{report_id}` | Get a single report |
| `POST` | `/gst-reports/` | Create a GST report |
| `PATCH` | `/gst-reports/{report_id}` | Update a report |
| `PATCH` | `/gst-reports/{report_id}/file` | Mark report as filed (sets status & filed_at) |
| `DELETE` | `/gst-reports/{report_id}` | Delete a report |

**Query Parameters:**
- `limit`, `offset` (pagination)
- `shop_id` (filter by shop)
- `period` (filter by period, e.g., "2026-01")
- `status` (filter by status: pending, filed)

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (for DELETE)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

**Error Format:**
```json
{
  "detail": "Error message"
}
```

---

## Example Requests

### Create a Shop
```bash
POST /shops/
Content-Type: application/json

{
  "name": "Kumar General Store",
  "owner_id": "user_abc123",
  "phone": "+919876543210",
  "address": "45, 5th Cross, Koramangala, Bangalore",
  "category": "grocery",
  "gstin": "29AAACC1234D1Z5"
}
```

### Create an Order
```bash
POST /orders/
Content-Type: application/json

{
  "shop_id": "shop_xyz",
  "customer_id": "cust_123",
  "order_number": "ORD-001",
  "items": "[{\"product_id\": \"prod_1\", \"quantity\": 2, \"price\": 50}]",
  "total_amount": 100.0,
  "gst_amount": 0.0,
  "status": "pending",
  "source": "storefront",
  "delivery_address": "123 Main St"
}
```

### Update Order Status
```bash
PATCH /orders/{order_id}/status?status=confirmed
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- JSON fields for complex data: `items`, `order_ids`, `route_info`, `breakdown`
- Auto-generated IDs using Appwrite's `ID.unique()`
- Soft deletes not implemented - use `is_active` flags where available

---

## Next Steps

1. Add Pydantic models for request/response validation
2. Implement authentication middleware
3. Add webhook endpoints for WhatsApp/Voice
4. Implement AI services (order parser, inventory predictions, etc.)
