# Books Services Module - Complete Documentation

## Overview

The Books Services module is a comprehensive accounting and financial management system integrated into ArtVpp. It automates income and expense tracking, invoice management, payment processing, and financial reporting.

## Features

### 1. **Core Accounting Features**
- ✅ Automated sales invoice generation
- ✅ Purchase invoice management
- ✅ Income and expense tracking
- ✅ Double-entry ledger system
- ✅ Customer and vendor ledger management
- ✅ Payment status tracking (Unpaid/Partial/Paid)
- ✅ Automatic financial summaries (Daily/Monthly)

### 2. **Invoice Management**
- Auto-generated unique invoice numbers (format: INV/YYYYMM + sequence)
- Support for both sales and purchase invoices
- Line-item details with individual tax rates
- Batch operations on invoice items
- Invoice status tracking
- Invoice modification (before payment) and deletion (unpaid only)

### 3. **Transaction Management**
- Income transaction recording
- Expense transaction recording
- Transaction categorization with subcategories
- Multiple payment method support (cash, check, bank transfer, credit card, UPI)
- Transaction status (pending/completed/cancelled)
- Complete transaction audit trail

### 4. **Payment Processing**
- Payment recording against invoices
- Partial and full payment support
- Automatic payment status updates
- Auto-generated payment numbers
- Payment method tracking
- Payment reversal (deletion of pending payments)

### 5. **Financial Reports & Dashboards**
- Real-time financial dashboard with income/expense visualization
- Profit & Loss (P&L) statements
- Customer ledger with outstanding balance tracking
- Vendor ledger with payable tracking
- Sales reports with payment status breakdown
- Expense reports by category and payment method
- Customizable date range filtering

### 6. **Role-Based Access Control**
Three predefined roles:
- **Admin**: Full access to all operations
- **Accountant**: Create, read, update (no delete/config)
- **Viewer**: Read-only access

### 7. **Automation & Integration**
- Automatic sales invoice creation when orders are placed
- Automatic payment recording from order payments
- Daily and monthly financial summaries
- Double-entry ledger automation
- Ledger entry tracking for all transactions

### 8. **Tax & Compliance**
- GST/Tax field support in invoices
- Item-level and invoice-level tax rates
- Tax calculation automation
- Tax summary in reports

## Database Schema

### Main Tables

#### `invoices`
Stores all sales and purchase invoices
```sql
Fields: id, invoice_number, invoice_date, due_date, invoice_type, customer_id, vendor_id,
        subtotal, tax_amount, tax_rate, discount_amount, total_amount, paid_amount,
        payment_status, notes, created_by, created_at, updated_at
```

#### `invoice_items`
Individual line items within invoices
```sql
Fields: id, invoice_id, item_name, description, quantity, unit_price, amount,
        tax_rate, tax_amount, created_at
```

#### `transactions`
Income and expense tracking
```sql
Fields: id, transaction_number, transaction_date, transaction_type, category,
        subcategory, amount, payment_method, description, invoice_id, customer_id,
        vendor_id, reference_number, status, created_by, created_at, updated_at
```

#### `ledger_entries`
Double-entry bookkeeping records
```sql
Fields: id, transaction_id, account_name, debit, credit, entry_date, balance, created_at
```

#### `payments`
Payment records against invoices
```sql
Fields: id, payment_number, invoice_id, payment_date, amount, payment_method,
        reference_number, notes, created_by, created_at
```

#### `customers` & `vendors`
Master data for business partners
```sql
Fields: id, name, email, phone, address, city, state, pincode, gst_number,
        pan_number, [credit_limit/bank_account], is_active, created_at, updated_at
```

#### Summary Tables
- `daily_summary`: Daily totals
- `monthly_summary`: Monthly totals

## API Endpoints

### Authentication
All endpoints use role-based access control via `X-User-Role` header.
```
X-User-Role: admin | accountant | viewer
```

