from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Product, Customer, Order, OrderItem, OrderStatus

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    
    # Revenue from delivered orders
    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.status == OrderStatus.delivered
    ).scalar() or 0.0
    
    # Pending orders
    pending_orders = db.query(Order).filter(Order.status == OrderStatus.pending).count()
    
    # Low stock products (10 or less)
    low_stock_count = db.query(Product).filter(Product.stock_quantity <= 10).count()
    
    # Recent orders (last 5)
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    
    # Top selling products
    top_products = db.query(
        Product.name,
        func.sum(OrderItem.quantity).label('total_sold')
    ).join(OrderItem).group_by(Product.id, Product.name).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(5).all()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "pending_orders": pending_orders,
        "low_stock_products": low_stock_count,
        "recent_orders": [
            {
                "id": o.id,
                "customer_name": o.customer.name if o.customer else "Unknown",
                "status": o.status,
                "total_amount": o.total_amount,
                "created_at": o.created_at
            }
            for o in recent_orders
        ],
        "top_products": [
            {"name": p.name, "total_sold": p.total_sold}
            for p in top_products
        ]
    }
