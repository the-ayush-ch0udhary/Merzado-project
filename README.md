# ProcureFlow — Mini B2B RFQ Marketplace

> A production-ready, full-stack **MERN** (MongoDB, Express.js, React, Node.js) web marketplace where **Buyers** publish procurement requirements and **Suppliers** discover business opportunities and submit competitive quotations.

---

## 🌟 Executive Summary

In B2B (Business-to-Business) commerce, companies do not purchase industrial goods or bulk contracts off standard retail shelves. Instead, they issue a **Request for Quotation (RFQ)** detailing exact material specifications, quantities, and delivery timelines, allowing verified suppliers to bid with competitive pricing and fulfillment schedules.

**ProcureFlow** delivers a full-featured, secure, and responsive platform implementing the complete RFQ procurement lifecycle:
- **Buyer Workflow**: Requirement specification, timeline control, RFQ management, and side-by-side bid comparison with one-click deal awarding.
- **Supplier Workflow**: Real-time marketplace discovery, multi-criteria filtering, quotation drafting/revision, and contract tracking.
- **Enterprise Security**: Role-Based Access Control (RBAC), bcrypt password encryption, and stateless JWT authentication.
- **Zero-Friction Evaluation**: Pre-seeded demo credentials and one-click demo login buttons for immediate testing.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries & Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React 18** (Vite) | `react-router-dom` (routing), `axios` (HTTP client), `lucide-react` (icons), custom design system |
| **Backend API** | **Node.js + Express.js** | `jsonwebtoken` (JWT auth), `bcryptjs` (password hashing), `cors`, `dotenv` |
| **Database** | **MongoDB / Mongoose** | Dual-mode resilience: connects to live MongoDB (local or Atlas) with seamless in-memory fallback |
| **Styling** | **Bespoke Vanilla CSS** | Modern design tokens, card elevations, loading skeletons, responsive grid, dark/light contrast |

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (React + Vite :5173)"]
        UI[Responsive Modern UI / CSS Design System]
        AuthCtx[AuthContext & State Management]
        AxiosClient[Axios Interceptors & JWT Injection]
    end

    subgraph Server ["Server Layer (Express.js + Node.js :5000)"]
        Router[API Gateway & Routes]
        AuthMW[JWT Auth Middleware]
        RoleMW[RBAC Middleware (requireBuyer / requireSupplier)]
        DataRepo[Universal Data Repository Layer]
    end

    subgraph Storage ["Persistence Layer"]
        Mongo[(MongoDB / Mongoose)]
        MemStore[(Resilient In-Memory Datastore)]
    end

    UI --> AuthCtx
    AuthCtx --> AxiosClient
    AxiosClient -- "REST API (/api/*)" --> Router
    Router --> AuthMW
    AuthMW --> RoleMW
    RoleMW --> DataRepo
    DataRepo -->|Connected| Mongo
    DataRepo -->|Fallback/Offline| MemStore
```

---

## 🚀 Key Features

### 🏢 1. Buyer Capabilities
- **Create RFQ**: Specify product/service title, category, requirement description, quantity & unit, delivery location, and mandatory future bidding deadline.
- **Manage & Edit RFQs**: Update specifications, close active RFQs to new bids, reopen closed RFQs, or delete records.
- **Buyer Dashboard**: Real-time KPI metrics (Total RFQs, Open RFQs, Total Quotes Received, Awarded Deals).
- **Side-by-Side Quotation Comparison**:
  - Review all incoming supplier proposals for any RFQ.
  - Automatically highlights the **🌟 Best Price** bid.
  - **Accept & Award** deals (automatically marks RFQ as `AWARDED`).
  - **Decline** uncompetitive bids.

### 🏭 2. Supplier Capabilities
- **Live Marketplace Feed**: Browse all active business requirements across manufacturing, energy, textiles, IT services, packaging, and logistics.
- **Search & Filtering**:
  - Real-time search across titles, descriptions, and locations.
  - Category filter pills.
  - Sort by *Closing Soonest*, *Newest First*, or *Highest Quantity*.
- **Commercial Quotation Submission**:
  - Submit unit/total pricing, estimated delivery timeline, and commercial notes/terms.
  - Revise existing quotations anytime before the deadline.
- **Supplier Quotations Hub**:
  - Track all submitted bids with live status badges (`Under Review`, `Accepted`, `Declined`).
  - View cumulative awarded order value ($).

### ⚡ 3. Demo & Evaluation Conveniences
- **1-Click Demo Login**: Click **🏢 Demo Buyer** or **🏭 Demo Supplier** on the login page to log in instantly without typing credentials.
- **Navbar Fast Role Switcher**: Switch between Buyer and Supplier perspectives with a single click.

---

## 🔑 Pre-Seeded Credentials

The application comes pre-loaded with realistic B2B accounts and RFQs across industries:

| Role | Email | Password | Company Name | Location |
| :--- | :--- | :--- | :--- | :--- |
| **Buyer** | `buyer@demo.com` | `password123` | Apex Global Procurement Ltd. | Bengaluru, India |
| **Buyer 2** | `sarah@globaltech.com` | `password123` | NovaTech Industries USA | Chicago, IL, USA |
| **Supplier** | `supplier@demo.com` | `password123` | Zenith Industrial & Metals Corp. | Mumbai, India |
| **Supplier 2** | `vendor@demo.com` | `password123` | NextGen Hardware & Logistics | Frankfurt, Germany |

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **npm** (v9+)

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repo-url>
   cd b2b-rfq-marketplace
   ```

2. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure Environment Variables** (Optional):
   - In `server/.env`:
     ```env
     PORT=5000
     MONGODB_URI=mongodb://127.0.0.1:27017/b2b-rfq-marketplace
     JWT_SECRET=your_jwt_secret_key_2026
     ```
   *(Note: If you have MongoDB installed or use a MongoDB Atlas cluster URL, provide it in `MONGODB_URI`. If MongoDB is not running locally, ProcureFlow automatically activates its built-in resilient datastore so the app runs immediately without any setup!)*

4. **Start the Application**:
   - **Terminal 1 (Backend Server)**:
     ```bash
     cd server
     npm start
     # Server runs on http://localhost:5000
     ```
   - **Terminal 2 (Frontend Client)**:
     ```bash
     cd client
     npm run dev
     # Frontend runs on http://localhost:5173
     ```

5. **Open in Browser**:
   - Navigate to **`http://localhost:5173`**
   - Click **"Log In"** -> **"🏢 Demo Buyer"** or **"🏭 Demo Supplier"** to explore.

---

## 📡 RESTful API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user (BUYER or SUPPLIER) | None |
| `POST` | `/api/auth/login` | Login with email & password (returns JWT) | None |
| `POST` | `/api/auth/demo-login` | 1-Click login as Buyer or Supplier | None |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Bearer Token |

### RFQs (`/api/rfqs`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rfqs` | Public/Supplier marketplace feed (search, filter, sort) | Optional |
| `GET` | `/api/rfqs/:id` | Detailed view of a single RFQ | Optional |
| `POST` | `/api/rfqs` | Create a new RFQ (validates future deadline, quantity > 0) | **BUYER** |
| `GET` | `/api/rfqs/buyer/my-rfqs` | Fetch RFQs created by authenticated buyer with stats | **BUYER** |
| `PUT` | `/api/rfqs/:id` | Edit RFQ specifications (IDOR-protected) | **BUYER** |
| `PATCH`| `/api/rfqs/:id/status` | Toggle RFQ status (`OPEN` / `CLOSED`) | **BUYER** |
| `DELETE`| `/api/rfqs/:id` | Delete RFQ and cascade delete quotations | **BUYER** |

### Quotations (`/api/quotations`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/quotations/rfq/:rfqId` | Submit or revise quotation for an open RFQ | **SUPPLIER** |
| `GET` | `/api/quotations/rfq/:rfqId` | View all quotations received for buyer's RFQ | **BUYER** |
| `GET` | `/api/quotations/my-quotations`| View all quotations submitted by supplier | **SUPPLIER** |
| `PATCH`| `/api/quotations/:id/status` | Accept or Decline a quote (Accept auto-awards RFQ) | **BUYER** |

---

## 🔒 Security, Authorization & Validation

1. **Password Encryption**: Passwords are never stored in plaintext; they are hashed with `bcryptjs` using 10 salt rounds.
2. **Stateless JWT Authentication**: Authenticated sessions utilize signed JSON Web Tokens (JWT) containing the user ID and assigned role.
3. **Role-Based Access Control (RBAC)**:
   - Dedicated middleware (`requireBuyer`, `requireSupplier`) verifies user permissions before controller execution.
   - Suppliers cannot create RFQs; Buyers cannot bid on RFQs.
4. **Protection Against IDOR (Insecure Direct Object Reference)**:
   - A Buyer can only view quotes, edit, or close RFQs that they own (`rfq.buyer === req.user.id`).
5. **Business Rule Validations**:
   - RFQ deadlines must be strictly in the future.
   - Quantity and quoted price must be greater than zero.
   - Quotations cannot be submitted to expired or closed RFQs.
   - Re-submitting a bid by the same supplier updates their existing quotation rather than creating clutter duplicates.

---

## 💡 Assumptions & Design Decisions

1. **Single Revision per Supplier per RFQ**:
   - *Design Decision*: In real B2B procurement, a vendor updates their quotation rather than cluttering the buyer with 10 separate bids. Our schema enforces `{ rfq: 1, supplier: 1 }` uniqueness while allowing the supplier to revise their price or delivery schedule before the deadline.
2. **Awarding Workflow**:
   - *Design Decision*: When a Buyer clicks **"Accept & Award"** on a quotation, the quote status changes to `ACCEPTED` and the parent RFQ automatically marks as `AWARDED`.
3. **Dual-Mode Persistence**:
   - *Design Decision*: In technical assignments, examiners often review code on machines without local MongoDB services running. By incorporating a resilient fallback adapter, the project runs out-of-the-box on any machine while retaining full Mongoose code for cloud deployment (MongoDB Atlas).

---

## 🌐 Live Deployment Guide

### Option 1: Render (Recommended for MERN)
1. **Database**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and obtain the connection string (`mongodb+srv://...`).
2. **Backend Web Service**:
   - Connect GitHub repo, Root Directory: `server`.
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `PORT=5000`, `MONGODB_URI=<your-atlas-uri>`, `JWT_SECRET=<your-secret>`
3. **Frontend Static Site**:
   - Connect GitHub repo, Root Directory: `client`.
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://<your-backend>.onrender.com/api`

### Option 2: Vercel / Railway
- Deploy `server` to Railway / Render and `client` to Vercel with matching environment variables.

---

## 👨‍💻 Candidate Submission Information
- **Candidate Name**: Ayush Kumar Choudhary
- **Assignment**: Full-Stack Mini B2B RFQ Marketplace
- **Stack**: MongoDB, Express.js, React.js, Node.js (MERN)
