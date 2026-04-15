# Entity Relationship (ER) Model - Dhandha Platform

## Overview
Dhandha is a **water bottle delivery business management platform**. This document outlines the complete data model with all entities, their attributes, relationships, and constraints.

**Database System**: MongoDB  
**ORM**: Mongoose  
**Caching**: Redis  

---

## Core Entities

### 1. USER
Central entity representing users (delivery managers/admins) in the system.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `fname` | String | Required | First name |
| `lname` | String | Required | Last name |
| `phone_number` | Number | Required, Unique | Contact number |
| `email` | String | Unique, Sparse, Lowercase | Optional email |
| `password` | String | Required | Hashed password |
| `branch_ifsc_code` | String | Optional | Bank branch IFSC |
| `account_number` | String | Optional | Bank account |
| `benificiary_name` | String | Optional | Account beneficiary |
| `is_admin` | Boolean | Default: false | Admin flag |
| `status` | String | Enum: active, inactive, suspended | Account status |
| `last_login` | Date | Optional | Last login timestamp |
| `avatar` | String | Optional | Avatar URL |
| `timestamp` | Date | Default: now | Creation time |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `phone_number` (Unique)
- `email` (Unique, Sparse)
- `status`
- `is_admin`
- `last_login` (Descending)
- `createdAt` (Descending)

---

### 2. CUSTOMER
Represents customers belonging to a user (delivery recipients).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `uid` | ObjectId | Required, FK→User | Owner user |
| `cname` | String | Required | Customer name |
| `cphone_number` | Number | Required | Customer phone |
| `email` | String | Optional, Lowercase | Customer email |
| `caddress` | String | Required | Delivery address |
| `bottle_price` | Number | Required | Price per bottle (₹) |
| `delivery_sequence_number` | Number | Required | Route order |
| `status` | String | Enum: active, inactive | Customer status |
| `notes` | String | Optional | Notes/remarks |
| `phone_verification_status` | Boolean | Default: false | WhatsApp OTP verified |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `(uid, cphone_number)` (Unique compound)
- `(uid, status)`
- `(uid, delivery_sequence_number)`
- `cphone_number`
- `email`
- `createdAt` (Descending)
- `(uid, createdAt)` (Compound, Descending)

**Relationships**:
- **Owns many**: CustomerEntry
- **Owns many**: PaymentDetail
- **Belongs to**: User (uid)

---

### 3. CUSTOMER_ENTRY
Daily delivery records for customers (one entry per delivery).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `cid` | ObjectId | Required, FK→Customer | Customer reference |
| `uid` | ObjectId | Required, FK→User | Recording user |
| `bottle_count` | Number | Required | Bottles delivered |
| `delivery_date` | Date | Required | Delivery date |
| `delivery_status` | String | Required | Pending, Completed, Cancelled |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `(cid, delivery_date)` (Descending)
- `(uid, delivery_date)` (Descending)
- `(uid, delivery_status, delivery_date)` (Compound, Descending)
- `delivery_date` (Descending)
- `createdAt` (Descending)
- `(uid, createdAt)` (Compound, Descending)
- `(cid, createdAt)` (Compound, Descending)

**Relationships**:
- **Belongs to**: Customer (cid)
- **Belongs to**: User (uid)

---

### 4. PAYMENT_DETAIL
Payment records for customer deliveries.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `cid` | ObjectId | Required, FK→Customer | Customer paying |
| `uid` | ObjectId | Required, FK→User | Recording user |
| `amount` | Number | Required | Payment amount (₹) |
| `payment_date` | String | Required | Payment date (YYYY-MM-DD) |
| `payment_status` | String | Enum: pending, approved, rejected, completed, Received | Status |
| `payment_method` | String | Enum: cash, upi, card, netbanking, bank_transfer, other | Payment type |
| `transaction_id` | String | Optional | Payment gateway ID |
| `payment_proof` | String | Optional | Proof image/doc URL |
| `rejection_reason` | String | Optional | Why rejected |
| `approved_by` | ObjectId | Optional, FK→User | Approver |
| `notes` | String | Optional | Payment notes |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `(cid, payment_date)` (Descending)
- `(uid, payment_date)` (Descending)
- `(uid, payment_status)`
- `(payment_status, createdAt)` (Compound, Descending)
- `transaction_id`
- `approved_by`
- `createdAt` (Descending)
- `(cid, createdAt)` (Compound, Descending)

**Relationships**:
- **Belongs to**: Customer (cid)
- **Belongs to**: User (uid) - Recorder
- **Belongs to**: User (approved_by) - Approver [Optional]

