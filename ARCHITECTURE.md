# StoreStorm - System Architecture

## Overview

StoreStorm is a SaaS platform enabling local shopkeepers to compete with quick-commerce apps through unified order management, inventory tracking, delivery optimization, and GST compliance.

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Appwrite Web SDK** - Backend integration
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Backend
- **FastAPI** - Python web framework
- **Appwrite Python SDK** - Database and auth
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Backend-as-a-Service
- **Appwrite** 
  - Authentication
  - Database (collections)
  - Storage (file uploads)
  - Realtime subscriptions
  - Functions (optional triggers)

### AI Services (Integration Points)
- Order parsing from natural language
- Customer support chatbot
- Inventory demand prediction
- Delivery route optimization
- GST categorization and compliance

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Orders     │  │  Inventory   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Delivery    │  │     GST      │  │  Storefront  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│         React + Vite + Tailwind v4 + shadcn/ui              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP + WebSocket (Realtime)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   FastAPI    │    │   Appwrite   │    │  WhatsApp/   │
│   Backend    │◄───│   Database   │    │    Voice     │
│              │    │              │    │   Webhooks   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │
        │                   │
        ▼                   ▼
┌──────────────────────────────────────┐
│         AI Services Layer            │
│  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │ Order  │  │Inventor│  │Delivery│ │
│  │ Parser │  │   AI   │  │   AI   │ │
│  └────────┘  └────────┘  └────────┘ │
│  ┌────────┐  ┌────────┐             │
│  │Customer│  │  GST   │             │
│  │  Agent │  │   AI   │             │
│  └────────┘  └────────┘             │
└──────────────────────────────────────┘
```

---

## Data Model (Appwrite Collections)

### Collection: `shops`
Shop information and settings.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Shop name |
| category | string | grocery/pharmacy/food/electronics |
| ownerId | string | User ID of shop owner |
| phone | string | Contact number |
| address | string | Shop address |
| latitude | float | Location coordinates |
| longitude | float | Location coordinates |
| gstNumber | string | GST registration |
| isActive | boolean | Active status |

### Collection: `products`
Product catalog for each shop.

| Field | Type | Description |
|-------|------|-------------|
| shopId | string | Reference to shop |
| name | string | Product name |
| category | string | Product category |
| price | float | Price per unit |
| unit | string | kg/piece/liter/etc |
| gstRate | float | 0/5/12/18/28 |
| imageUrl | string | Product image |
| isActive | boolean | Available status |

### Collection: `inventory`
Stock tracking for products.

| Field | Type | Description |
|-------|------|-------------|
| shopId | string | Reference to shop |
| productId | string | Reference to product |
| currentStock | integer | Current quantity |
| minStock | integer | Alert threshold |
| lastRestocked | datetime | Last restock date |

### Collection: `customers`
Customer information.

| Field | Type | Description |
|-------|------|-------------|
| shopId | string | Reference to shop |
| name | string | Customer name |
| phone | string | Contact number |
| address | string | Delivery address |
| latitude | float | Location coordinates |
| longitude | float | Location coordinates |
| preferredLanguage | string | Language preference |

### Collection: `orders`
Order tracking and management.

| Field | Type | Description |
|-------|------|-------------|
| shopId | string | Reference to shop |
| customerId | string | Reference to customer |
| orderNumber | string | Unique order ID |
| source | string | whatsapp/voice/storefront |
| rawInput | string | Original message/transcript |
| items | JSON | Array of order items |
| totalAmount | float | Total order value |
| gstAmount | float | GST amount |
| status | string | Order status |
| deliveryAddress | string | Delivery location |
| deliveryLatitude | float | Delivery coordinates |
| deliveryLongitude | float | Delivery coordinates |
| preferredDeliveryTime | string | Requested time |
| assignedBatchId | string | Delivery batch |
| notes | string | Additional notes |

**Order Status Flow:**
pending → confirmed → preparing → out_for_delivery → delivered

### Collection: `deliveries`
Delivery batch management.

| Field | Type | Description |
|-------|------|-------------|
| shopId | string | Reference to shop |
| batchNumber | string | Batch identifier |
| orderIds | JSON | Array of order IDs |
| status | string | planned/in_progress/completed |
| optimizedRoute | JSON | Route sequence |
| deliveryPersonId | string | Assigned delivery person |
| estimatedTime | integer | Estimated minutes |
| startedAt | datetime | Start timestamp |
| completedAt | datetime | Completion timestamp |

### Collection: `gst_reports`
GST compliance and reporting.

| Field | Type | Description |
|-------|------|-------------|
| shopId | string | Reference to shop |
| period | string | YYYY-MM format |
| totalSales | float | Total sales amount |
| totalGST | float | Total GST collected |
| gstBreakdown | JSON | Breakdown by slab |
| reportData | JSON | Detailed data |
| generatedAt | datetime | Generation timestamp |

### Collection: `ai_insights`
AI-generated alerts and suggestions.

| Field | Type | Description |
|-------|------|-------------|
| shopId | string | Reference to shop |
| type | string | Alert type |
| message | string | Alert message |
| data | JSON | Additional data |
| severity | string | low/medium/high |
| isRead | boolean | Read status |

**Insight Types:**
- inventory_alert
- demand_prediction
- delivery_suggestion
- gst_warning

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Shop owner registration
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Orders
- `GET /api/orders` - List orders for shop
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details
- `PATCH /api/orders/{id}` - Update order status
- `DELETE /api/orders/{id}` - Cancel order

### Products
- `GET /api/products` - List products
- `POST /api/products` - Add product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Remove product

### Inventory
- `GET /api/inventory` - Get inventory status
- `PATCH /api/inventory/{productId}` - Update stock
- `GET /api/inventory/alerts` - Get low stock alerts

### Delivery
- `GET /api/delivery/batches` - List delivery batches
- `POST /api/delivery/batches` - Create batch
- `GET /api/delivery/batches/{id}` - Get batch details
- `PATCH /api/delivery/batches/{id}` - Update batch status

### GST
- `GET /api/gst/reports` - List GST reports
- `POST /api/gst/reports/generate` - Generate report
- `GET /api/gst/categorize/{productId}` - Get GST category

### Webhooks
- `POST /api/webhooks/whatsapp` - WhatsApp message webhook
- `POST /api/webhooks/voice` - Voice call webhook

---

## User Flows

### Shop Owner: Order Management Flow

1. **Receive Order**
   - Customer sends WhatsApp message or calls
   - Webhook triggers FastAPI endpoint
   - AI parses message into structured data
   - Order created in Appwrite database
   - Real-time update pushes to dashboard

2. **Review Order**
   - Shop owner sees new order notification
   - Reviews parsed order details
   - Confirms or edits items
   - Updates order status

3. **Prepare & Deliver**
   - Order moves to "preparing" status
   - Inventory auto-decrements
   - Order batched with nearby deliveries
   - Delivery route optimized
   - Status tracked until delivery

### Customer: Ordering Flow

**Option 1: WhatsApp**
1. Customer sends message: "I need 2kg rice and 1L milk"
2. AI confirms order and asks for address
3. Customer provides delivery details
4. Order confirmed automatically

**Option 2: Storefront**
1. Customer visits shop's storefront link
2. Browses product catalog
3. Adds items to cart
4. Submits order with delivery details
5. Receives confirmation

**Option 3: Voice Call**
1. Customer calls shop number
2. AI agent answers and takes order
3. AI confirms items and delivery details
4. Order created automatically

---

## Realtime Updates

Using **Appwrite Realtime**, the dashboard subscribes to:

- **Orders collection** - New orders, status updates
- **Inventory collection** - Stock changes
- **AI Insights collection** - New alerts

When any document changes, the frontend automatically updates without refresh.

---

## File Structure

```
storestorm/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/
│   │   ├── appwrite.py
│   │   └── settings.py
│   ├── models/
│   │   ├── order.py
│   │   ├── product.py
│   │   ├── delivery.py
│   │   └── gst.py
│   ├── services/
│   │   ├── ai_order_parser.py
│   │   ├── ai_customer_agent.py
│   │   ├── ai_inventory.py
│   │   ├── ai_delivery.py
│   │   └── ai_gst.py
│   ├── api/
│   │   ├── auth.py
│   │   ├── orders.py
│   │   ├── products.py
│   │   ├── inventory.py
│   │   ├── delivery.py
│   │   ├── gst.py
│   │   └── webhooks.py
│   └── utils/
│       └── helpers.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── lib/
│   │   │   ├── appwrite.js
│   │   │   └── utils.js
│   │   ├── components/
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── layout/
│   │   │   ├── auth/
│   │   │   ├── orders/
│   │   │   ├── inventory/
│   │   │   ├── delivery/
│   │   │   └── gst/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Delivery.jsx
│   │   │   ├── GST.jsx
│   │   │   └── Storefront.jsx
│   │   └── hooks/
│   │       ├── useAuth.js
│   │       ├── useRealtime.js
│   │       └── useOrders.js
│
├── TASKS.md
├── ARCHITECTURE.md
└── README.md
```

---

## Deployment Strategy

### Development
- Frontend: `npm run dev` (Vite dev server on :5173)
- Backend: `uvicorn main:app --reload` (FastAPI on :8000)
- Appwrite: Self-hosted or Cloud

### Production
- Frontend: Deploy to Vercel/Netlify
- Backend: Deploy to Railway/Render/Fly.io
- Appwrite: Appwrite Cloud or self-hosted

---

## Security Considerations

1. **Authentication**
   - Appwrite handles auth tokens
   - Protected routes on both frontend and backend
   - Shop data isolation by shopId

2. **API Security**
   - CORS configuration
   - Rate limiting
   - Input validation with Pydantic

3. **Data Privacy**
   - Customer data encrypted
   - GST reports access-controlled
   - No data sharing between shops

---

## Scalability

### Phase 1: Single Shop (MVP)
- Handle 100-200 orders/day per shop
- Support 1000-2000 products
- Real-time updates for single shop owner

### Phase 2: Multi-Shop
- Support multiple shops per tenant
- Shared delivery optimization across shops
- Aggregated analytics

### Phase 3: Multi-Tenant
- White-label solution for franchises
- Multi-region support
- Advanced analytics and insights
