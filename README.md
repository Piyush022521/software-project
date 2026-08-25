# 📦 Courier Service Management System

**BlueDart Express** — A complete full-stack web application built as a college Software Engineering Lab project.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Tech Stack](#tech-stack)
4. [Database Schema](#database-schema)
5. [Setup & Installation](#setup--installation)
6. [Environment Variables](#environment-variables)
7. [Running the Project](#running-the-project)
8. [Demo Credentials](#demo-credentials)
9. [API Documentation](#api-documentation)
10. [Complete Flow](#complete-flow)
11. [Pages Reference](#pages-reference)
12. [Postman Examples](#postman-examples)

---

## Project Overview

A courier management system with three roles:

| Role            | Capabilities |
|-----------------|-------------|
| **Customer**    | Register, login, book couriers, track shipments, cancel bookings |
| **Delivery Agent** | View assigned shipments, update statuses, add remarks |
| **Admin**       | Full control — manage users, assign agents, view reports |

---

## Folder Structure

```
courier-system/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize + SQLite connection
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile
│   │   ├── courierController.js # Book, view, cancel couriers
│   │   ├── trackingController.js# Public shipment tracking
│   │   ├── shipmentController.js# Agent status updates
│   │   ├── deliveryAgentController.js
│   │   └── adminController.js   # Dashboard, reports, assign
│   ├── middleware/
│   │   └── auth.js              # JWT verify + role check
│   ├── models/
│   │   ├── index.js             # All associations
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── DeliveryAgent.js
│   │   ├── Courier.js
│   │   ├── TrackingHistory.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── couriers.js
│   │   ├── tracking.js
│   │   ├── shipments.js
│   │   ├── deliveryAgents.js
│   │   └── admin.js
│   ├── seeders/
│   │   └── seed.js              # Demo data creation
│   ├── utils/
│   │   └── generateTracking.js  # Tracking number + charge calc
│   ├── .env
│   ├── server.js                # Express app entry point
│   ├── database.sqlite          # Auto-created SQLite DB
│   └── package.json
│
└── frontend/
    ├── css/
    │   └── style.css            # Global styles
    ├── js/
    │   ├── api.js               # All fetch() API calls
    │   └── utils.js             # Helpers: toast, format, auth guard
    ├── public/                  # No login required
    │   ├── index.html           # Home page
    │   ├── login.html
    │   ├── register.html
    │   ├── track.html           # Public tracker
    │   ├── about.html
    │   └── contact.html
    ├── customer/                # Requires customer login
    │   ├── dashboard.html
    │   ├── book-courier.html
    │   ├── my-couriers.html
    │   ├── courier-details.html
    │   ├── track.html
    │   └── profile.html
    ├── agent/                   # Requires agent login
    │   ├── dashboard.html
    │   ├── shipments.html
    │   ├── shipment-detail.html
    │   └── profile.html
    └── admin/                   # Requires admin login
        ├── dashboard.html
        ├── customers.html
        ├── agents.html
        ├── couriers.html
        ├── assign.html
        └── reports.html
```

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Runtime    | Node.js v24+ |
| Framework  | Express.js 5 |
| Database   | SQLite (via Sequelize ORM) |
| Auth       | JWT (jsonwebtoken) + bcryptjs |
| Frontend   | Vanilla HTML, CSS, JavaScript (no frameworks) |
| HTTP Client| Native fetch() API |

---

## Database Schema

### Users
| Column    | Type    | Notes |
|-----------|---------|-------|
| id        | INTEGER | PK, auto-increment |
| name      | STRING  | Required |
| email     | STRING  | Unique, validated |
| password  | STRING  | bcrypt hashed |
| phone     | STRING  | Optional |
| role      | ENUM    | customer / agent / admin |
| isActive  | BOOLEAN | Default true |

### Customers
| Column  | Type    | Notes |
|---------|---------|-------|
| id      | INTEGER | PK |
| userId  | INTEGER | FK → Users |
| address | TEXT    | |
| city    | STRING  | |
| state   | STRING  | |
| pincode | STRING  | |

### DeliveryAgents
| Column        | Type    | Notes |
|---------------|---------|-------|
| id            | INTEGER | PK |
| userId        | INTEGER | FK → Users |
| vehicleType   | STRING  | |
| vehicleNumber | STRING  | |
| serviceArea   | STRING  | |
| isAvailable   | BOOLEAN | |

### Couriers
| Column             | Type    | Notes |
|--------------------|---------|-------|
| id                 | INTEGER | PK |
| trackingNumber     | STRING  | Unique, e.g. BD2026123456 |
| customerId         | INTEGER | FK → Users |
| agentId            | INTEGER | FK → DeliveryAgents (nullable) |
| senderName         | STRING  | |
| senderPhone        | STRING  | |
| senderAddress      | TEXT    | |
| receiverName       | STRING  | |
| receiverPhone      | STRING  | |
| receiverAddress    | TEXT    | |
| pickupLocation     | STRING  | City |
| deliveryLocation   | STRING  | City |
| packageType        | ENUM    | document/parcel/fragile/electronics/clothing/other |
| packageWeight      | FLOAT   | kg |
| packageDescription | TEXT    | Optional |
| pickupDate         | DATEONLY| |
| deliveryType       | ENUM    | standard/express/overnight |
| deliveryCharge     | FLOAT   | Calculated automatically |
| paymentMethod      | ENUM    | cash/online/cod |
| paymentStatus      | ENUM    | pending/paid |
| status             | ENUM    | See statuses below |

### TrackingHistory
| Column    | Type    | Notes |
|-----------|---------|-------|
| id        | INTEGER | PK |
| courierId | INTEGER | FK → Couriers |
| status    | STRING  | |
| location  | STRING  | |
| remarks   | TEXT    | |
| updatedBy | INTEGER | FK → Users |
| timestamp | DATE    | |

### Payments
| Column        | Type    | Notes |
|---------------|---------|-------|
| id            | INTEGER | PK |
| courierId     | INTEGER | FK → Couriers |
| amount        | FLOAT   | |
| method        | ENUM    | cash/online/cod |
| status        | ENUM    | pending/paid/refunded |
| transactionId | STRING  | Optional |
| paidAt        | DATE    | Optional |

### Shipment Statuses

```
BOOKED → PICKED_UP → IN_TRANSIT → AT_HUB → OUT_FOR_DELIVERY → DELIVERED
                                                              → DELIVERY_FAILED
BOOKED → CANCELLED  (only before pickup)
```

---

## Setup & Installation

### Prerequisites
- Node.js v18 or higher — https://nodejs.org
- npm (comes with Node.js)

### Installation Steps

```bash
# 1. Navigate to the project folder
cd "courier-system/backend"

# 2. Install all dependencies
npm install

# 3. Seed the database with demo data
npm run seed
```

That's it. The SQLite database file (`database.sqlite`) is created automatically.

---

## Environment Variables

File: `backend/.env`

```env
PORT=5000
JWT_SECRET=courier_secret_key_2026
JWT_EXPIRES_IN=7d
DB_PATH=./database.sqlite
NODE_ENV=development
```

> **Note:** For production, change `JWT_SECRET` to a long random string.

---

## Running the Project

```bash
# Start the backend server
cd backend
npm start
```

Server starts at: **http://localhost:5000**

Then open the frontend in your browser:
- **Home Page:** Open `frontend/public/index.html` in a browser
- Or navigate directly to any page

> The frontend uses plain HTML files that make API calls to `http://localhost:5000`.
> No additional build step required.

---

## Demo Credentials

| Role            | Email                    | Password      |
|-----------------|--------------------------|---------------|
| 👑 Admin        | admin@courier.com        | Admin@123     |
| 👤 Customer     | customer@courier.com     | Customer@123  |
| 🚚 Delivery Agent | agent@courier.com      | Agent@123     |

### Sample Tracking Numbers

| Tracking Number | Status      | Route           |
|-----------------|-------------|-----------------|
| BD2026001001    | DELIVERED   | Mumbai → Delhi  |
| BD2026001002    | IN_TRANSIT  | Mumbai → Pune   |
| BD2026001003    | BOOKED      | Mumbai → Bangalore |

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication APIs

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "John@123",
  "phone": "9900000001"
}

Response 201:
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": 4, "name": "John Doe", "role": "customer" }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "customer@courier.com",
  "password": "Customer@123"
}

Response 200:
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": 2, "name": "Rahul Sharma", "role": "customer" }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "user": { "id": 2, "name": "Rahul Sharma", "email": "...", "role": "customer" }
}
```

#### Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>

{
  "name": "Rahul Sharma",
  "phone": "9800000002",
  "address": "123 MG Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

#### Change Password
```
PUT /auth/change-password
Authorization: Bearer <token>

{
  "currentPassword": "Customer@123",
  "newPassword": "NewPass@456"
}
```

---

### Courier APIs

#### Book a Courier
```
POST /couriers
Authorization: Bearer <customer-token>

{
  "senderName": "Rahul Sharma",
  "senderPhone": "9800000002",
  "senderAddress": "123 MG Road, Mumbai",
  "receiverName": "Priya Patel",
  "receiverPhone": "9700000001",
  "receiverAddress": "456 Park St, Delhi",
  "pickupLocation": "Mumbai",
  "deliveryLocation": "Delhi",
  "packageType": "parcel",
  "packageWeight": 2.0,
  "pickupDate": "2026-08-30",
  "deliveryType": "express",
  "paymentMethod": "online"
}

Response 201:
{
  "success": true,
  "trackingNumber": "BD2026xxxxxx",
  "courier": { "id": 5, "deliveryCharge": "108.00", ... }
}
```

#### Get My Couriers
```
GET /couriers
Authorization: Bearer <customer-token>
```

#### Get Courier by ID
```
GET /couriers/:id
Authorization: Bearer <token>
```

#### Cancel Courier (customer only, before pickup)
```
DELETE /couriers/:id
Authorization: Bearer <customer-token>
```

---

### Tracking API (Public — No Auth Required)

#### Track Shipment
```
GET /tracking/:trackingNumber

Example:
GET /tracking/BD2026001002

Response 200:
{
  "success": true,
  "courier": {
    "trackingNumber": "BD2026001002",
    "status": "IN_TRANSIT",
    "pickupLocation": "Mumbai",
    "deliveryLocation": "Pune",
    "senderName": "Rahul Sharma",
    "receiverName": "Amit Verma",
    "trackingHistory": [ ... ],
    "agent": { "name": "Suresh Kumar", "phone": "9800000003" }
  }
}
```

---

### Shipment APIs (Agent + Admin)

#### Get Shipments
```
GET /shipments
Authorization: Bearer <agent-or-admin-token>

# Agent sees only their assigned shipments
# Admin sees all shipments
```

#### Update Shipment Status
```
PUT /shipments/:id/status
Authorization: Bearer <agent-or-admin-token>

{
  "status": "PICKED_UP",
  "location": "Mumbai Hub",
  "remarks": "Package picked up from sender."
}

Valid statuses: BOOKED, PICKED_UP, IN_TRANSIT, AT_HUB,
               OUT_FOR_DELIVERY, DELIVERED, DELIVERY_FAILED, CANCELLED
```

---

### Delivery Agent APIs (Admin Only)

#### Get All Agents
```
GET /delivery-agents
Authorization: Bearer <admin-token>
```

#### Create Delivery Agent
```
POST /delivery-agents/create
Authorization: Bearer <admin-token>

{
  "name": "New Agent",
  "email": "newagent@courier.com",
  "password": "Agent@123",
  "phone": "9800000099",
  "vehicleType": "Bike",
  "vehicleNumber": "MH12CD5678",
  "serviceArea": "Pune, Nashik"
}
```

---

### Admin APIs

#### Dashboard Statistics
```
GET /admin/dashboard
Authorization: Bearer <admin-token>

Response:
{
  "stats": {
    "totalCustomers": 2,
    "totalAgents": 1,
    "totalCouriers": 4,
    "pendingShipments": 1,
    "inTransitShipments": 0,
    "deliveredShipments": 2,
    "failedDeliveries": 0,
    "totalRevenue": 270
  },
  "recentCouriers": [ ... ]
}
```

#### Get All Customers
```
GET /admin/customers
Authorization: Bearer <admin-token>
```

#### Get All Couriers (with search/filter)
```
GET /admin/couriers?search=BD2026&status=IN_TRANSIT
Authorization: Bearer <admin-token>
```

#### Assign Delivery Agent
```
PUT /admin/couriers/:id/assign
Authorization: Bearer <admin-token>

{ "agentId": 1 }
```

#### Get Reports
```
GET /admin/reports
Authorization: Bearer <admin-token>
```

#### Toggle User Status (Enable/Disable)
```
PUT /admin/users/:id/toggle
Authorization: Bearer <admin-token>
```

---

## Complete Flow

The end-to-end flow verified during testing:

```
1. Customer registers  →  POST /api/auth/register
2. Customer logs in    →  POST /api/auth/login  →  JWT token
3. Customer books      →  POST /api/couriers    →  trackingNumber: BD2026xxxxxx
4. Admin logs in       →  POST /api/auth/login  →  admin JWT
5. Admin assigns agent →  PUT /api/admin/couriers/:id/assign
6. Agent logs in       →  POST /api/auth/login  →  agent JWT
7. Agent: PICKED_UP    →  PUT /api/shipments/:id/status
8. Agent: IN_TRANSIT   →  PUT /api/shipments/:id/status
9. Agent: AT_HUB       →  PUT /api/shipments/:id/status
10. Agent: OUT_FOR_DELIVERY → PUT /api/shipments/:id/status
11. Agent: DELIVERED   →  PUT /api/shipments/:id/status
12. Customer tracks    →  GET /api/tracking/BD2026xxxxxx  →  7 history entries ✅
```

All 12 steps tested and passing.

---

## Pages Reference

### Public Pages (No Login Required)
| Page | File | Description |
|------|------|-------------|
| Home | `public/index.html` | Landing page with quick tracker |
| Login | `public/login.html` | Login with demo credential buttons |
| Register | `public/register.html` | Customer registration |
| Track | `public/track.html` | Public shipment tracker |
| About | `public/about.html` | About the company |
| Contact | `public/contact.html` | Contact form |

### Customer Pages (Login Required)
| Page | File | Description |
|------|------|-------------|
| Dashboard | `customer/dashboard.html` | Stats + recent couriers |
| Book Courier | `customer/book-courier.html` | Booking form with charge calculator |
| My Couriers | `customer/my-couriers.html` | Filtered list of all bookings |
| Courier Details | `customer/courier-details.html` | Full details + timeline |
| Track Shipment | `customer/track.html` | Track any shipment |
| Profile | `customer/profile.html` | Edit info + change password |

### Delivery Agent Pages (Login Required)
| Page | File | Description |
|------|------|-------------|
| Dashboard | `agent/dashboard.html` | Stats + recent assignments |
| Assigned Shipments | `agent/shipments.html` | All assigned couriers |
| Shipment Detail | `agent/shipment-detail.html` | Full details + status updater |
| Profile | `agent/profile.html` | Edit vehicle info + password |

### Admin Pages (Login Required)
| Page | File | Description |
|------|------|-------------|
| Dashboard | `admin/dashboard.html` | Full system overview |
| Customers | `admin/customers.html` | Customer list + enable/disable |
| Delivery Agents | `admin/agents.html` | Agent list + add new agent |
| All Couriers | `admin/couriers.html` | Search + filter all couriers |
| Assign Agent | `admin/assign.html` | Assign agent + update status |
| Reports | `admin/reports.html` | Charts + analytics |

---

## Delivery Charge Calculation

| Delivery Type | Rate per kg | Min Charge |
|---------------|-------------|------------|
| Standard      | ₹30/kg      | ₹50        |
| Express       | ₹54/kg      | ₹50        |
| Overnight     | ₹75/kg      | ₹50        |

Formula: `max(weight × rate, 50)`

---

## Postman Examples

### 1. Login (copy the token)
```
POST http://localhost:5000/api/auth/login
Body (JSON): {"email":"admin@courier.com","password":"Admin@123"}
```

### 2. Book a Courier
```
POST http://localhost:5000/api/couriers
Header: Authorization: Bearer <customer-token>
Body (JSON):
{
  "senderName":"Test Sender","senderPhone":"9800000001",
  "senderAddress":"123 Test St, Mumbai","receiverName":"Test Receiver",
  "receiverPhone":"9700000001","receiverAddress":"456 Test Ave, Delhi",
  "pickupLocation":"Mumbai","deliveryLocation":"Delhi",
  "packageType":"parcel","packageWeight":1.5,"pickupDate":"2026-09-01",
  "deliveryType":"express","paymentMethod":"online"
}
```

### 3. Track a Shipment (no auth needed)
```
GET http://localhost:5000/api/tracking/BD2026001001
```

### 4. Update Status (as agent)
```
PUT http://localhost:5000/api/shipments/1/status
Header: Authorization: Bearer <agent-token>
Body (JSON):
{
  "status": "PICKED_UP",
  "location": "Mumbai Hub",
  "remarks": "Picked up successfully"
}
```

### 5. Assign Agent (as admin)
```
PUT http://localhost:5000/api/admin/couriers/3/assign
Header: Authorization: Bearer <admin-token>
Body (JSON): {"agentId": 1}
```

---

## Security Features

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire after 7 days
- Role-based route guards (customer/agent/admin)
- Customers cannot access admin or agent endpoints
- Agents can only update their own assigned shipments
- Courier cancellation only allowed before pickup (BOOKED status)

---

*College Software Engineering Lab Project — BlueDart Express Courier Management System*
