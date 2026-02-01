# StoreStorm 🏪⚡

**AI-powered retail management platform that helps local shopkeepers compete with quick-commerce giants.**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Appwrite](https://img.shields.io/badge/Appwrite-FD366E?style=flat&logo=appwrite&logoColor=white)](https://appwrite.io/)

---

## 🎯 The Problem

Local shopkeepers are losing customers to quick-commerce platforms because of:

- Fragmented order handling across calls, WhatsApp, and notebooks
- No real-time inventory visibility or demand forecasting
- Inefficient manual delivery management
- Complex GST compliance requirements

## 💡 Our Solution

StoreStorm provides a **unified AI-powered dashboard** that brings enterprise-grade tools to local retail:

| Feature | Description |
|---------|-------------|
| 📦 **Smart Orders** | AI parses natural language orders from WhatsApp, voice, or web |
| 📊 **Live Dashboard** | Real-time order tracking with WebSocket updates |
| 🛒 **Inventory AI** | Demand prediction, low-stock alerts, auto-reorder suggestions |
| 🚚 **Delivery Optimizer** | Batches orders by location and optimizes routes |
| 🧾 **GST Assistant** | Auto-categorization, tax calculation, and compliance reports |
| 🌐 **Online Storefront** | Customer-facing page for direct orders |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS v4, shadcn/ui |
| **Backend** | FastAPI, Python 3.10+, Pydantic |
| **BaaS** | Appwrite (Database, Auth, Realtime) |
| **AI** | Google Gemini LLM for parsing, predictions, and assistance |

---

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows
pip install -r requirements.txt
uvicorn main:app --reload        # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```

---

## 📁 Project Structure

```
storestorm/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config/              # Settings & Appwrite config
│   ├── models/              # Pydantic schemas
│   ├── services/            # AI & business logic
│   └── api/                 # REST endpoints
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Dashboard, Orders, Inventory, etc.
│   │   ├── services/        # API service layer
│   │   └── lib/             # Appwrite SDK setup
│   └── package.json
│
└── README.md
```

---

## ✨ Key Features

### 🤖 AI Order Parser
> Converts _"Need 2kg rice, 1L milk, deliver to MG Road by 5pm"_ into a structured order automatically.

### 📈 Inventory Intelligence
> Predicts demand patterns, alerts on low stock, and suggests optimal reorder quantities.

### 🗺️ Smart Delivery
> Groups nearby orders into batches and calculates optimal delivery routes.

### 🧾 GST Made Simple
> Auto-categorizes products into correct tax slabs and generates compliant reports.

---

## 🎬 Demo Flow

1. **WhatsApp Order** → AI parses message into structured order
2. **Dashboard Update** → Real-time status appears instantly
3. **Inventory Alert** → Low stock notification triggers
4. **Delivery Batch** → Orders grouped and route optimized
5. **GST Report** → One-click tax summary generated

---

## 📜 License

MIT License — Built for hackathon submission

---

**Built with ❤️ for local shopkeepers**
