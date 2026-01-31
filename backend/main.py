from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="StoreStorm API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "StoreStorm API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# TODO: Add routers
# from api import auth, orders, products, inventory, delivery, gst, webhooks
# app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
# app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
# app.include_router(products.router, prefix="/api/products", tags=["products"])
# app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])
# app.include_router(delivery.router, prefix="/api/delivery", tags=["delivery"])
# app.include_router(gst.router, prefix="/api/gst", tags=["gst"])
# app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
