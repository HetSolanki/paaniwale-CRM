# Dhandha - Complete Project Overview

## 📋 Project Summary
**Dhandha** is a comprehensive business management platform designed for water bottle delivery businesses. It manages customer orders, party/bulk orders, invoicing, payments, and automated WhatsApp communication.

## 🎯 Business Purpose
- **Primary Users:** Water bottle delivery businesses (e.g., "Paani wale")
- **Key Features:** 
  - Customer management and order tracking
  - Party order management (marriages, functions, events)
  - Automated invoice generation with PDF
  - Payment link integration (Razorpay)
  - WhatsApp invoice delivery
  - Dashboard analytics

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Data Fetching:** React Query (TanStack Query)
- **PDF Generation:** jsPDF
- **Routing:** React Router DOM
- **Forms:** React Hook Form
- **Tables:** TanStack Table

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Cloudinary
- **Payment Gateway:** Razorpay
- **Messaging:** WhatsApp Business API (Meta)

### DevOps & Deployment
- **Containerization:** Docker, Docker Compose
- **CI/CD:** Jenkins (Jenkinsfile included)
- **Web Server:** Nginx (reverse proxy)
- **Hosting:** Vercel config included
- **Environment:** .env for configuration

## 📁 Project Structure

```
Dhandha/
├── src/                          # React Frontend
│   ├── Components/
│   │   ├── Admin/               # Admin-specific components
│   │   ├── Section/             # Main page sections
│   │   │   ├── PartyOrders.jsx  # Party order management
│   │   │   ├── PartyOrderInvoice.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ...
│   │   ├── UI/                  # Reusable UI components
│   │   │   ├── shadcn-UI/       # shadcn components
│   │   │   └── UI-Components/   # Custom components
│   │   └── DataTables/          # Table components
│   ├── Context/                 # React Context providers
│   │   ├── UserContext.jsx      # User authentication state
│   │   ├── CustomerContext.jsx
│   │   ├── ThemeProviderContext.tsx
│   │   └── ...
│   ├── Handlers/                # API call handlers
│   │   ├── PartyOrderHandler.js
│   │   ├── SignInHandler.js
│   │   ├── CreatepaymentLinkHandler.js
│   │   └── ...
│   ├── Hooks/                   # Custom React hooks
│   ├── ColumnsSchema/           # Table column definitions
│   ├── lib/                     # Utility libraries
│   │   ├── errorHandler.ts      # Centralized error handling
│   │   └── utils.ts
│   ├── Data/                    # Configuration & metadata
│   │   └── meta.js              # API configs
│   └── assets/                  # Images, logos, icons
│
├── server/API/                   # Express Backend
│   ├── Handlers/                # Business logic controllers
│   │   ├── PartyOrder.js
│   │   ├── Customer.js
│   │   ├── Payment_Link.js
│   │   └── ...
│   ├── routes/                  # API route definitions
│   │   ├── partyOrder_route.js
│   │   ├── customer_route.js
│   │   └── ...
│   ├── Schema/                  # Mongoose models
│   │   ├── partyOrder.js
│   │   ├── customer.js
│   │   ├── user.js
│   │   └── ...
│   ├── Module/                  # Utility modules
│   │   ├── auth.js              # JWT middleware
│   │   ├── middleware.js
│   │   └── cloudinaryHandler.js
│   ├── server.js                # Main Express app
│   ├── index.js                 # Server entry point
│   └── connect.js               # MongoDB connection
│
├── documentation/               # Project Documentation
│   ├── OVERVIEW.md             # This file
│   ├── ARCHITECTURE.md         # System architecture
│   ├── FLOW.md                 # User & data flows
│   ├── API_REFERENCE.md        # API endpoints
│   ├── INTEGRATIONS.md         # Third-party services
│   └── ERROR_HANDLING.md       # Error strategies
│
├── public/                      # Static assets
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Container definition
├── Jenkinsfile                  # CI/CD pipeline
├── nginx.conf                   # Nginx configuration
├── vercel.json                  # Vercel deployment
├── package.json                 # Frontend dependencies
└── server/API/package.json      # Backend dependencies
```

## 🔑 Core Features

### 1. **Customer Management**
- Add, edit, delete customers
- Track customer details (name, phone, address)
- Customer entry/exit logging
- Invoice history per customer

### 2. **Party Orders**
- Bulk bottle orders for events (marriages, functions, parties)
- Two bottle types: Cold bottles & Normal bottles
- Separate pricing for each type
- Party verification (name, phone, address, location)
- Delivery date tracking
- Event type categorization
- Notes/special instructions

