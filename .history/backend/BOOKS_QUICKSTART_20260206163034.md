# Books Services - QuickStart Guide

## 5-Minute Setup

### Step 1: Install Dependencies (Already Installed ✓)
```bash
cd backend
# mysql2, express, dotenv already installed in package.json
```

### Step 2: Create Environment File
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=artvpp_books
PORT=5000
```

### Step 3: Create MySQL Database
```bash
# Option A: Using MySQL CLI
mysql -u root -p
CREATE DATABASE artvpp_books;
CREATE DATABASE artvpp_books CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE artvpp_books;
SOURCE backend/database/schema.sql;
EXIT;

# Option B: Using Node Script (create this file as: backend/setup-db.js)
```

**Create `backend/setup-db.js`:**
```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setupDatabase() {
  try {
    // Create connection to MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✓ Connected to MySQL');

    // Create database
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'artvpp_books'}`
    );
    console.log('✓ Database created/exists');

    // Switch to database
    await connection.query(`USE ${process.env.DB_NAME || 'artvpp_books'}`);

    // Read schema
    const schema = fs.readFileSync('./database/schema.sql', 'utf-8');
    
    // Execute schema statements
    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('✓ Tables created successfully');
    await connection.end();
    console.log('\n✓ Database setup complete!');
  } catch (error) {
    console.error('✗ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
```

Then run:
```bash
node setup-db.js
```

### Step 4: Start the Server
```bash
# Development with auto-reload
npm run dev

# Or production
npm start
```

**Expected Output:**
```
✓ Books Database connection successful
✓ Server is running on http://localhost:5000
✓ Books Services API available at http://localhost:5000/api/books
```

### Step 5: Test the API
```bash
# Test health endpoint
curl http://localhost:5000/api/books/health

# Should return: { "status": "Books Services API is running" }
```

## Quick API Tests

### 1. Create a Customer
```bash
curl -X POST http://localhost:5000/api/books/customers \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "name": "Acme Design Studio",
    "email": "contact@acme.com",
    "phone": "9876543210",
    "city": "Mumbai",
    "gstNumber": "27AABBU9603R1Z0"
  }'
```

### 2. Create an Invoice
```bash
curl -X POST http://localhost:5000/api/books/invoices \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "invoiceType": "sales",
    "customerId": 1,
    "items": [
      {
        "name": "Design Services",
        "quantity": 10,
        "unit_price": 1000,
        "tax_rate": 18,
        "description": "Web design hours"
      }
    ],
    "taxRate": 0,
    "discountAmount": 0
  }'
```

### 3. Record Income
```bash
curl -X POST http://localhost:5000/api/books/transactions/income \
  -H "Content-Type: application/json" \
  -H "X-User-Role: accountant" \
  -d '{
    "amount": 11800,
    "category": "Design Services",
    "paymentMethod": "bank_transfer",
    "description": "Payment from Acme Studio"
  }'
```

### 4. Get Financial Dashboard
```bash
curl "http://localhost:5000/api/books/reports/dashboard?period=monthly" \
  -H "X-User-Role: accountant"
```

### 5. List Customers
```bash
curl "http://localhost:5000/api/books/customers" \
  -H "X-User-Role: accountant"
```

## Common Issues & Solutions

### Issue 1: "Can't find module 'mysql2'"
```bash
# Solution:
npm install mysql2
```

### Issue 2: "Access denied for user 'root'@'localhost'"
```bash
# Check your .env file has correct credentials
# Test MySQL connection:
mysql -u root -p
# Enter your password
```

### Issue 3: Database doesn't exist
```bash
# Create it manually:
mysql -u root -p
CREATE DATABASE artvpp_books;
\. backend/database/schema.sql
```

### Issue 4: Port 5000 already in use
```bash
# Option A: Kill the process
lsof -i :5000
kill -9 <PID>

# Option B: Use different port
PORT=5001 npm run dev
```

## Project Structure Overview

```
ArtVpp/
├── backend/                          # Node.js Express server
│   ├── config/
│   │   └── dbBooks.js               # Database connection pool
│   ├── controllers/
│   │   ├── invoiceController.js
│   │   ├── transactionController.js
│   │   ├── paymentController.js
│   │   ├── reportController.js
│   │   └── customerVendorController.js
│   ├── routes/
│   │   └── booksRoutes.js            # All API endpoints
│   ├── middleware/
│   │   └── booksAuthMiddleware.js    # Role-based access
│   ├── utils/
│   │   ├── booksUtils.js             # Helper functions
│   │   └── booksAutomation.js        # Order integration
│   ├── database/
│   │   └── schema.sql                # Database schema
│   ├── index.js                      # Main server
│   ├── package.json
│   ├── .env                          # Your config
│   ├── .env.example                  # Template
│   └── BOOKS_SERVICES_DOCS.md        # Full documentation
│
├── frontend/                         # React Vite app
│   └── (E-commerce UI)
│
└── README.md
```

## Next Steps

1. **Read Full Documentation**: See `BOOKS_SERVICES_DOCS.md`
2. **Test All Endpoints**: Use the API examples above
3. **Create Sample Data**: Add some transactions and invoices
4. **Build Frontend**: Create React components for the Books Services UI
5. **Integrate with Orders**: Connect to e-commerce checkout flow

## Role-Based Access

By default, use this header for API requests:
```
X-User-Role: admin        # Full access
X-User-Role: accountant   # Create/Read/Update
X-User-Role: viewer       # Read-only
```

Example:
```bash
curl http://localhost:5000/api/books/invoices \
  -H "X-User-Role: viewer"
  # Can only READ invoices
```

## Integrating with E-commerce Orders

When an order is placed, automatically:

```javascript
// In your order checkout handler
const { autoCreateSalesInvoice } = require('./utils/booksAutomation');

// When order is confirmed
const invoice = await autoCreateSalesInvoice({
  orderId: order.id,
  customerId: order.customer_id,
  items: order.items,          // Product items
  totalAmount: order.total,
  taxAmount: order.tax,
  customerEmail: order.email,
  customerName: order.name
});

// Save invoice ID to your order
order.invoiceId = invoice.invoiceId;
```

## Environment Variables Explained

```bash
# Server Configuration
PORT=5000                          # Express server port
NODE_ENV=development              # development | production

# Database Connection
DB_HOST=localhost                  # MySQL host
DB_USER=root                       # MySQL username
DB_PASSWORD=password               # MySQL password
DB_NAME=artvpp_books              # Database name

# Features
ENABLE_GST_CALCULATION=true        # Enable GST in invoices
ENABLE_TAX_REPORTS=true           # Generate tax reports
AUTO_CREATE_INVOICES=true         # Auto-create on orders
SYNC_PAYMENTS=true                # Auto-sync from orders
```

## Account Categories for Transactions

### Income Categories
- Product Sales
- Service Revenue
- Consulting Fees
- Subscription Income
- Other Income

### Expense Categories
- Materials & Supplies
- Staff Salaries
- Utilities
- Office Rent
- Marketing
- Technology
- Professional Fees
- Other Expenses

## Testing Checklist

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Can create a customer
- [ ] Can create an invoice
- [ ] Can record a payment
- [ ] Can view invoices
- [ ] Financial dashboard loads
- [ ] P&L statement generates correctly

## Performance Tips

1. **Indexing**: All high-query columns are indexed
2. **Pagination**: Use limit/offset for large result sets
3. **Date Ranges**: Specify date ranges in reports for better performance
4. **Connection Pooling**: Database uses connection pool (10 connections)

## Support

- **Full Docs**: Read `BOOKS_SERVICES_DOCS.md`
- **Issues**: Check troubleshooting section
- **API Tests**: Use provided curl examples

---

**Ready to go!** 🚀 Start the server and test the API.

