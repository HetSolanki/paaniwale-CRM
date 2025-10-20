# 🚰 Dhandha - Water Bottle Delivery Business Management Platform

> A comprehensive full-stack solution for managing water bottle delivery businesses, party orders, invoicing, and payment collection with automated WhatsApp communication.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://paaniwale.hetsolanki.tech)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Dhandha** is a modern, production-ready business management platform specifically designed for water bottle delivery businesses operating in India. The system automates the entire order-to-payment cycle, eliminating manual paperwork and streamlining operations.

### Business Problem Solved

Traditional water delivery businesses face challenges:

- Manual order tracking on paper ledgers
- Time-consuming invoice generation
- Delayed payment collection
- No delivery route optimization
- Limited customer communication

### Our Solution

Dhandha provides a complete digital transformation:

- **Digital Order Management**: Track all daily deliveries and party orders in one place
- **Automated Invoicing**: Generate professional PDF invoices with one click
- **Instant Delivery**: Send invoices via WhatsApp automatically
- **Payment Integration**: Create and share payment links instantly
- **Route Optimization**: Organize deliveries by sequence for efficient routes
- **Multi-tenancy**: Multiple businesses can use the same platform independently

### Target Users

- Small to medium water bottle delivery businesses
- Beverage distributors handling events and parties
- Household water delivery services
- Corporate water supply vendors

---

## ✨ Key Features

### 📊 Dashboard & Analytics

- **Real-time Statistics**: Total customers, active orders, revenue tracking
- **Quick Overview**: Recent orders and pending deliveries at a glance
- **Performance Metrics**: Daily, weekly, monthly revenue reports
- **Customer Insights**: Top customers, delivery frequency analysis

### 👥 Customer Management

- **Complete CRM**: Store customer details, addresses, pricing
- **Route Optimization**: Delivery sequence numbering for efficient routes
- **Search & Filter**: Quick customer lookup by name or phone
- **Bulk Operations**: Import/export customer data via CSV

### 🎉 Party Order System

- **Event Management**: Handle weddings, functions, corporate events
- **Dual Pricing**: Separate pricing for cold and normal bottles
- **Order Tracking**: Status workflow (Pending → Confirmed → Delivered)
- **Custom Invoicing**: Professional invoices with event details

### 📄 Invoice Generation

- **PDF Creation**: Client-side PDF generation using jsPDF
- **Custom Branding**: Shop logo, name, address on invoices
- **Itemized Billing**: Detailed breakdown of quantities and prices
- **Cloud Storage**: Automatic upload to Cloudinary CDN
- **Bulk Sending**: Send invoices to all customers at once

### 💳 Payment Collection

- **Razorpay Integration**: Create payment links instantly
- **Multiple Methods**: UPI, cards, net banking, wallets
- **Auto Notifications**: SMS and email payment reminders
- **Payment Tracking**: Monitor payment status in real-time
- **Reconciliation**: Automatic payment-to-order matching

### 📱 WhatsApp Integration

- **Template Messages**: Pre-approved business message templates
- **Document Sharing**: Send PDF invoices as WhatsApp attachments
- **Payment Links**: Share Razorpay links via WhatsApp
- **Bulk Messaging**: Send to multiple customers sequentially
- **Delivery Status**: Message delivery tracking and reporting

### 🔐 Security & Authentication

- **JWT Authentication**: Secure token-based login system
- **Role-Based Access**: Admin and user role separation
- **Multi-tenancy**: Complete data isolation between users
- **Password Security**: Bcrypt hashing with 10 salt rounds
- **API Protection**: All sensitive endpoints require authentication

### 📈 Additional Features

- **Dark Mode**: Full light/dark theme support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Data Export**: Export reports to CSV/Excel
- **Backup System**: Automatic database backups
- **Error Logging**: Comprehensive error tracking and reporting
- **Offline Support**: PWA capabilities for offline functionality

---

## 🛠 Tech Stack

### Frontend