### 3. **Invoice System**
- Automated PDF generation (jsPDF)
- Professional invoice layout with shop branding
- Itemized billing (cold vs normal bottles)
- Preview before sending
- Upload to Cloudinary for storage
- Invoice status tracking

### 4. **Payment Integration**
- Razorpay payment link creation
- SMS & email notifications
- Payment reminders
- Payment link tracking
- Integration with invoices

### 5. **WhatsApp Automation**
- Automated invoice delivery via WhatsApp
- Template messages for invoices
- Text messages for payment links
- Bulk invoice sending
- Status tracking (sent/not sent)

### 6. **Dashboard & Analytics**
- Sales statistics
- Order summaries
- Customer insights
- Party order metrics

### 7. **User Management**
- JWT-based authentication
- User roles (admin/user)
- Shop/business profile
- Multi-shop support

## 🔄 User Workflows

### Customer Order Flow
1. User logs in → Dashboard
2. Navigate to Customers → View customer list
3. Add/Edit customer details
4. Create customer entry (delivery)
5. Generate & send invoice via WhatsApp
6. Payment link sent automatically
7. Track payment status

### Party Order Flow
1. Navigate to Party Orders
2. Click "Add Party Order"
3. Fill party details (name, phone, address, event type)
4. Specify bottle quantities & prices (cold/normal)
5. Set delivery date & notes
6. Click "Preview Invoice" → PDF generated
7. Click "Send Invoice" → WhatsApp delivery + payment link
8. Order status updated to "Invoice Sent"

### Invoice Sending Flow
1. Select order (customer or party)
2. System generates PDF invoice
3. PDF uploaded to Cloudinary
4. Payment link created via Razorpay
5. Invoice sent via WhatsApp (template message)
6. Payment link sent via WhatsApp (text message)
7. Database updated with invoice status

## 🔐 Security Features

### Authentication
- JWT tokens with expiration
- Secure password hashing
- Protected API routes
- User session management

### Authorization
- Role-based access control
- User-specific data filtering (uid-based queries)
- Admin-only routes
- Protected middleware on sensitive endpoints

### Data Validation
- Input validation on frontend & backend
- Phone number validation (10 digits)
- Required field checks
- PropTypes for component validation

## 🌐 API Architecture

### RESTful Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- JSON request/response
- Consistent error responses

### Authentication Flow
```
Client → POST /api/auth/login → JWT Token
Client → Stores token in localStorage
Client → All requests include: Authorization: Bearer {token}
Server → Middleware validates token
Server → Extracts user from token → req.user
Server → Processes request with user context
```

### Error Handling
- Centralized error handler (`handleFetchResponse`)
- HTTP status codes (401, 403, 404, 500)
- User-friendly error messages
- Toast notifications on frontend
- Console logging for debugging

## 🔌 Third-Party Integrations

### 1. WhatsApp Business API
- **Provider:** Meta (Facebook)
- **Purpose:** Send invoices and payment links
- **Configuration:** Phone Number ID, Access Token, API Version
- **Message Types:** Template messages, Text messages

### 2. Razorpay
- **Purpose:** Payment link generation
- **Features:** SMS notifications, reminders, custom amounts
- **Integration:** API key, account number

### 3. Cloudinary
- **Purpose:** PDF invoice storage
- **Configuration:** Cloud name, upload preset
- **Folder Structure:** Paaniwale-Party-Invoices

### 4. MongoDB Atlas
- **Database:** Cloud-hosted MongoDB
- **Models:** Users, Customers, Party Orders, Payments, Shops
- **ODM:** Mongoose for schema validation

## 📊 Data Models

### User Schema
```javascript
{
  username: String,
  password: String (hashed),
  email: String,
  phone_number: String,
  is_admin: Boolean
}
```

### Party Order Schema
```javascript
{
  uid: ObjectId (ref: User),
  party_name: String,
  party_phone: String,
  party_address: String,
  party_location: String,
  event_type: String (Marriage/Function/Party/Corporate/Other),
  delivery_date: Date,
  cold_bottle_quantity: Number,
  cold_bottle_price: Number,
  normal_bottle_quantity: Number,
  normal_bottle_price: Number,
  total_amount: Number,
  status: String (Pending/Confirmed/Delivered/Cancelled),
  invoice_sent: Boolean,
  payment_link: String,
  notes: String
}
```

### Customer Schema
```javascript
{
  uid: ObjectId (ref: User),
  name: String,
  phone: String,
  address: String,
  location: String,
  is_verified: Boolean
}
```

## 🎨 UI/UX Features

