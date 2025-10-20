# Paani Wale API Documentation

**Base URL:** `http://localhost:4000` (Development) | `https://api.paaniwale.hetsolanki.tech` (Production)  
**Last Updated:** October 18, 2025  
**API Version:** 1.0.0

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Shop Management](#shop-management)
4. [Customer Management](#customer-management)
5. [Customer Entry (Invoices)](#customer-entry-invoices)
6. [Party Orders](#party-orders)
7. [Payment Details](#payment-details)
8. [Payment Links](#payment-links)
9. [Statistics](#statistics)
10. [Admin Statistics](#admin-statistics)
11. [Notifications](#notifications)
12. [Inquiries](#inquiries)
13. [Activity Logs](#activity-logs)
14. [Reports](#reports)
15. [Settings](#settings)
16. [WhatsApp](#whatsapp)
17. [OTP](#otp)

---

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### POST `/api/auth/signin`
**Description:** User login  
**Auth Required:** No  
**Request Body:**
```json
{
  "phone_number": "9876543210",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "user_id",
    "phone_number": "9876543210",
    "email": "user@example.com",
    "is_admin": false
  },
  "status": "success"
}
```

### POST `/api/auth/user` (Sign Up)
**Description:** Create new user account  
**Auth Required:** No  
**Request Body:**
```json
{
  "fname": "John",
  "lname": "Doe",
  "phone_number": "9876543210",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "data": {
    "id": "user_id",
    "fname": "John",
    "lname": "Doe",
    "phone_number": "9876543210",
    "email": "john@example.com",
    "is_admin": false
  },
  "status": "success"
}
```

---

## 👥 User Management

### GET `/api/auth/userall`
**Description:** Get all users (Admin only)  
**Auth Required:** Yes (Admin)  
**Response:**
```json
{
  "data": [
    {
      "_id": "user_id",
      "fname": "John",
      "lname": "Doe",
      "phone_number": "9876543210",
      "email": "john@example.com",
      "is_admin": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "status": "success"
}
```

### GET `/api/auth/user/:id`
**Description:** Get user by ID  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": {
    "_id": "user_id",
    "fname": "John",
    "lname": "Doe",
    "phone_number": "9876543210",
    "email": "john@example.com",
    "is_admin": false
  },
  "status": "success"
}
```

### PUT `/api/auth/user/:id`
**Description:** Update user details  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "fname": "John Updated",
  "lname": "Doe",
  "email": "newemail@example.com"
}
```

### DELETE `/api/auth/user/:id`
**Description:** Delete user  
**Auth Required:** Yes (Admin)  

### PUT `/api/auth/updatebank/:id`
**Description:** Update bank details  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "account_holder_name": "John Doe"
}
```

---

## 🏪 Shop Management

### GET `/api/shop/getshop/:id`
**Description:** Get shop details by user ID  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": {
    "_id": "shop_id",
    "shop_name": "Paani Wale Water Supply",
    "shop_address": "123 Main Street, City",
    "image_url": "https://cloudinary.com/qr-code.png",
    "uid": {
      "_id": "user_id",
      "phone_number": "9876543210",
      "email": "shop@example.com",
      "is_admin": false
    },
    "account_number": "1234567890",
    "ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India"
  },
  "status": "success"
}
```

### POST `/api/shop/createshop`
**Description:** Create new shop  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "shop_name": "Paani Wale Water Supply",
  "shop_address": "123 Main Street, City",
  "image_url": "https://cloudinary.com/qr-code.png",
  "uid": "user_id"
}
```

### PUT `/api/shop/updateshop/:id`
**Description:** Update shop details  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "shop_name": "Updated Shop Name",
  "shop_address": "New Address",
  "account_number": "9876543210"
}
```

### DELETE `/api/shop/deleteshop/:id`
**Description:** Delete shop  
**Auth Required:** Yes  

### POST `/api/shop/uploadqr`
**Description:** Upload QR code image  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "image": "base64_encoded_image_data",
  "shopId": "shop_id"
}
```

---

## 👤 Customer Management

### GET `/api/customers/customerall`
**Description:** Get all customers with pagination  
**Auth Required:** Yes  
**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Example:** `/api/customers/customerall?page=1&limit=20`

**Response:**
```json
{
  "data": [
    {
      "_id": "customer_id",
      "cname": "Rajesh Kumar",
      "cphone_number": "9876543210",
      "caddress": "House 123, Sector 45, City",
      "bottle_price": 25,
      "delivery_sequence_number": 1,
      "uid": "user_id",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "status": "success"
}
```

### GET `/api/customers/customer/:id`
**Description:** Get customer by ID  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": {
    "_id": "customer_id",
    "cname": "Rajesh Kumar",
    "cphone_number": "9876543210",
    "caddress": "House 123, Sector 45, City",
    "bottle_price": 25,
    "delivery_sequence_number": 1,
    "uid": "user_id"
  },
  "status": "success"
}
```

### POST `/api/customers/customer`
**Description:** Create new customer  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "cname": "Rajesh Kumar",
  "cphone_number": "9876543210",
  "caddress": "House 123, Sector 45, City",
  "bottle_price": 25,
  "delivery_sequence_number": 1
}
```

### PUT `/api/customers/customer/:id`
**Description:** Update customer details  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "cname": "Rajesh Kumar Updated",
  "bottle_price": 30,
  "caddress": "New Address"
}
```

### DELETE `/api/customers/customer/:id`
**Description:** Delete customer  
**Auth Required:** Yes  

---

## 📄 Customer Entry (Invoices)

### GET `/api/customerentry/customerentryall`
**Description:** Get all customer entries (invoices)  
**Auth Required:** Yes  
**Query Parameters:**
- `customerId` (optional) - Filter by customer
- `startDate` (optional) - Format: YYYY-MM-DD
- `endDate` (optional) - Format: YYYY-MM-DD
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Example:** `/api/customerentry/customerentryall?customerId=abc123&startDate=2025-01-01&endDate=2025-01-31`

**Response:**
```json
{
  "data": [
    {
      "_id": "entry_id",
      "cid": "customer_id",
      "date": "2025-01-15",
      "bottles_delivered": 10,
      "amount": 250,
      "payment_status": "pending",
      "uid": "user_id",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "status": "success"
}
```

### POST `/api/customerentry/customerentry`
**Description:** Create customer entry (invoice)  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "cid": "customer_id",
  "date": "2025-01-15",
  "bottles_delivered": 10,
  "amount": 250,
  "payment_status": "pending"
}
```

### PUT `/api/customerentry/customerentry/:id`
**Description:** Update customer entry  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "bottles_delivered": 12,
  "amount": 300,
  "payment_status": "paid"
}
```

### DELETE `/api/customerentry/customerentry/:id`
**Description:** Delete customer entry  
**Auth Required:** Yes  

### GET `/api/customerentry/customer/:customerId`
**Description:** Get all entries for specific customer  
**Auth Required:** Yes  

---

## 📦 Party Orders

### GET `/api/partyorder`
**Description:** Get all party orders  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": [
    {
      "_id": "order_id",
      "party_name": "Wedding Function",
      "party_phone": "9876543210",
      "party_address": "Marriage Hall, City",
      "party_location": "Near City Center",
      "event_type": "Wedding",
      "delivery_date": "2025-02-15T00:00:00.000Z",
      "cold_bottle_quantity": 100,
      "cold_bottle_price": 30,
      "normal_bottle_quantity": 50,
      "normal_bottle_price": 25,
      "total_amount": 4250,
      "notes": "Deliver by 10 AM",
      "invoice_sent": true,
      "payment_link": "https://razorpay.com/payment/xyz",
      "uid": "user_id",
      "createdAt": "2025-01-10T00:00:00.000Z"
    }
  ],
  "status": "success"
}
```

### GET `/api/partyorder/:id`
**Description:** Get party order by ID  
**Auth Required:** Yes  

### POST `/api/partyorder`
**Description:** Create party order  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "party_name": "Wedding Function",
  "party_phone": "9876543210",
  "party_address": "Marriage Hall, City",
  "party_location": "Near City Center",
  "event_type": "Wedding",
  "delivery_date": "2025-02-15",
  "cold_bottle_quantity": 100,
  "cold_bottle_price": 30,
  "normal_bottle_quantity": 50,
  "normal_bottle_price": 25,
  "total_amount": 4250,
  "notes": "Deliver by 10 AM"
}
```

### PUT `/api/partyorder/:id`
**Description:** Update party order  
**Auth Required:** Yes  

### DELETE `/api/partyorder/:id`
**Description:** Delete party order  
**Auth Required:** Yes  

---

## 💰 Payment Details

### GET `/api/paymentdetails/paymentdetailsall`
**Description:** Get all payment details  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": [
    {
      "_id": "payment_id",
      "cid": "customer_id",
      "amount": 500,
      "payment_method": "online",
      "payment_status": "approved",
      "razorpay_payment_id": "pay_xyz123",
      "payment_date": "2025-01-15T10:30:00.000Z",
      "uid": "user_id"
    }
  ],
  "status": "success"
}
```

### POST `/api/paymentdetails/paymentdetails`
**Description:** Create payment detail entry  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "cid": "customer_id",
  "amount": 500,
  "payment_method": "online",
  "payment_status": "approved",
  "razorpay_payment_id": "pay_xyz123",
  "payment_date": "2025-01-15"
}
```

### PUT `/api/paymentdetails/paymentdetails/:id`
**Description:** Update payment detail  
**Auth Required:** Yes  

### DELETE `/api/paymentdetails/paymentdetails/:id`
**Description:** Delete payment detail  
**Auth Required:** Yes  

---

## 🔗 Payment Links

### POST `/api/paymentlink/create`
**Description:** Create Razorpay payment link  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "amount": 5000,
  "description": "Water bottles payment for January 2025",
  "customer_name": "Rajesh Kumar",
  "customer_phone": "9876543210",
  "customer_email": "rajesh@example.com",
  "smsnotify": true,
  "emailnotify": true,
  "reminder_enable": true,
  "account_number": "1234567890"
}
```
**Response:**
```json
{
  "data": {
    "short_url": "https://rzp.io/i/xyz123",
    "id": "plink_xyz123",
    "amount": 5000,
    "amount_paid": 0,
    "status": "created",
    "customer": {
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "contact": "+919876543210"
    }
  },
  "status": "success"
}
```

### POST `/api/paymentlink/createall`
**Description:** Create payment links for multiple customers  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "customers": [
    {
      "customer_id": "customer_id_1",
      "amount": 500
    },
    {
      "customer_id": "customer_id_2",
      "amount": 750
    }
  ],
  "description": "Monthly water delivery payment"
}
```

---

## 📊 Statistics

### GET `/api/stats`
**Description:** Get user dashboard statistics  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": {
    "totalRevenue": 50000,
    "totalCustomerData": 150,
    "totalDueAmount": 12000,
    "pendingPaymentCustomersCount": 25,
    "topCustomers": [
      {
        "cid": "customer_id",
        "totalRevenue": 5000,
        "customerDetails": {
          "_id": "customer_id",
          "cname": "Rajesh Kumar",
          "cphone_number": "9876543210",
          "caddress": "House 123"
        }
      }
    ],
    "pendingPaymentCustomers": [
      {
        "cid": "customer_id",
        "totalDue": 1200,
        "customerDetails": {
          "_id": "customer_id",
          "cname": "Amit Sharma",
          "cphone_number": "9123456789"
        }
      }
    ]
  },
  "status": "success"
}
```

### GET `/api/stats/clients`
**Description:** Get client statistics  
**Auth Required:** Yes  

### GET `/api/stats/invoices`
**Description:** Get invoice statistics  
**Auth Required:** Yes  

### GET `/api/stats/payments`
**Description:** Get payment statistics  
**Auth Required:** Yes  

### GET `/api/stats/general`
**Description:** Get general statistics  
**Auth Required:** Yes  

---

## 🔒 Admin Statistics

### GET `/api/admin/stats/all`
**Description:** Get all admin statistics (Admin only)  
**Auth Required:** Yes (Admin)  
**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 500000,
    "totalCustomers": 1500,
    "totalOrders": 5000,
    "totalUsers": 50,
    "pendingPayments": 120000,
    "revenueByMonth": [
      {
        "month": "January",
        "revenue": 45000
      }
    ],
    "topPerformingUsers": [
      {
        "userId": "user_id",
        "userName": "John Doe",
        "revenue": 100000
      }
    ]
  }
}
```

### GET `/api/admin/stats/users`
**Description:** Get user statistics (Admin only)  
**Auth Required:** Yes (Admin)  

### GET `/api/admin/stats/revenue`
**Description:** Get revenue statistics (Admin only)  
**Auth Required:** Yes (Admin)  

### GET `/api/admin/stats/customers`
**Description:** Get customer statistics (Admin only)  
**Auth Required:** Yes (Admin)  

---

## 🔔 Notifications

### GET `/api/notifications`
**Description:** Get all notifications for logged-in user  
**Auth Required:** Yes  
**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Example:** `/api/notifications?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "userId": "user_id",
        "title": "New Order Received",
        "message": "You have a new party order for 100 bottles",
        "type": "new_order",
        "isRead": false,
        "priority": "high",
        "link": "/orders/order_id",
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 45,
      "limit": 20
    }
  }
}
```

### PATCH `/api/notifications/:id/read`
**Description:** Mark notification as read  
**Auth Required:** Yes  

### PATCH `/api/notifications/mark-all-read`
**Description:** Mark all notifications as read  
**Auth Required:** Yes  

### DELETE `/api/notifications/:id`
**Description:** Delete notification  
**Auth Required:** Yes  

---

## 📝 Inquiries

### GET `/api/inquiry/inquiryall`
**Description:** Get all inquiries  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": [
    {
      "_id": "inquiry_id",
      "name": "Potential Customer",
      "phone": "9876543210",
      "email": "customer@example.com",
      "message": "I need 200 bottles for my event",
      "status": "pending",
      "createdAt": "2025-01-10T00:00:00.000Z"
    }
  ],
  "status": "success"
}
```

### POST `/api/inquiry/inquiry`
**Description:** Create inquiry (public endpoint)  
**Auth Required:** No  
**Request Body:**
```json
{
  "name": "Potential Customer",
  "phone": "9876543210",
  "email": "customer@example.com",
  "message": "I need 200 bottles for my event"
}
```

### PUT `/api/inquiry/inquiry/:id`
**Description:** Update inquiry status  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "status": "contacted"
}
```

### DELETE `/api/inquiry/inquiry/:id`
**Description:** Delete inquiry  
**Auth Required:** Yes  

---

## 📜 Activity Logs

### GET `/api/activity-log`
**Description:** Get all activity logs for user  
**Auth Required:** Yes  
**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50)
- `startDate` (optional) - Format: YYYY-MM-DD
- `endDate` (optional) - Format: YYYY-MM-DD