---

### 5. PARTY_ORDER
Special bulk/party/event orders.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `uid` | ObjectId | Required, FK→User | Order creator |
| `party_name` | String | Required | Event/party name |
| `party_phone` | String | Required | Contact phone |
| `party_address` | String | Required | Delivery address |
| `party_location` | String | Default: "" | Location/area |
| `is_verified` | Boolean | Default: false | Verification flag |
| `cold_bottle_quantity` | Number | Default: 0 | Cold bottles count |
| `cold_bottle_price` | Number | Default: 0 | Price per cold bottle |
| `normal_bottle_quantity` | Number | Default: 0 | Normal bottles count |
| `normal_bottle_price` | Number | Default: 0 | Price per normal bottle |
| `total_amount` | Number | Required | Total order value (₹) |
| `order_date` | Date | Default: now | Order creation |
| `delivery_date` | Date | Required | Expected delivery |
| `event_type` | String | Enum: Marriage, Function, Party, Corporate Event, Other | Event category |
| `status` | String | Enum: Pending, Confirmed, Delivered, Cancelled | Order status |
| `notes` | String | Default: "" | Internal notes |
| `invoice_sent` | Boolean | Default: false | Invoice sent flag |
| `payment_link` | String | Default: "" | Razorpay payment link |
| `created_at` | Date | Default: now | Created timestamp |
| `updated_at` | Date | Default: now | Updated timestamp |

**Indexes**:
- `(uid, order_date)` (Descending)
- `(uid, status)`
- `(uid, delivery_date)`
- `(status, delivery_date)`
- `party_phone`
- `event_type`
- `created_at` (Descending)

**Relationships**:
- **Belongs to**: User (uid)

---

### 6. SETTINGS
Configuration and business settings per user.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `uid` | ObjectId | Required, FK→User, Unique | User reference |
| `business_name` | String | Optional | Business name |
| `business_email` | String | Optional | Business email |
| `business_phone` | String | Optional | Business phone |
| `business_address` | String | Optional | Business address |
| `currency` | String | Default: "INR" | Currency code |
| `timezone` | String | Default: "Asia/Kolkata" | Timezone |
| **Email Settings** | | | SMTP configuration |
| `smtp_host` | String | Optional | SMTP server |
| `smtp_port` | Number | Optional | SMTP port |
| `smtp_username` | String | Optional | SMTP user |
| `smtp_password` | String | Optional | SMTP password |
| `smtp_from_email` | String | Optional | From email |
| `smtp_from_name` | String | Optional | From name |
| **WhatsApp Settings** | | | WhatsApp integration |
| `whatsapp_api_key` | String | Optional | WhatsApp API key |
| `whatsapp_phone_number` | String | Optional | WhatsApp phone |
| `whatsapp_notifications_enabled` | Boolean | Default: false | Enable WhatsApp |
| **Razorpay Settings** | | | Payment gateway |
| `razorpay_key_id` | String | Optional | Razorpay key |
| `razorpay_key_secret` | String | Optional | Razorpay secret |
| `razorpay_enabled` | Boolean | Default: false | Enable Razorpay |
| **Notification Settings** | | | |
| `email_notifications.new_order` | Boolean | Default: true | Order alerts |
| `email_notifications.payment_received` | Boolean | Default: true | Payment alerts |
| `email_notifications.low_stock` | Boolean | Default: true | Stock alerts |
| `email_notifications.new_inquiry` | Boolean | Default: true | Inquiry alerts |
| `sms_notifications.new_order` | Boolean | Default: false | SMS for orders |
| `sms_notifications.payment_received` | Boolean | Default: false | SMS for payments |
| **Invoice Settings** | | | |
| `invoice_prefix` | String | Default: "INV" | Invoice prefix |
| `invoice_footer` | String | Optional | Invoice footer text |
| `tax_enabled` | Boolean | Default: false | Tax calculation |
| `tax_percentage` | Number | Default: 0 | Tax rate (%) |
| **General Settings** | | | |
| `default_bottle_price` | Number | Default: 20 | Default bottle price |
| `low_stock_threshold` | Number | Default: 10 | Low stock warning |
| **Auto Invoice Settings** | | | Scheduled invoicing |
| `auto_invoice_enabled` | Boolean | Default: false | Enable auto invoice |
| `auto_invoice_day` | Number | Default: 1, Min: 1, Max: 31 | Day of month |
| `auto_invoice_time` | String | Default: "09:00" | Time (HH:MM, 24-hr) |
| `last_auto_invoice_run` | Date | Optional | Last execution time |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `uid` (Unique)
- `(auto_invoice_enabled, auto_invoice_day)`

