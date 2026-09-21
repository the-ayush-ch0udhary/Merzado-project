# ProcureFlow — B2B RFQ Marketplace

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) web application where **Buyers** post procurement requirements (RFQs) and **Suppliers** discover business opportunities and submit competitive quotations in Indian Rupees (**₹**).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide Icons, Vanilla CSS (Light/Dark themes, solid design, zero glassmorphism).
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS.
- **Database**: MongoDB & Mongoose with automatic resilient in-memory fallback (works 100% out-of-the-box even without local MongoDB).
- **Currency**: Standardized Indian Rupee (**₹**).

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
> Server runs on **`http://localhost:5000`** (Health check: `http://localhost:5000/api/health`)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Client runs on **`http://localhost:5173`**

---

## 🔑 Demo Credentials

Use the **1-Click Demo Login** buttons on the login page or enter credentials manually:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@demo.com` | `password123` | Posts & manages RFQs, reviews bids, awards deals |
| **Supplier** | `supplier@demo.com` | `password123` | Browses marketplace, submits & revises quotations |

---

## 🚀 Key Features

### 🏢 Buyer Workflow
- **Create & Manage RFQs**: Product title, category, description, quantity & unit, delivery location, future deadline, optional target budget (₹).
- **Edit & Status Control**: Update specifications, close/reopen RFQs, or delete records.
- **Quote Comparison & Awarding**: Side-by-side quote review with automatic **Best Price** highlight. Accepting a quote awards the RFQ and automatically marks competing bids as rejected.

### 🏭 Supplier Workflow
- **Marketplace Discovery**: Real-time keyword search, category filters, and deadline sorting.
- **Bidding & Revision**: Submit and revise quotes with price (₹), delivery lead time, and commercial notes before the deadline.
- **Supplier Hub**: Track bid statuses (`PENDING`, `ACCEPTED`, `REJECTED`) and total awarded contract value.

### 🔒 Security & Design
- **JWT Authentication & RBAC**: Role-based access control protecting buyer/supplier routes.
- **Dual Themes**: Instant **Light & Dark Mode** toggle with persistent user preference.
- **Solid Corporate Design**: Clean, modern interface with high contrast and zero glassmorphism.

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Buyer or Supplier |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `POST` | `/api/auth/demo-login` | Public | 1-click evaluation login |
| `GET` | `/api/rfqs` | Public/Auth | Browse marketplace with search & filters |
| `POST` | `/api/rfqs` | Buyer | Create new RFQ with validation |
| `GET` | `/api/rfqs/buyer/my-rfqs`| Buyer | View buyer's active and past RFQs |
| `PUT` | `/api/rfqs/:id` | Buyer | Edit RFQ specifications |
| `PATCH`| `/api/rfqs/:id/status` | Buyer | Change RFQ status (`OPEN` / `CLOSED`) |
| `DELETE`| `/api/rfqs/:id` | Buyer | Delete RFQ and cascade quotes |
| `POST` | `/api/quotations/rfq/:rfqId` | Supplier | Submit or revise commercial quotation |
| `GET` | `/api/quotations/rfq/:rfqId` | Buyer | Review received quotations for RFQ |
| `GET` | `/api/quotations/my-quotes` | Supplier | View supplier's submitted bids |
| `PATCH`| `/api/quotations/:id/status`| Buyer | Accept or reject a quotation |

---

## 👨‍💻 Submission Information

- **Candidate Name**: Ayush Kumar Choudhary
- **Assignment**: Full-Stack Mini B2B RFQ Marketplace
- **Stack**: MERN (MongoDB, Express.js, React, Node.js)