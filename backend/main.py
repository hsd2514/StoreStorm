"""
StoreStorm FastAPI Backend
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings

# Import routers
from api import shops, products, inventory, customers, orders, deliveries, gst_reports, auth, ai, twilio, telegram, forecasting

app = FastAPI( 
    title="StoreStorm API",
    description="SaaS platform for local shopkeepers with AI-powered features",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"🔥 GLOBAL ERROR: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
        headers={
            "Access-Control-Allow-Origin": "*", # Force CORS on error
            "Access-Control-Allow-Headers": "*"
        }
    )

# Register routers
app.include_router(auth.router)
app.include_router(shops.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(deliveries.router)
app.include_router(gst_reports.router)
app.include_router(ai.router)
app.include_router(twilio.router)
app.include_router(telegram.router)
app.include_router(forecasting.router)


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