| Technology          | Version | Purpose                                              |
| ------------------- | ------- | ---------------------------------------------------- |
| **React**           | 18.3    | UI library with hooks and functional components      |
| **Vite**            | 5.4     | Next-generation build tool (10x faster than Webpack) |
| **React Router**    | 6.x     | Client-side routing and navigation                   |
| **React Query**     | 5.x     | Server state management and caching                  |
| **shadcn/ui**       | Latest  | Customizable component library (Radix UI based)      |
| **Tailwind CSS**    | 3.x     | Utility-first CSS framework                          |
| **Lucide React**    | Latest  | Beautiful icon library                               |
| **jsPDF**           | 2.x     | Client-side PDF generation                           |
| **React Hook Form** | 7.x     | Form validation and state management                 |
| **Zod**             | 3.x     | TypeScript-first schema validation                   |

### Backend

| Technology            | Version | Purpose                            |
| --------------------- | ------- | ---------------------------------- |
| **Node.js**           | 18+     | JavaScript runtime environment     |
| **Express.js**        | 4.x     | Web application framework          |
| **MongoDB**           | 7.0     | NoSQL document database            |
| **Mongoose**          | 7.x     | MongoDB ODM with schema validation |
| **JWT**               | 9.x     | JSON Web Token authentication      |
| **bcrypt**            | 5.x     | Password hashing library           |
| **express-validator** | 7.x     | Request validation middleware      |
| **cors**              | 2.x     | Cross-Origin Resource Sharing      |

### Third-Party Integrations

| Service                   | Purpose                                |
| ------------------------- | -------------------------------------- |
| **WhatsApp Business API** | Automated invoice and message delivery |
| **Razorpay**              | Payment gateway for payment links      |
| **Cloudinary**            | Cloud storage for PDF invoices         |

### DevOps & Tools

| Tool               | Purpose                          |
| ------------------ | -------------------------------- |
| **Docker**         | Containerization and deployment  |
| **Docker Compose** | Multi-container orchestration    |
| **Jenkins**        | CI/CD pipeline automation        |
| **Nginx**          | Reverse proxy and load balancing |
| **Git**            | Version control                  |
| **ESLint**         | Code quality and linting         |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React SPA + Vite + React Query + shadcn/ui                │ │
│  │  - Dynamic routing, state management, UI components        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (Server)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Express.js REST API                                       │ │
│  │  - JWT Auth Middleware                                     │ │
│  │  - Route Handlers (10 routes)                              │ │
│  │  - Business Logic Layer                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ MongoDB Protocol
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (Database)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MongoDB + Mongoose                                        │ │
│  │  - 7 Collections: Users, Customers, Entries, Orders, etc. │ │
│  │  - Indexes, Validation, Relationships                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ External APIs
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                         │
│  ┌──────────────┬────────────────┬─────────────────────────┐   │
│  │  WhatsApp    │   Razorpay     │    Cloudinary           │   │
│  │  Business    │   Payment      │    Cloud Storage        │   │
│  │  Messaging   │   Gateway      │    PDF Hosting          │   │
│  └──────────────┴────────────────┴─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

**Stateless Backend (JWT):**

- Enables horizontal scaling across multiple servers
- No server-side session storage required
- Mobile-friendly authentication

**Client-Side PDF Generation:**

- Reduces server load (CPU-intensive operation)
- Instant preview for users
- Works offline

**React Query Caching:**

- Reduces API calls by 80%
- Instant data access from cache
- Background refetching keeps data fresh

**Multi-Tenancy Design:**

- Every resource associated with user ID
- Complete data isolation
- Single codebase serves multiple businesses

