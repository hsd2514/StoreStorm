# StoreStorm 🏪⚡

> Empowering local shopkeepers to compete with quick-commerce platforms through AI-powered order management, inventory tracking, and delivery optimization.

---

## Problem Statement

Local shopkeepers (grocery, pharmacy, food, electronics) are losing customers to quick-commerce platforms due to:

- ❌ Fragmented order handling (calls, WhatsApp, notebooks)
- ❌ Inefficient delivery management
- ❌ Poor inventory visibility
- ❌ Complex GST compliance
- ❌ Lack of digital convenience

**StoreStorm provides a single, simple platform to manage everything in one place.**

---

## Solution

A unified SaaS dashboard for shop owners with:

✅ **Multi-channel ordering** - WhatsApp, voice, and online storefront  
✅ **AI-powered order parsing** - Convert natural language to structured orders  
✅ **Smart inventory management** - Demand prediction and low-stock alerts  
✅ **Delivery optimization** - Batch orders and optimize routes  
✅ **GST compliance assistant** - Auto-categorization and simple reporting  
✅ **Real-time updates** - Live dashboard with WebSocket connections  

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS v4, shadcn/ui |
| **Backend** | FastAPI (Python), Pydantic |
| **BaaS** | Appwrite (Database, Auth, Storage, Realtime) |
| **AI** | LLM integration for order parsing, inventory, delivery, GST |

---

## Features

### 1. Unified Dashboard
- Today's orders summary
- Pending orders with real-time updates
- Low stock alerts
- Delivery batches in progress
- GST summary

### 2. Multi-Channel Ordering
- **WhatsApp**: Text message parsing
- **Voice**: AI call agent (simulated)
- **Storefront**: Simple online ordering page

### 3. AI Features

#### 🤖 AI Order Parser
Converts messages like _"Need 2kg rice, 1L milk, deliver to MG Road by 5pm"_ into structured orders.

#### 🤖 AI Customer Agent
Answers queries about price, stock, and ETA via chat/voice.

#### 🤖 AI Inventory Assistant
Predicts demand, sends low-stock alerts, suggests reorder quantities.

#### 🤖 AI Delivery Optimizer
Batches orders by location and time, optimizes routes.

#### 🤖 AI GST Assistant
Categorizes products into GST slabs, generates reports, explains rules.

### 4. Category-Agnostic
Supports grocery, pharmacy, food, and electronics shops. AI behavior adapts based on shop category.

---

## Project Structure

```
storestorm/
├── backend/           # FastAPI application
│   ├── main.py
│   ├── config/        # Appwrite & settings
│   ├── models/        # Pydantic models
│   ├── services/      # AI services
│   ├── api/           # REST endpoints
│   └── utils/
│
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Appwrite SDK
│   └── package.json
│
├── TASKS.md           # Development task breakdown
├── ARCHITECTURE.md    # System architecture details
└── README.md          # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Appwrite instance (Cloud or self-hosted)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Configure Appwrite credentials
uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Appwrite Setup

1. Create Appwrite project
2. Run collection creation scripts (see `ARCHITECTURE.md`)
3. Configure environment variables
4. Enable Realtime

---

## Development Workflow

See **[TASKS.md](./TASKS.md)** for detailed task breakdown.

**Recommended order:**
1. Set up project structure
2. Create Appwrite collections
3. Build authentication flow
4. Implement order management
5. Add inventory tracking
6. Integrate AI services
7. Build delivery optimization
8. Add GST compliance

---

## Team Collaboration

### Task Assignment
Use [TASKS.md](./TASKS.md) to track progress. Mark items as:
- `[ ]` - Not started
- `[/]` - In progress (optional notation)
- `[x]` - Completed

### Code Standards
- **Backend**: Follow PEP 8, use type hints
- **Frontend**: Use functional components, custom hooks
- **Commits**: Conventional commits format

### Communication
- Tag issues with feature labels
- Update TASKS.md daily
- Review PRs promptly

---

## Hackathon Demo Plan

### Demo Flow (5-7 minutes)

1. **Problem intro** (1 min)
2. **Live demo** (3-4 min):
   - Simulate WhatsApp order → AI parsing
   - Show real-time dashboard update
   - Display inventory alert
   - Show delivery batching
   - Generate GST report
3. **Technical highlights** (1 min)
4. **Impact & future** (1 min)

### Demo Data
- 3-5 sample shops
- 20-30 products per shop
- 10-15 orders
- Pre-configured delivery routes

---

## Roadmap

### MVP (Hackathon)
- ✅ Core order management
- ✅ AI order parsing
- ✅ Basic inventory tracking
- ✅ Delivery batching
- ✅ GST compliance
- ✅ Storefront

### Post-Hackathon
- Multi-shop support
- Advanced analytics
- Mobile app
- Payment integration
- WhatsApp Business API
- Voice call integration

---

## License

MIT License - Built for hackathon submission

---

## Team

Add your team members here!

---

## Resources

- [Appwrite Docs](https://appwrite.io/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)

---

**Built with ❤️ for local shopkeepers**
