from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Customer
from app.schemas.schemas import CustomerCreate, CustomerUpdate, CustomerResponse

router = APIRouter()


@router.get("/", response_model=List[CustomerResponse])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Customer).offset(skip).limit(limit).all()


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    # Check unique email
    existing = db.query(Customer).filter(Customer.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Customer with email '{customer.email}' already exists")
    
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer.dict(exclude_unset=True)
    
    # Check unique email if being updated
    if 'email' in update_data:
        existing = db.query(Customer).filter(
            Customer.email == update_data['email'],
            Customer.id != customer_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Email '{update_data['email']}' is already in use")
    
    for key, value in update_data.items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(db_customer)
    db.commit()
    return None