**Response:**
```json
{
  "data": [
    {
      "_id": "log_id",
      "userId": "user_id",
      "action": "create_customer",
      "description": "Created new customer: Rajesh Kumar",
      "metadata": {
        "customerId": "customer_id",
        "customerName": "Rajesh Kumar"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-01-15T10:30:00.000Z"
    }
  ],
  "status": "success"
}
```

### POST `/api/activity-log`
**Description:** Create activity log entry  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "action": "update_customer",
  "description": "Updated customer details",
  "metadata": {
    "customerId": "customer_id"
  }
}
```

---

## 📊 Reports

### POST `/api/reports/customers`
**Description:** Generate customer report (Admin only)  
**Auth Required:** Yes (Admin)  
**Request Body:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "format": "pdf"
}
```

### POST `/api/reports/revenue`
**Description:** Generate revenue report (Admin only)  
**Auth Required:** Yes (Admin)  
**Request Body:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "groupBy": "month"
}
```

### POST `/api/reports/payments`
**Description:** Generate payment report (Admin only)  
**Auth Required:** Yes (Admin)  
**Request Body:**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "status": "all"
}
```

---

## ⚙️ Settings

### GET `/api/settings`
**Description:** Get user settings  
**Auth Required:** Yes  
**Response:**
```json
{
  "data": {
    "_id": "settings_id",
    "uid": "user_id",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "defaultBottlePrice": 25,
    "autoGenerateInvoice": true,
    "language": "en",
    "currency": "INR"
  },
  "status": "success"
}
```