### Customer Endpoints
```
POST   /api/books/customers                    # Create customer
GET    /api/books/customers/:id               # Get customer details
GET    /api/books/customers                   # List customers
PUT    /api/books/customers/:id               # Update customer
PATCH  /api/books/customers/:id/status        # Toggle active status
```

### Invoice Endpoints
```
POST   /api/books/invoices                    # Create invoice
GET    /api/books/invoices/:id                # Get invoice with items
GET    /api/books/invoices                    # List invoices (with filters)
PUT    /api/books/invoices/:id                # Update invoice
DELETE /api/books/invoices/:id                # Delete unpaid invoice
```

Query Parameters for listing:
- `invoiceType`: sales | purchase
- `paymentStatus`: unpaid | partial | paid
- `customerId`, `vendorId`: Filter by party
- `fromDate`, `toDate`: Date range
- `limit`, `offset`: Pagination

### Transaction Endpoints
```
POST   /api/books/transactions/income         # Create income transaction
POST   /api/books/transactions/expense        # Create expense transaction
GET    /api/books/transactions/:id            # Get transaction
GET    /api/books/transactions                # List transactions (with filters)
PUT    /api/books/transactions/:id            # Update transaction
DELETE /api/books/transactions/:id            # Delete pending transaction
```

### Payment Endpoints
```
POST   /api/books/payments                    # Record payment
GET    /api/books/payments/:id                # Get payment
GET    /api/books/payments                    # List payments
PUT    /api/books/payments/:id                # Update payment
DELETE /api/books/payments/:id                # Delete payment
```

### Report Endpoints
```
GET    /api/books/reports/dashboard           # Financial dashboard
GET    /api/books/reports/profit-loss         # P&L statement
GET    /api/books/reports/customer-ledger/:id # Customer ledger
GET    /api/books/reports/vendor-ledger/:id   # Vendor ledger
GET    /api/books/reports/sales               # Sales report
GET    /api/books/reports/expenses            # Expense report
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd backend
npm install mysql2 dotenv
```

### 2. Create Database
```bash
mysql -u root -p
CREATE DATABASE artvpp_books;
USE artvpp_books;
SOURCE database/schema.sql;
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Start Server
```bash
npm start  # or npm run dev for development with nodemon
```

### 5. Verify Setup
```bash
curl http://localhost:5000/api/books/health
# Response: { "status": "Books Services API is running" }
```

## Usage Examples

### Creating a Sales Invoice
```bash
curl -X POST http://localhost:5000/api/books/invoices \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceType": "sales",
    "customerId": 1,
    "items": [
      {
        "name": "Abstract Canvas Art",
        "quantity": 1,
        "unit_price": 2500,
        "tax_rate": 18,
        "description": "Premium artwork"
      }
    ],
    "taxRate": 18,
    "discountAmount": 0
  }'
```

### Recording an Income Transaction
```bash
curl -X POST http://localhost:5000/api/books/transactions/income \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "amount": 5000,
    "category": "Product Sales",
    "subcategory": "Art Prints",
    "paymentMethod": "bank_transfer",
    "description": "Multiple art sales"
  }'
```

### Recording a Payment
```bash
curl -X POST http://localhost:5000/api/books/payments \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceId": 1,
    "amount": 2500,
    "paymentMethod": "bank_transfer",
    "referenceNumber": "TXN12345"
  }'
```

### Getting Financial Dashboard
```bash
curl http://localhost:5000/api/books/reports/dashboard?period=monthly \
  -H "X-User-Role: accountant"
```

### Getting P&L Statement
```bash
curl "http://localhost:5000/api/books/reports/profit-loss?fromDate=2024-01-01&toDate=2024-12-31" \
  -H "X-User-Role: accountant"
```

## Automation Integration

### Auto-Create Invoice from Order
```javascript
const { autoCreateSalesInvoice } = require('./utils/booksAutomation');

