# Books Services - API Testing Guide

Complete collection of curl commands to test all APIs with real examples.

## Setup

All requests include header for role-based access:
```bash
-H "X-User-Role: accountant"  # Use: admin | accountant | viewer
```

## 1. CUSTOMER ENDPOINTS

### Create Customer
```bash
curl -X POST http://localhost:5000/api/books/customers \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "name": "Acme Design Studio",
    "email": "contact@acme.com",
    "phone": "9876543210",
    "address": "123 Creative Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "gstNumber": "27AABBU9603R1Z0",
    "creditLimit": 50000
  }'
```

### List Customers
```bash
curl http://localhost:5000/api/books/customers \
  -H "X-User-Role: accountant"
```

### Get Customer by ID
```bash
curl http://localhost:5000/api/books/customers/1 \
  -H "X-User-Role: accountant"
```

### Update Customer
```bash
curl -X PUT http://localhost:5000/api/books/customers/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "name": "Acme Design Studio Inc",
    "email": "newemail@acme.com",
    "phone": "9876543211"
  }'
```

### Toggle Customer Status
```bash
curl -X PATCH http://localhost:5000/api/books/customers/1/status \
  -H "X-User-Role: accountant"
```

---

## 2. VENDOR ENDPOINTS

### Create Vendor
```bash
curl -X POST http://localhost:5000/api/books/vendors \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "name": "Paper Supplies Inc",
    "email": "sales@papersupplies.com",
    "phone": "8765432109",
    "address": "456 Industry Road",
    "city": "Pune",
    "state": "Maharashtra",
    "pincode": "411001",
    "gstNumber": "27AABCU1234R1Z0",
    "bankAccount": "1234567890123456",
    "ifscCode": "ICIC0000001"
  }'
```

### List Vendors
```bash
curl http://localhost:5000/api/books/vendors \
  -H "X-User-Role: accountant"
```

### Get Vendor by ID
```bash
curl http://localhost:5000/api/books/vendors/1 \
  -H "X-User-Role: accountant"
```

---

## 3. INVOICE ENDPOINTS

### Create Sales Invoice
```bash
curl -X POST http://localhost:5000/api/books/invoices \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceType": "sales",
    "customerId": 1,
    "items": [
      {
        "name": "Web Design - 10 hours",
        "quantity": 10,
        "unit_price": 1000,
        "tax_rate": 18,
        "description": "Professional web design service"
      },
      {
        "name": "UI/UX Consultation",
        "quantity": 1,
        "unit_price": 5000,
        "tax_rate": 18,
        "description": "Design strategy consultation"
      }
    ],
    "taxRate": 0,
    "discountAmount": 0,
    "dueDate": "2026-03-10",
    "notes": "Payment due within 30 days"
  }'
```

### Create Purchase Invoice
```bash
curl -X POST http://localhost:5000/api/books/invoices \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceType": "purchase",
    "vendorId": 1,
    "items": [
      {
        "name": "A4 Paper Pack (500 sheets)",
        "quantity": 10,
        "unit_price": 250,
        "tax_rate": 18
      }
    ],
    "taxRate": 0,
    "discountAmount": 500,
    "dueDate": "2026-02-28"
  }'
```

### List Invoices with Filters
```bash
# All sales invoices
curl "http://localhost:5000/api/books/invoices?invoiceType=sales" \
  -H "X-User-Role: accountant"

# Unpaid invoices
curl "http://localhost:5000/api/books/invoices?paymentStatus=unpaid" \
  -H "X-User-Role: accountant"

# By customer
curl "http://localhost:5000/api/books/invoices?customerId=1" \
  -H "X-User-Role: accountant"

# Date range
curl "http://localhost:5000/api/books/invoices?fromDate=2026-01-01&toDate=2026-02-06" \
  -H "X-User-Role: accountant"

# With pagination
curl "http://localhost:5000/api/books/invoices?limit=10&offset=0" \
  -H "X-User-Role: accountant"
```

