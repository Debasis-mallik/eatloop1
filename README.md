# 🍜 EATLOOP — Full Stack Food Delivery Application

A production-ready food delivery platform inspired by **Zomato, Swiggy, and Uber Eats**, built with the **MERN Stack** and advanced **AI/ML features**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Real-time | Socket.io |
| Payments | Stripe + Razorpay |
| Email | Nodemailer |
| AI/ML | Custom recommendation engine, sentiment analysis |

---

## 📁 Project Structure

```
eatloop/
├── backend/
│   ├── config/         # DB config
│   ├── controllers/    # Auth, Restaurant, Order, AI logic
│   ├── middleware/     # JWT auth, authorization
│   ├── models/         # User, Restaurant, MenuItem, Order, etc.
│   ├── routes/         # All API routes
│   ├── utils/          # Email helper, DB seeder
│   └── server.js       # Entry point
│
└── frontend/
    └── src/
        ├── components/ # Navbar, Footer, Cards
        ├── context/    # Auth, Cart, Theme context
        ├── pages/      # Customer, Restaurant, Admin, Delivery
        ├── services/   # Axios API layer
        └── App.jsx     # Routes
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### 1. Clone / Copy the project
```bash
# If using git
git clone <your-repo-url>
cd eatloop

# Or just open the eatloop/ folder in VS Code
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your actual values (MongoDB URI, JWT secret, etc.)

# Seed the database with sample data
npm run seed

# Start backend server
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Run Both Together (from root)
```bash
# Install all dependencies
npm run install:all

# Run both concurrently
npm run dev
```

---

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@eatloop.com | admin123 |
| Restaurant Owner | raj@eatloop.com | password123 |
| Restaurant Owner 2 | priya@eatloop.com | password123 |
| Customer | aman@eatloop.com | password123 |

### 🎟️ Demo Coupon Codes
- `WELCOME50` — 50% off first order (max ₹100)
- `EATLOOP30` — Flat ₹30 off on ₹299+
- `HUNGRY100` — Flat ₹100 off on ₹599+

---

## 🌟 Core Features

### 👤 Customer Features
- [x] JWT-based registration & login
- [x] Location-based restaurant discovery
- [x] Restaurant search & cuisine filtering
- [x] Menu browsing with categories
- [x] Add to cart (multi-restaurant warning)
- [x] Coupon / promo code validation
- [x] Order placement (COD, Stripe, Razorpay, Wallet)
- [x] Real-time order tracking with Socket.io
- [x] Order history & status timeline
- [x] Food & delivery ratings
- [x] Wishlist management
- [x] Profile & address management
- [x] Dark / Light mode
- [x] Notifications

### 🍽️ Restaurant Partner Features
- [x] Restaurant registration & approval flow
- [x] Dashboard with today's revenue, orders
- [x] Menu management (add/edit/delete/toggle)
- [x] Order management with status workflow
- [x] Revenue analytics with charts
- [x] AI demand forecasting
- [x] Open/Close toggle

### 🚴 Delivery Partner Features
- [x] Partner registration with vehicle details
- [x] Online/Offline toggle
- [x] Live location sharing via GPS
- [x] Earnings dashboard
- [x] Delivery history
- [x] Performance ratings

### 🛡️ Admin Panel
- [x] Platform-wide dashboard stats
- [x] Restaurant approval / rejection / suspension
- [x] User management & suspension
- [x] Delivery partner management
- [x] Monthly revenue analytics
- [x] AI analytics overview

### 🤖 AI/ML Features
- [x] Smart recommendation engine (collaborative filtering)
- [x] AI food chatbot assistant
- [x] Sentiment analysis on reviews
- [x] Demand forecasting with charts
- [x] AI nutrition assistant
- [x] Delivery time prediction
- [x] Fraud detection (reviews + transactions)

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/forgot-password
PUT    /api/auth/reset-password/:token
PUT    /api/auth/update-password
```

### Restaurants
```
GET    /api/restaurants           # Get all (with filters)
GET    /api/restaurants/nearby    # Location-based
GET    /api/restaurants/:id       # Get with menu
POST   /api/restaurants           # Create (owner)
PUT    /api/restaurants/:id       # Update
GET    /api/restaurants/owner/analytics
PUT    /api/restaurants/owner/toggle-status
```

### Menu
```
GET    /api/menu/restaurant/:id
GET    /api/menu/search?q=biryani
POST   /api/menu
PUT    /api/menu/:id
DELETE /api/menu/:id
```

### Orders
```
POST   /api/orders                # Place order
GET    /api/orders/my             # Customer orders
GET    /api/orders/restaurant     # Restaurant orders
GET    /api/orders/:id
PUT    /api/orders/:id/status     # Update status
PUT    /api/orders/:id/cancel
PUT    /api/orders/:id/rate
```

### AI
```
GET    /api/ai/recommendations
POST   /api/ai/sentiment
GET    /api/ai/demand-forecast
POST   /api/ai/nutrition
POST   /api/ai/predict-delivery
POST   /api/ai/fraud-detect
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/restaurants
PUT    /api/admin/restaurants/:id/status
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle
GET    /api/admin/delivery-partners
PUT    /api/admin/delivery-partners/:id/status
GET    /api/admin/revenue
```

---

## 🔧 Environment Variables

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eatloop
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

CLIENT_URL=http://localhost:5173
```

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join_order` | Client → Server | Join order room for tracking |
| `join_restaurant` | Client → Server | Join restaurant room for orders |
| `order_status_updated` | Server → Client | Order status changed |
| `new_order` | Server → Restaurant | New order received |
| `delivery_location_update` | Partner → Server | Live GPS location |
| `location_updated` | Server → Customer | Delivery partner location |

---

## 📦 Key Dependencies

### Backend
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `jsonwebtoken` — JWT authentication
- `bcryptjs` — Password hashing
- `socket.io` — Real-time communication
- `nodemailer` — Email notifications
- `stripe` — Payment processing
- `razorpay` — Indian payment gateway
- `multer` — File uploads
- `helmet` — Security headers
- `express-rate-limit` — Rate limiting

### Frontend
- `react-router-dom` — Client-side routing
- `axios` — HTTP client
- `recharts` — Data visualization
- `socket.io-client` — Real-time updates
- `react-hot-toast` — Toast notifications
- `react-leaflet` — Map integration
- `framer-motion` — Animations

---

## 🎨 Design System

- **Primary Color:** `#FF4500` (EATLOOP Orange)
- **Font:** Inter (body), Poppins (headings)
- **Dark/Light mode** via CSS variables
- **Responsive** — works on mobile & desktop
- **Animations** — fade, slide, skeleton loaders

---

## 🚀 Deployment

### Backend (Railway / Render)
1. Push code to GitHub
2. Connect repo to Railway/Render
3. Set environment variables
4. Deploy

### Frontend (Vercel / Netlify)
1. Push frontend to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` if needed
4. Deploy

### MongoDB (Atlas)
1. Create free cluster at mongodb.com/atlas
2. Whitelist IPs
3. Copy connection string to `MONGO_URI`

---

## 👨‍💻 Author

**EATLOOP** — Built with ❤️ using MERN Stack + AI/ML

---

## 📄 License

MIT License — Free to use for educational & commercial purposes.
