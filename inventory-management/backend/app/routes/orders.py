from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Order, OrderItem, Product, Customer, OrderStatus
from app.schemas.schemas import OrderCreate, OrderUpdate, OrderResponse

router = APIRouter()


@router.get("/", response_model=List[OrderResponse])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")
    
    # Validate inventory for all items first
    total_amount = 0.0
    order_items_data = []
    
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        
        # Business Rule: Check sufficient stock
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product '{product.name}'. Available: {product.stock_quantity}, Requested: {item.quantity}"
            )
        
        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price
        })
        total_amount += product.price * item.quantity
    
    # Create order
    db_order = Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        notes=order.notes,
        status=OrderStatus.pending
    )
    db.add(db_order)
    db.flush()  # Get the order id
    
    # Create order items and reduce stock
    for item_data in order_items_data:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"]
        )
        db.add(db_item)
        
        # Business Rule: Automatic stock reduction
        item_data["product"].stock_quantity -= item_data["quantity"]
    
    db.commit()
    db.refresh(db_order)
    return db_order


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # If cancelling, restore stock
    if order_update.status == OrderStatus.cancelled and db_order.status != OrderStatus.cancelled:
        for item in db_order.items:
            item.product.stock_quantity += item.quantity
    
    update_data = order_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Restore stock if order wasn't cancelled
    if db_order.status != OrderStatus.cancelled:
        for item in db_order.items:
            item.product.stock_quantity += item.quantity
    
    db.delete(db_order)
    db.commit()
    return None