### Get Invoice Details
```bash
curl http://localhost:5000/api/books/invoices/1 \
  -H "X-User-Role: accountant"
```

### Update Invoice
```bash
curl -X PUT http://localhost:5000/api/books/invoices/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "items": [
      {
        "name": "Web Design - 12 hours",
        "quantity": 12,
        "unit_price": 1000,
        "tax_rate": 18
      }
    ],
    "taxRate": 0,
    "discountAmount": 0,
    "dueDate": "2026-03-15",
    "notes": "Updated invoice"
  }'
```

### Delete Invoice
```bash
curl -X DELETE http://localhost:5000/api/books/invoices/1 \
  -H "X-User-Role: accountant"
```

---

## 4. TRANSACTION ENDPOINTS

### Create Income Transaction
```bash
curl -X POST http://localhost:5000/api/books/transactions/income \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "amount": 50000,
    "category": "Product Sales",
    "subcategory": "Art Prints",
    "paymentMethod": "bank_transfer",
    "description": "Sales from monthly exhibition",
    "customerId": 1
  }'
```

### Create Expense Transaction
```bash
curl -X POST http://localhost:5000/api/books/transactions/expense \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "amount": 10000,
    "category": "Office Rent",
    "subcategory": "Studio Space",
    "paymentMethod": "bank_transfer",
    "description": "Monthly studio rent",
    "referenceNumber": "CHQ12345",
    "vendorId": 1
  }'
```

### List Transactions with Filters
```bash
# Income only
curl "http://localhost:5000/api/books/transactions?transactionType=income" \
  -H "X-User-Role: accountant"

# By category
curl "http://localhost:5000/api/books/transactions?category=Product%20Sales" \
  -H "X-User-Role: accountant"

# Date range
curl "http://localhost:5000/api/books/transactions?fromDate=2026-01-01&toDate=2026-02-06&transactionType=expense" \
  -H "X-User-Role: accountant"
```

### Get Single Transaction
```bash
curl http://localhost:5000/api/books/transactions/1 \
  -H "X-User-Role: accountant"
```

### Update Transaction
```bash
curl -X PUT http://localhost:5000/api/books/transactions/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "amount": 15000,
    "category": "Office Rent",
    "description": "Updated rent payment"
  }'
```

---

## 5. PAYMENT ENDPOINTS

### Record Payment
```bash
curl -X POST http://localhost:5000/api/books/payments \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceId": 1,
    "amount": 5900,
    "paymentMethod": "bank_transfer",
    "referenceNumber": "TXN20260206001",
    "notes": "Partial payment received"
  }'
```

### List Payments
```bash
# All payments
curl http://localhost:5000/api/books/payments \
  -H "X-User-Role: accountant"

# For specific invoice
curl "http://localhost:5000/api/books/payments?invoiceId=1" \
  -H "X-User-Role: accountant"

# Date range
curl "http://localhost:5000/api/books/payments?fromDate=2026-01-01&toDate=2026-02-06" \
  -H "X-User-Role: accountant"
```

### Get Payment Details
```bash
curl http://localhost:5000/api/books/payments/1 \
  -H "X-User-Role: accountant"
```

### Update Payment
```bash
curl -X PUT http://localhost:5000/api/books/payments/1 \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "amount": 6000,
    "paymentMethod": "credit_card",
    "referenceNumber": "CC12345"
  }'
```

### Delete Payment
```bash
curl -X DELETE http://localhost:5000/api/books/payments/1 \
  -H "X-User-Role: accountant"
```

---

## 6. REPORT ENDPOINTS

### Financial Dashboard
```bash
# Monthly view (default)
curl http://localhost:5000/api/books/reports/dashboard \
  -H "X-User-Role: accountant"

# Daily view
curl "http://localhost:5000/api/books/reports/dashboard?period=daily" \
  -H "X-User-Role: accountant"

# Yearly view
curl "http://localhost:5000/api/books/reports/dashboard?period=yearly" \
  -H "X-User-Role: accountant"
```