### PUT `/api/settings`
**Description:** Update user settings  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "notifications": {
    "email": true,
    "push": true
  },
  "defaultBottlePrice": 30
}
```

### POST `/api/settings/test-smtp`
**Description:** Test SMTP connection  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "host": "smtp.gmail.com",
  "port": 587,
  "user": "your-email@gmail.com",
  "pass": "your-app-password"
}
```

### POST `/api/settings/test-whatsapp`
**Description:** Test WhatsApp connection  
**Auth Required:** Yes  

### POST `/api/settings/test-razorpay`
**Description:** Test Razorpay connection  
**Auth Required:** Yes  

---

## 💬 WhatsApp

### POST `/api/whatsapp/send`
**Description:** Send WhatsApp message (secure backend proxy)  
**Auth Required:** Yes  
**Request Body:**
```json
{
  "to": "9876543210",
  "type": "template",
  "template": {
    "name": "purchase_receipt_1",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "header",
        "parameters": [
          {
            "type": "document",
            "document": {
              "link": "https://res.cloudinary.com/invoice.pdf",
              "filename": "Invoice.pdf"
            }
          }
        ]
      },
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "5000"
          },
          {
            "type": "text",
            "text": "Paaniwale"
          },
          {
            "type": "text",
            "text": "Invoice"
          }
        ]
      }
    ]
  }
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "messaging_product": "whatsapp",
    "messages": [
      {
        "id": "wamid.xyz123"
      }
    ]
  }
}
```

