# 🚀 Inventory & Order Management System

A full-stack web application for managing products, customers, orders, and inventory tracking.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Python FastAPI |
| Database | PostgreSQL |
| Frontend | React 18 |
| Containerization | Docker & Docker Compose |
| ORM | SQLAlchemy |

## ✅ Features

- **Products** — CRUD with unique SKU validation, stock tracking, category filtering
- **Customers** — CRUD with unique email validation
- **Orders** — Create orders with automatic stock reduction, prevent orders when stock insufficient
- **Dashboard** — Live stats, recent orders, top products chart
- **Business Rules:**
  - ✅ Unique Product SKUs enforced
  - ✅ Unique Customer emails enforced
  - ✅ Inventory validation before order creation
  - ✅ Automatic stock reduction on order placement
  - ✅ Stock restoration on order cancellation/deletion
  - ✅ Orders blocked when product stock is insufficient

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Docker Desktop running

### Steps

```bash
# 1. Clone or open the project folder
cd inventory-management

# 2. Start all services
docker-compose up --build

# 3. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs (Swagger): http://localhost:8000/docs
```

> First build takes ~3-5 minutes. Subsequent starts are fast.

### Stop the app
```bash
docker-compose down
```

### Stop and remove all data
```bash
docker-compose down -v
```

---

## 💻 Local Development (Without Docker)

### Backend Setup

**Prerequisites:** Python 3.10+, PostgreSQL installed locally

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
# Create a .env file or set directly:
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/inventory_db"

# Create the database in PostgreSQL first:
# psql -U postgres -c "CREATE DATABASE inventory_db;"

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

**Prerequisites:** Node.js 16+

```bash
cd frontend

# Install dependencies
npm install

# Update .env file:
# REACT_APP_API_URL=http://localhost:8000

# Start frontend
npm start
```

---

## 📁 Project Structure

```
inventory-management/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── core/
│   │   │   └── database.py      # DB connection & session
│   │   ├── models/
│   │   │   └── models.py        # SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic schemas
│   │   └── routes/
│   │       ├── products.py      # Product endpoints
│   │       ├── customers.py     # Customer endpoints
│   │       ├── orders.py        # Order endpoints
│   │       └── dashboard.py     # Stats endpoint
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js               # Main app with routing
│   │   ├── App.css              # Global styles
│   │   ├── index.js             # Entry point
│   │   ├── services/
│   │   │   └── api.js           # Axios API client
│   │   ├── pages/
│   │   │   ├── Dashboard.js     # Dashboard with stats
│   │   │   ├── Products.js      # Product management
│   │   │   ├── Customers.js     # Customer management
│   │   │   └── Orders.js        # Order management
│   │   └── components/
│   │       └── common/
│   │           ├── Layout.js    # Sidebar + topbar layout
│   │           └── Layout.css
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml           # Orchestrates all services
```

---

## 🌐 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List all products |
| POST | `/api/products/` | Create product |
| GET | `/api/products/{id}` | Get product by ID |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| PATCH | `/api/products/{id}/stock` | Update stock |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers/` | List all customers |
| POST | `/api/customers/` | Create customer |
| GET | `/api/customers/{id}` | Get customer by ID |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List all orders |
| POST | `/api/orders/` | Create order |
| GET | `/api/orders/{id}` | Get order by ID |
| PUT | `/api/orders/{id}` | Update order status |
| DELETE | `/api/orders/{id}` | Delete order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get all statistics |

📖 **Full interactive API docs at:** `http://localhost:8000/docs`

---

## 🔧 Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/inventory_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory_db
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:8000
```

---

## 🐳 Docker Hub

```bash
# Build and tag backend image
docker build -t yourusername/inventory-backend:latest ./backend
docker push yourusername/inventory-backend:latest

# Build and tag frontend image
docker build -t yourusername/inventory-frontend:latest ./frontend
docker push yourusername/inventory-frontend:latest
```

---

## 🚢 Deployment

### Backend (Render / Railway / Fly.io)
1. Push to GitHub
2. Connect repo to Render
3. Set `DATABASE_URL` environment variable
4. Deploy the `backend` folder with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel / Netlify)
1. Push to GitHub
2. Connect repo to Vercel
3. Set `REACT_APP_API_URL` to your deployed backend URL
4. Set root directory to `frontend`
5. Deploy

---

## 👤 Author

Harshit Gupta — harshitgupta9511@gmail.com