**Relationships**:
- **Belongs to**: User (uid) [1:1]

---

### 7. SHOP
Shop/business profile information.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `shop_name` | String | Required | Shop/business name |
| `shop_address` | String | Optional | Shop address |
| `gst_number` | String | Optional, Sparse | GST registration |
| `uid` | ObjectId | Optional, FK→User | Shop owner |
| `image_url` | String | Optional | Logo/image URL |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `uid`
- `gst_number` (Sparse)

**Relationships**:
- **Belongs to**: User (uid)

---

### 8. INQUIRY
Contact form inquiries and support requests.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `name` | String | Required, Trimmed | Inquirer name |
| `email` | String | Required, Lowercase, Trimmed | Contact email |
| `phone` | String | Required, Trimmed | Contact phone |
| `company` | String | Optional, Trimmed | Company name |
| `subject` | String | Required, Trimmed | Inquiry subject |
| `message` | String | Required, Trimmed | Message body |
| `inquiryType` | String | Enum: general, sales, support, demo, pricing, partnership | Type |
| `status` | String | Enum: new, contacted, resolved, closed | Status |
| `priority` | String | Enum: low, medium, high, urgent | Priority level |
| `source` | String | Enum: website, referral, social_media, advertisement, other | Source |
| `notes` | String | Optional, Trimmed | Admin notes |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `email`
- `phone`
- `(status, createdAt)` (Descending)
- `inquiryType`
- `(priority, status)`
- `createdAt` (Descending)

**Relationships**:
- None (Independent entity, potential future: FK→User for reply tracking)

---

### 9. ACTIVITY_LOG
Audit trail of system activities and user actions.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `_id` | ObjectId | Primary Key | MongoDB ID |
| `userId` | ObjectId | Required, FK→User | User who triggered |
| `username` | String | Required | Username snapshot |
| `type` | String | Enum: user_login, user_logout, user_created, user_updated, user_deleted, customer_created, customer_updated, customer_deleted, order_created, order_updated, order_deleted, payment_created, payment_approved, payment_rejected, payment_updated, inquiry_created, inquiry_updated, settings_changed, export_data, system_error, login_failed, password_changed, other | Activity type |
| `description` | String | Required | Activity description |
| `ipAddress` | String | Optional | IP address |
| `severity` | String | Enum: low, medium, high, critical | Severity level |
| `metadata` | Mixed | Optional | Additional data (JSON) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Update timestamp |

**Indexes**:
- `(userId, createdAt)` (Descending)
- `(type, createdAt)` (Compound, Descending)
- `severity`

**Relationships**:
- **Belongs to**: User (userId)

---

## Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          USER (Central)                         │
│                                                                 │
└──────────┬──────────┬──────────┬──────────┬──────────┬──────────┘
           │          │          │          │          │
    1:1    │    1:N   │    1:N   │    1:N   │    1:N   │    1:N
           │          │          │          │          │
           v          v          v          v          v          v
      ┌────────┐  ┌────────────┐  ┌──────────────┐  ┌────────┐  ┌──────────┐
      │SETTINGS│  │ CUSTOMER   │  │ PARTY_ORDER  │  │ SHOP   │  │ACTIVITY_ │
      │(1:1)   │  │  (1:N)     │  │   (1:N)      │  │ (1:N)  │  │  LOG(1:N)│
      └────────┘  └──────┬─────┘  └──────────────┘  └────────┘  └──────────┘
                         │
                    1:N  │
                         v
                  ┌──────────────────┐
                  │  CUSTOMER_ENTRY  │
                  │  (Deliveries)    │
                  └────────┬─────────┘
                           │
                      1:N  │
                           v
                  ┌──────────────────┐
                  │  PAYMENT_DETAIL  │
                  │  (Payments)      │
                  └──────────────────┘
                           │
                  ┌────────────────┐
                  │ approved_by→User
                  │ (Optional FK)
                  └────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    INQUIRY (Independent)                     │
