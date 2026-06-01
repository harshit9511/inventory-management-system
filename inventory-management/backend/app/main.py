from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routes import products, customers, orders, dashboard

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management API",
    description="A simplified Inventory & Order Management System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(customers.router, prefix="/api/customers", tags=["customers"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def root():
    return {"message": "Inventory & Order Management API is running!", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
