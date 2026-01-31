"""
StoreStorm FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings

# Import routers
from api import shops, products, inventory, customers, orders, deliveries, gst_reports

app = FastAPI(
    title="StoreStorm API",
    description="SaaS platform for local shopkeepers with AI-powered features",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(shops.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(deliveries.router)
app.include_router(gst_reports.router)


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to StoreStorm API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