### Design System
- **Theme:** Light/Dark mode support
- **Components:** shadcn/ui (consistent, accessible)
- **Colors:** Customizable via Tailwind config
- **Typography:** Clean, readable fonts
- **Icons:** Lucide React icons

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly buttons & inputs
- Optimized for tablets & phones

### User Feedback
- Toast notifications (success/error)
- Loading skeletons
- Loading spinners
- Confirmation dialogs
- Error boundaries

### Data Tables
- Sorting, filtering, pagination
- Column visibility toggle
- Search functionality
- Row actions (edit, delete, preview, send)
- Responsive columns

## 🚀 Development & Deployment

### Development Setup
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server/API
npm install

# Run frontend (Vite dev server)
npm run dev

# Run backend (Express server)
cd server/API
node server.js
```

### Environment Variables
```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
VITE_CLOUD_NAME=your_cloudinary_cloud
VITE_CLOUD_UPLOAD_PRESET=your_preset
VITE_WHATSAPP_API_VERSION=v21.0
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_id
VITE_WHATSAPP_USER_ACCESS_TOKEN=your_token

# Backend (server/API/.env)
MONGODB_URI=mongodb://localhost:27017/dhandha
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### Docker Deployment
```bash
# Build & run containers
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

### Production Deployment
- **Frontend:** Vercel (vercel.json configured)
- **Backend:** Any Node.js hosting (Render, Railway, AWS)
- **Database:** MongoDB Atlas
- **CI/CD:** Jenkins pipeline (Jenkinsfile)

## 📈 Performance Optimizations

### Frontend
- React Query caching (3-10 min stale time)
- Code splitting with React.lazy
- Optimized images (Cloudinary CDN)
- Memoization of expensive calculations
- Debounced search inputs

### Backend
- MongoDB indexing on frequently queried fields
- JWT token validation caching
- Cloudinary CDN for PDF delivery
- Gzip compression (Nginx)
- Connection pooling (Mongoose)

## 🧪 Testing Strategy
- Manual testing workflows
- Console logging for debugging
- Error boundary components
- PropTypes validation
- API response validation

## 📝 Code Quality

### Frontend Standards
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety (partial)
- PropTypes for runtime validation
- Component composition patterns

### Backend Standards
- ES6 modules (import/export)
- Async/await for promises
- Error handling middleware
- Modular route structure
- Mongoose schema validation

## 🔮 Future Enhancements

### Planned Features
1. SMS notifications (Twilio integration)
2. Email invoicing (SendGrid/NodeMailer)
3. Inventory management
4. Route optimization for delivery
5. Customer loyalty program
6. Multi-language support
7. Payment tracking dashboard
8. Advanced analytics & reports
9. Mobile app (React Native)
10. Barcode/QR scanning for bottles

### Technical Improvements
1. Unit & integration testing (Jest, Vitest)
2. E2E testing (Playwright, Cypress)
3. GraphQL API option
4. Redis caching layer
5. Microservices architecture
6. Real-time notifications (WebSockets)
7. Progressive Web App (PWA)
8. Offline mode support

## 👥 Team & Contribution

### Roles
- **Owner:** HetSolanki
- **Repository:** github.com/HetSolanki/Dhandha
- **License:** (Specify if applicable)

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with proper documentation
4. Test thoroughly
5. Submit pull request

## 📞 Support & Documentation

### Getting Help
- Check `documentation/` folder for detailed guides
- Review error logs in browser console
- Check backend logs for API issues
- Refer to API_REFERENCE.md for endpoints

### Common Issues
1. **Login fails:** Check JWT_SECRET, MongoDB connection
2. **Invoice not sending:** Verify WhatsApp credentials
3. **Payment link fails:** Check Razorpay API keys
4. **PDF upload fails:** Verify Cloudinary config

## 🏁 Quick Start Guide

### For Developers
1. Clone repository
2. Install dependencies (frontend + backend)
3. Set up environment variables
4. Start MongoDB
5. Run backend server
6. Run frontend dev server
7. Access http://localhost:3000

### For Users
1. Navigate to deployed URL
2. Login with credentials
3. Explore dashboard
4. Create party order or customer
5. Generate & send invoice
6. Track payment status

---

## 📌 Key Takeaways

✅ **Full-stack MERN application**  
✅ **Real-world business automation**  
✅ **WhatsApp & payment integration**  
✅ **Modern React with shadcn/ui**  
✅ **Production-ready with Docker & CI/CD**  
✅ **Scalable architecture**  
✅ **Comprehensive error handling**  
✅ **Mobile-responsive design**  

---

**Last Updated:** October 9, 2025  
**Version:** 1.0  
**Status:** Active Development