### Profit & Loss Statement
```bash
curl "http://localhost:5000/api/books/reports/profit-loss?fromDate=2026-01-01&toDate=2026-02-06" \
  -H "X-User-Role: accountant"
```

### Customer Ledger
```bash
curl http://localhost:5000/api/books/reports/customer-ledger/1 \
  -H "X-User-Role: accountant"
```

### Vendor Ledger
```bash
curl http://localhost:5000/api/books/reports/vendor-ledger/1 \
  -H "X-User-Role: accountant"
```

### Sales Report
```bash
curl "http://localhost:5000/api/books/reports/sales?fromDate=2026-01-01&toDate=2026-02-06" \
  -H "X-User-Role: accountant"
```

### Expense Report
```bash
curl "http://localhost:5000/api/books/reports/expenses?fromDate=2026-01-01&toDate=2026-02-06" \
  -H "X-User-Role: accountant"
```

---

## 7. HEALTH CHECK

```bash
curl http://localhost:5000/api/books/health
```

Expected response:
```json
{ "status": "Books Services API is running" }
```

---

## Testing Workflow

### Complete Order to Invoice Workflow:

```bash
# 1. Create a customer
curl -X POST http://localhost:5000/api/books/customers \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{"name": "Test Customer", "email": "test@example.com"}'

# Response will have customerId: 1

# 2. Create an invoice
curl -X POST http://localhost:5000/api/books/invoices \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceType": "sales",
    "customerId": 1,
    "items": [{"name": "Service", "quantity": 1, "unit_price": 5000, "tax_rate": 18}]
  }'

# Response will have invoiceId: 1

# 3. Record partial payment
curl -X POST http://localhost:5000/api/books/payments \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceId": 1,
    "amount": 2950,
    "paymentMethod": "bank_transfer"
  }'

# 4. Check payment status
curl http://localhost:5000/api/books/invoices/1 \
  -H "X-User-Role: accountant"
# Should show payment_status: "partial"

# 5. Record full payment
curl -X POST http://localhost:5000/api/books/payments \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceId": 1,
    "amount": 2950,
    "paymentMethod": "bank_transfer"
  }'

# 6. Check final status
curl http://localhost:5000/api/books/invoices/1 \
  -H "X-User-Role: accountant"
# Should show payment_status: "paid"

# 7. View financial dashboard
curl http://localhost:5000/api/books/reports/dashboard \
  -H "X-User-Role: accountant"
# Should show income and summary
```

---

## Error Codes & Responses

### 400 - Bad Request
```json
{ "error": "Amount and category are required" }
```

### 403 - Access Denied
```json
{ 
  "error": "Access denied",
  "message": "viewer role cannot create invoices"
}
```

### 404 - Not Found
```json
{ "error": "Invoice not found" }
```

### 500 - Server Error
```json
{ "error": "Failed to create invoice" }
```

---

## Pro Tips

1. **Save Customer ID**: Use the ID returned from create customer for future invoices
2. **Batch Testing**: Create 5 customers, 10 invoices, record payments for workflow testing
3. **View Filters**: Always specify date ranges for reports for better performance
4. **Role Testing**: Try same requests with different X-User-Role headers to test permissions
5. **Pagination**: Large datasets, use limit=10 and offset=0,10,20... for pagination

---

## Quick Copy-Paste Examples

### Test as Admin (full access):
```bash
export ROLE="admin"
curl http://localhost:5000/api/books/customers \
  -H "X-User-Role: $ROLE"
```

### Test as Viewer (read-only):
```bash
curl http://localhost:5000/api/books/customers \
  -H "X-User-Role: viewer"
```

### Pretty Print JSON:
```bash
curl http://localhost:5000/api/books/dashboard | json_pp
# or
curl http://localhost:5000/api/books/dashboard | python -m json.tool
```

---

Happy testing! 🚀
