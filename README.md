# Inventory Management System

A full-stack Inventory and Order Management application developed using React and FastAPI.  
The project helps manage products, customers, and orders through a responsive dashboard and REST API architecture.

---

# Project Overview

The system is designed to simplify inventory operations by providing a centralized platform for:

- Managing products and stock
- Tracking customer details
- Handling order management
- Monitoring inventory updates
- Viewing dashboard analytics

The application follows a client-server architecture where the frontend communicates with the backend using REST APIs.

---

# Features

- Product Management
- Customer Management
- Order Tracking
- Inventory Monitoring
- Stock Quantity Updates
- Dashboard Analytics
- REST API Integration
- Responsive User Interface
- CRUD Operations
- Dockerized Backend Setup

---

# Frontend

The frontend is built using React.js and provides a clean dashboard interface for interacting with the system.

### Frontend Technologies
- React.js
- Axios
- CSS

### Frontend Functionalities
- Dashboard view
- Product listing
- Customer management
- Order management
- API integration
- Dynamic UI rendering

---

# Backend

The backend is developed using FastAPI and handles all business logic and API operations.

### Backend Technologies
- FastAPI
- SQLAlchemy
- SQLite / PostgreSQL

### Backend Functionalities
- REST API development
- Database operations
- Inventory calculations
- Order processing
- Stock updates
- CRUD functionality

---

# Project Structure

```bash
inventory-management/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── runtime.txt
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# Local Setup

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# Deployment

## Frontend Deployment
- Vercel

## Backend Deployment
- Render

## Containerization
- Docker
- Docker Hub

---

# Key Highlights

- Full-stack application architecture
- RESTful API implementation
- Responsive dashboard interface
- Modular backend structure
- Cloud deployment support
- Dockerized backend service
- Environment variable configuration

---

# Future Improvements

- Authentication system
- Role-based access control
- Export reports
- Notification system
- Advanced analytics
- Cloud database integration

---

# Author

Harshit Gupta