For detailed architecture diagrams and explanations, see [ARCHITECTURE.md](documentation/ARCHITECTURE.md)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **MongoDB** 7.0 or higher ([Download](https://www.mongodb.com/try/download/community)) or MongoDB Atlas account
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn** (comes with Node.js)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/HetSolanki/Dhandha.git
cd Dhandha
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Install Backend Dependencies

```bash
cd server/API
npm install
cd ../..
```

#### 4. Configure Environment Variables

Create `.env` file in the root directory:

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_id
VITE_WHATSAPP_USER_ACCESS_TOKEN=your_whatsapp_token
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Create `.env` file in `server/API/` directory:

```env
# Backend Environment Variables
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dhandha
JWT_SECRET=your_super_secret_jwt_key_change_this
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### 5. Start MongoDB

```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, connection string is in MONGODB_URI
```

#### 6. Run the Application

**Option A: Development Mode (Separate Terminals)**

Terminal 1 - Backend:

```bash
cd server/API
npm run dev
```

Terminal 2 - Frontend:

```bash
npm run dev
```

**Option B: Using Docker Compose**

```bash
docker-compose up --build
```

#### 7. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/health

### First-Time Setup

1. **Create Admin Account:**

   - Navigate to signup page
   - Register with your details
   - Manually set `is_admin: true` in MongoDB for admin access

2. **Configure Shop Details:**

   - Login to dashboard
   - Go to Settings → Shop
   - Add shop name, address, logo

3. **Add First Customer:**

   - Navigate to Customers
   - Click "Add Customer"
   - Fill in details and save

4. **Test Invoice Generation:**
   - Go to Party Orders
   - Create a test order
   - Generate and preview invoice

---

## 📁 Project Structure

```
Dhandha/
├── public/                          # Static assets
│   └── vite.svg                     # App icon
│
├── src/                             # Frontend source code
│   ├── assets/                      # Images, logos, icons
│   │   ├── logo.svg
│   │   ├── logo-white.svg
│   │   └── ...
│   │
│   ├── Components/                  # React components
│   │   ├── Section/                 # Page-level components
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── Customers.jsx        # Customer management
│   │   │   ├── CustomerEntry.jsx    # Daily entries
│   │   │   ├── PartyOrders.jsx      # Bulk orders
│   │   │   ├── Invoice.jsx          # Single invoice
│   │   │   ├── InvoiceAll.jsx       # Bulk invoices
│   │   │   └── PaymentDetails.jsx   # Payment tracking
│   │   │
│   │   ├── UI/                      # Reusable UI components
│   │   │   ├── shadcn-UI/           # Base components
│   │   │   └── UI-Components/       # Custom components
│   │   │
│   │   ├── DataTables/              # Table components
│   │   └── Admin/                   # Admin features
│   │
│   ├── Context/                     # React Context providers
│   │   ├── UserContext.jsx          # Auth & user state
│   │   ├── ThemeProviderContext.tsx # Theme management
│   │   └── ...
│   │
│   ├── Handlers/                    # API call functions
│   │   ├── SignInHandler.js
│   │   ├── AddcustomerHandler.js
│   │   ├── PartyOrderHandler.js
│   │   ├── CreatepaymentLinkHandler.js
│   │   └── ...
│   │
│   ├── Hooks/                       # Custom React hooks
│   │   ├── fetchCustomer.js
│   │   ├── fetchUser.js
│   │   └── ...
│   │
│   ├── ColumnsSchema/               # Table column definitions
│   │   ├── CustomersColumns.tsx
│   │   ├── PartyOrderColumns.tsx
│   │   └── ...
│   │
│   ├── lib/                         # Utility functions
│   │   ├── utils.ts                 # Helper functions
│   │   └── errorHandler.ts          # Error handling
│   │
│   ├── Data/                        # Static data
│   │   ├── meta.js                  # API configs
│   │   └── Navbar.js                # Nav structure
│   │
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
│
├── server/API/                      # Backend source code
│   ├── Handlers/                    # Business logic controllers
│   │   ├── User.js                  # User CRUD & auth
│   │   ├── Customer.js              # Customer management
│   │   ├── CustomerEntry.js         # Delivery tracking
│   │   ├── PartyOrder.js            # Party orders
│   │   ├── Payment_Link.js          # Razorpay integration
│   │   ├── PaymentDetials.js        # Payment records
│   │   ├── Shop.js                  # Shop management
│   │   ├── Stats.js                 # Analytics
│   │   └── Inquiry.js               # Customer inquiries
│   │
│   ├── routes/                      # Express route definitions
│   │   ├── user_route.js            # /api/auth/*
│   │   ├── customer_route.js        # /api/customers/*
│   │   ├── customerEntry_route.js   # /api/customerentry/*
│   │   ├── partyOrder_route.js      # /api/partyorder/*
│   │   ├── payment_link_route.js    # /api/paymentlink/*
│   │   ├── paymentdetails_route.js  # /api/paymentdetails/*
│   │   ├── shop_route.js            # /api/shop/*
│   │   ├── stats_route.js           # /api/stats/*
│   │   └── inquiry_route.js         # /api/inquiry/*
│   │
│   ├── Schema/                      # Mongoose models
│   │   ├── user.js                  # User schema
│   │   ├── customer.js              # Customer schema
│   │   ├── customerEntry.js         # Entry schema
│   │   ├── partyOrder.js            # Party order schema
│   │   ├── PaymentDetail.js         # Payment schema
│   │   ├── shop.js                  # Shop schema
│   │   └── inquiry.js               # Inquiry schema
│   │
│   ├── Module/                      # Utility modules
│   │   ├── auth.js                  # JWT middleware
│   │   ├── middleware.js            # General middleware
│   │   └── cloudinaryHandler.js     # File uploads
│   │
│   ├── server.js                    # Express app config
│   ├── index.js                     # Server entry point
│   ├── connect.js                   # MongoDB connection
│   └── package.json                 # Backend dependencies
│
├── documentation/                   # Project documentation
│   ├── ARCHITECTURE.md              # System architecture
│   ├── API_REFERENCE_COMPLETE.md    # Complete API docs
│   ├── OVERVIEW.md                  # Project overview
│   ├── FLOW.md                      # User & data flows
│   ├── INTEGRATIONS.md              # Third-party APIs
│   └── ERROR_HANDLING.md            # Error strategies
│
├── docker-compose.yml               # Docker orchestration
├── Dockerfile                       # Docker image config
├── Jenkinsfile                      # CI/CD pipeline
├── nginx.conf                       # Nginx configuration
├── vercel.json                      # Vercel deployment
├── package.json                     # Frontend dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind config
├── components.json                  # shadcn/ui config
└── README.md                        # This file
```

---

## 📚 API Documentation

### Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://api.paaniwale.hetsolanki.tech/api`

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Main API Endpoints

#### Authentication & Users

- `POST /api/auth/login` - User login
- `POST /api/auth/user` - Create user
- `GET /api/auth/userall` - Get all users (admin)
- `GET /api/auth/user/:id` - Get user by ID
- `PUT /api/auth/user/:id` - Update user
- `PUT /api/auth/bank` - Update bank details
- `DELETE /api/auth/user/:id` - Delete user

#### Customers

- `POST /api/customers/customer` - Create customer
- `GET /api/customers/customerall` - Get all customers
- `GET /api/customers/customer/:id` - Get customer
- `PUT /api/customers/customer/:id` - Update customer
- `DELETE /api/customers/customer/:id` - Delete customer

#### Customer Entries

- `POST /api/customerentry/create` - Create entry
- `GET /api/customerentry/all` - Get all entries
- `PUT /api/customerentry/update/:id` - Update entry
- `DELETE /api/customerentry/delete/:id` - Delete entry

#### Party Orders

- `POST /api/partyorder/create` - Create order
- `GET /api/partyorder/all` - Get all orders
- `GET /api/partyorder/:id` - Get order
- `PUT /api/partyorder/update/:id` - Update order
- `PUT /api/partyorder/invoice/:id` - Update invoice status
- `DELETE /api/partyorder/delete/:id` - Delete order

#### Payments

- `POST /api/paymentlink/create` - Create payment link
- `POST /api/paymentlink/createall` - Bulk payment links
- `GET /api/paymentdetails/all` - Get payment records
- `POST /api/paymentdetails/create` - Create payment record

#### Shop & Statistics

- `POST /api/shop/create` - Create shop
- `GET /api/shop/all` - Get shops
- `PUT /api/shop/update/:id` - Update shop
- `GET /api/stats/dashboard` - Get statistics

For complete API documentation with request/response examples, see [API_REFERENCE_COMPLETE.md](documentation/API_REFERENCE_COMPLETE.md)

---

## ⚙️ Environment Configuration

### Frontend Environment Variables (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# WhatsApp Business API
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
VITE_WHATSAPP_USER_ACCESS_TOKEN=your_access_token

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Backend Environment Variables (server/API/.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dhandha

# Authentication
JWT_SECRET=your_super_secret_key_minimum_32_characters

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
```

### Getting API Keys

**WhatsApp Business API:**

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create app → WhatsApp Business
3. Get Phone Number ID and Access Token from dashboard

**Razorpay:**

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Settings → API Keys
3. Generate test/live API keys

**Cloudinary:**

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Dashboard → Settings → Upload
3. Create unsigned upload preset
4. Copy cloud name and preset name

---

## 🚢 Deployment

### Docker Deployment

**Build and run with Docker Compose:**

```bash
docker-compose up --build -d
```

**View logs:**

```bash
docker-compose logs -f
```

**Stop services:**

```bash
docker-compose down
```

### Vercel Deployment (Frontend)

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### Railway/Render Deployment (Backend)

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd server/API && npm install`
4. Set start command: `cd server/API && node index.js`
5. Add environment variables in dashboard

### MongoDB Atlas (Database)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (M0 free tier or M10+ for production)
3. Configure network access (add your IP or allow all)
4. Create database user
5. Get connection string and update MONGODB_URI

---

## 📖 Documentation

Comprehensive documentation is available in the `documentation/` folder:

- **[ARCHITECTURE.md](documentation/ARCHITECTURE.md)** - Complete system architecture, technology stack explanations, data flow diagrams, deployment strategies
- **[API_REFERENCE_COMPLETE.md](documentation/API_REFERENCE_COMPLETE.md)** - Complete API documentation with all endpoints, request/response formats, error handling
- **[OVERVIEW.md](documentation/OVERVIEW.md)** - Project overview, features, and business context
- **[FLOW.md](documentation/FLOW.md)** - User flows and data flow diagrams
- **[INTEGRATIONS.md](documentation/INTEGRATIONS.md)** - Third-party API integration guides
- **[ERROR_HANDLING.md](documentation/ERROR_HANDLING.md)** - Error handling strategies and patterns

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

1. Check if issue already exists
2. Create detailed bug report with steps to reproduce
3. Include screenshots if applicable

### Suggesting Features

1. Open feature request issue
2. Describe the feature and use case
3. Explain why it would be useful

### Code Contributions

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style Guidelines

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Write descriptive commit messages
- Ensure no linting errors: `npm run lint`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**Het Solanki**

- GitHub: [@HetSolanki](https://github.com/HetSolanki)
- Website: [hetsolanki.tech](https://hetsolanki.tech)
- LinkedIn: [Het Solanki](https://linkedin.com/in/hetsolanki)

**Dhruv Prajapati**

- GitHub: [@dhruvp66572](https://github.com/dhruvp66572)
- Website: [dhruvprajapati.tech](https://dhruvprajapati.tech)
- LinkedIn: [Dhruv Prajapati](https://www.linkedin.com/in/dhruv-prajapati-088721260/)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The UI library
- [Vite](https://vitejs.dev/) - The build tool
- [shadcn/ui](https://ui.shadcn.com/) - The component library
- [Tailwind CSS](https://tailwindcss.com/) - The CSS framework
- [MongoDB](https://www.mongodb.com/) - The database
- [Express.js](https://expressjs.com/) - The backend framework
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Cloudinary](https://cloudinary.com/) - Cloud storage
- Meta - WhatsApp Business API

---

## 📞 Support

For support and queries:

- 📧 Email: paaniwale7@gmail.com
- 💬 GitHub Issues: [Create an issue](https://github.com/HetSolanki/Dhandha/issues)
- 📱 WhatsApp: [Business Support](https://wa.me/919909066572)

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Mobile app (React Native)
- [ ] SMS notifications (Twilio integration)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Inventory management
- [ ] Employee management module
- [ ] Subscription-based recurring orders
- [ ] Customer mobile app for order placement
- [ ] GPS tracking for delivery personnel
- [ ] QR code-based delivery confirmation

### Performance Improvements

- [ ] Redis caching layer
- [ ] GraphQL API option
- [ ] WebSocket for real-time updates
- [ ] Progressive Web App (PWA) enhancement
- [ ] Server-side rendering (SSR)

---

<div align="center">

**Made with ❤️ by Het Solanki & Dhruv Prajapati**

⭐ Star this repository if you find it helpful!

</div>