│        (No direct FK, stores contact info directly)          │
└──────────────────────────────────────────────────────────────┘
```

---

## Cardinality Summary

| Entity 1 | Entity 2 | Cardinality | Key Field | Notes |
|----------|----------|-------------|-----------|-------|
| User | Customer | 1:N | Customer.uid | One user has many customers |
| User | CustomerEntry | 1:N | CustomerEntry.uid | One user records many entries |
| User | PaymentDetail | 1:N | PaymentDetail.uid | One user records many payments |
| User | PaymentDetail | 1:N | PaymentDetail.approved_by | One user approves many payments |
| Customer | CustomerEntry | 1:N | CustomerEntry.cid | One customer has many deliveries |
| Customer | PaymentDetail | 1:N | PaymentDetail.cid | One customer makes many payments |
| User | PartyOrder | 1:N | PartyOrder.uid | One user creates many orders |
| User | Settings | 1:1 | Settings.uid | One user has one settings |
| User | Shop | 1:N | Shop.uid | One user has one/many shops |
| User | ActivityLog | 1:N | ActivityLog.userId | One user generates many logs |

---

## Data Flow & Key Processes

### 1. Daily Delivery Workflow
```
User → Creates/Updates → Customer
         │
         └─→ Records → CustomerEntry (daily)
              │
              └─→ Records → PaymentDetail (when paid)
```

### 2. Party Order Workflow
```
User → Creates → PartyOrder
         │
         ├─→ Generates → PaymentLink (Razorpay)
         └─→ Generates → Invoice (PDF via WhatsApp)
```

### 3. Auto Invoice Process
```
Settings.auto_invoice_enabled = true
         │
         ├─→ Scheduled Task (hourly check)
         │
         ├─→ Customer.phone_verification_status = true
         │
         ├─→ Collects → CustomerEntry (previous month)
         │
         ├─→ Generates → Invoice PDF
         │
         └─→ Sends → WhatsApp Message
```

### 4. Payment Approval
```
PaymentDetail (created by User)
         │
         ├─→ payment_status: "pending"
         │
         └─→ Approved by → User (admin)
              │
              └─→ payment_status: "approved"
```

---

## Constraints & Business Rules

### User
- Phone number must be unique
- Email is optional but unique when provided
- Status determines login capability
- Only admins can approve payments

### Customer
- Belongs to exactly one User
- Phone number unique per User (compound index)
- Must have active status to receive deliveries
- Phone verification required for auto-invoice

### CustomerEntry
- Must reference valid Customer and User
- delivery_status tracks completion state
- Used for monthly invoice calculation

### PaymentDetail
- Amount must match sum of deliveries for validation
- approval workflow: pending → approved/rejected
- approved_by only set when status = "approved"
- Multiple payment methods supported

### PartyOrder
- Total amount calculated from quantities & prices
- invoice_sent and payment_link linked
- Status transitions: Pending → Confirmed → Delivered

### Settings
- One Settings per User (uid is unique)
- Auto-invoice requires valid WhatsApp config
- SMTP credentials stored (consider encryption)

### Inquiry
- No direct user association (public form)
- Status progression: new → contacted → resolved/closed

---

## Caching Strategy (Redis)

**Cache Keys Pattern**:
```
cache:invoice:{customerId}:{month}        → Invoice data
cache:customer:{userId}:{customerId}      → Customer details
cache:entries:{userId}:{date}             → Daily entries
cache:payments:{userId}:{status}          → Payment records
cache:stats:{userId}                      → User statistics
cache:shop:{userId}                       → Shop config
```

**TTL**: 3600 seconds (1 hour) for most queries

---

## Future Entity Recommendations

### INVOICE (Separate Entity)
Track generated invoices independently:
- `_id`, `customerId`, `userId`, `month`, `year`, `total_amount`, `status`, `sent_date`, `pdf_url`

### PAYMENT_LINK
Track Razorpay payment links:
- `_id`, `partyOrderId`, `link_id`, `amount`, `status`, `created_at`, `expires_at`

### OTP_VERIFICATION
Separate entity for OTP management:
- `_id`, `phone`, `otp`, `expiresAt`, `verified`, `attempts`

### INQUIRY_REPLY
Track replies to inquiries:
- `_id`, `inquiryId`, `repliedBy→User`, `message`, `reply_date`

---

## Performance Notes

- **Indexing**: All foreign keys and filtering criteria are indexed
- **Compound Indexes**: Optimized for common query patterns (user + date, status + date)
- **Denormalization**: Customer details cached in CustomerEntry for reporting
- **Pagination**: Built-in for all list endpoints (page, limit params)
- **Aggregation**: Mongoose aggregation for stats (monthly revenue, inquiry counts)

---

## Document Version
- **Created**: 2026-04-15
- **Platform**: Dhandha (Water Bottle Delivery Management)
- **Database**: MongoDB with Mongoose ODM