// When order is placed in e-commerce
const result = await autoCreateSalesInvoice({
  orderId: '12345',
  customerId: 1,
  items: [
    {
      name: 'Digital Art Print',
      quantity: 1,
      unit_price: 800,
      tax_rate: 18
    }
  ],
  totalAmount: 944,
  taxAmount: 144,
  taxRate: 18,
  customerEmail: 'customer@example.com',
  customerName: 'John Doe'
});
```

### Auto-Record Payment
```javascript
const { autoRecordPayment } = require('./utils/booksAutomation');

// When order payment is received
const result = await autoRecordPayment(invoiceId, 944, 'online');
// Returns: { invoiceId, newPaidAmount, paymentStatus, ... }
```

### Get Financial Summary
```javascript
const { getFinancialSummary } = require('./utils/booksAutomation');

const summary = await getFinancialSummary('2024-01-01', '2024-01-31');
// Returns: { total_income, total_expenses, net_profit, profit_margin }
```

## Security & Compliance

### Access Control
- All endpoints check user role before execution
- Three-tier permission system (admin/accountant/viewer)
- Cannot delete paid invoices
- Cannot modify completed transactions
- Paid amounts are locked

### Data Integrity
- Double-entry ledger ensures accounting balance
- Transaction atomicity with database transactions
- Audit trail with created_by and timestamps
- Unique invoice/transaction/payment numbers

### Tax Compliance
- GST/Tax field support
- Item-level and invoice-level tax calculation
- Tax summary reports
- Configurable tax rates

## Reports & Export

The system can generate:
1. **Daily Summary**: Income, expenses, profit
2. **Monthly Summary**: Monthly trends
3. **Profit & Loss**: Revenue and expense breakdown
4. **Customer Ledger**: Receivables tracking
5. **Vendor Ledger**: Payables tracking
6. **Sales Report**: Invoice-wise sales details
7. **Expense Report**: Category-wise expenses

(PDF/Excel export functionality to be added in frontend)

## Troubleshooting

### Database Connection Error
```
✗ Books Database connection failed: Error: connect ECONNREFUSED 127.0.0.1:3306

Solution:
1. Ensure MySQL is running
2. Check DB_HOST, DB_USER, DB_PASSWORD in .env
3. Verify database exists: mysql -u root -p -e "SHOW DATABASES;"
```

### Permission Denied Error
```
error: 'Access denied: accountant role cannot create users'

Solution: Ensure you're using the correct X-User-Role header for the operation
- Admin: Full access
- Accountant: Create/Read/Update (no delete/config)
- Viewer: Read-only
```

## File Structure
```
backend/
  ├── config/
  │   └── dbBooks.js              # Database connection
  ├── controllers/
  │   ├── invoiceController.js     # Invoice operations
  │   ├── transactionController.js # Transaction operations
  │   ├── paymentController.js     # Payment operations
  │   ├── reportController.js      # Reports & dashboards
  │   └── customerVendorController.js
  ├── routes/
  │   └── booksRoutes.js           # All API routes
  ├── middleware/
  │   └── booksAuthMiddleware.js   # Role-based access control
  ├── utils/
  │   ├── booksUtils.js            # Core utility functions
  │   └── booksAutomation.js       # Automation integration
  ├── database/
  │   └── schema.sql               # Database schema
  ├── index.js                     # Main server file
  └── .env.example                 # Configuration template
```

## Future Enhancements

- [ ] PDF invoice generation
- [ ] Excel export for reports
- [ ] Email invoice distribution
- [ ] Bank reconciliation
- [ ] Recurring invoices
- [ ] Budget and forecasting
- [ ] Multi-currency support
- [ ] Advanced tax rules (GST, VAT)
- [ ] API webhooks for third-party integration
- [ ] Real-time notification system

## Support & Contributing

For issues or feature requests, please refer to the project documentation or contact the development team.

---

*Last Updated: February 2026*
*Books Services Module v1.0*