---

## 📱 OTP

### POST `/api/otp/send`
**Description:** Send OTP for phone verification  
**Auth Required:** No  
**Request Body:**
```json
{
  "phone_number": "9876543210"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

### POST `/api/otp/verify`
**Description:** Verify OTP  
**Auth Required:** No  
**Request Body:**
```json
{
  "phone_number": "9876543210",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "OTP verified successfully"
}
```

---

## 🔍 Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 408 | Request Timeout (30 seconds) |
| 500 | Internal Server Error |

---

## 📝 Common Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "phone_number",
      "message": "Phone number is required"
    }
  ]
}
```

---

## 🌐 CORS Configuration

**Allowed Origins:**
- `http://localhost:3000`
- `http://localhost:5173`
- `https://paaniwale.hetsolanki.tech`
- `https://api.paaniwale.hetsolanki.tech`

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS  
**Credentials:** Supported

---

## 🔧 Rate Limiting

- **Request Timeout:** 30 seconds
- **Body Size Limit:** 10MB
- **No rate limiting implemented** (consider adding for production)

---

## 📦 Data Models

### User Schema
```javascript
{
  fname: String,
  lname: String,
  phone_number: String (unique, 10 digits),
  email: String (optional),
  password: String (hashed),
  is_admin: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Customer Schema
```javascript
{
  cname: String,
  cphone_number: String (10 digits),
  caddress: String,
  bottle_price: Number,
  delivery_sequence_number: Number,
  uid: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Party Order Schema
```javascript
{
  party_name: String,
  party_phone: String,
  party_address: String,
  party_location: String,
  event_type: String,
  delivery_date: Date,
  cold_bottle_quantity: Number,
  cold_bottle_price: Number,
  normal_bottle_quantity: Number,
  normal_bottle_price: Number,
  total_amount: Number,
  notes: String,
  invoice_sent: Boolean,
  payment_link: String,
  uid: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Quick Start Example

```javascript
// 1. Sign in
const loginResponse = await fetch('http://localhost:4000/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone_number: '9876543210',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// 2. Get customers
const customersResponse = await fetch('http://localhost:4000/api/customers/customerall', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const customers = await customersResponse.json();

// 3. Create party order
const orderResponse = await fetch('http://localhost:4000/api/partyorder', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    party_name: 'Wedding Function',
    party_phone: '9123456789',
    party_address: 'Marriage Hall',
    event_type: 'Wedding',
    delivery_date: '2025-02-15',
    cold_bottle_quantity: 100,
    cold_bottle_price: 30,
    normal_bottle_quantity: 50,
    normal_bottle_price: 25,
    total_amount: 4250
  })
});
```

---

## 📞 Support

For API issues or questions, contact:
- Email: paaniwale7@gmail.com
- GitHub: https://github.com/HetSolanki/Dhandha

---

**Last Updated:** October 18, 2025  
**API Version:** 1.0.0
