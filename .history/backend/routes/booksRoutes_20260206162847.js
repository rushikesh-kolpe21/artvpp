const express = require('express');
const router = express.Router();

// Import controllers
const invoiceController = require('../controllers/invoiceController');
const transactionController = require('../controllers/transactionController');
const paymentController = require('../controllers/paymentController');
const reportController = require('../controllers/reportController');
const customerVendorController = require('../controllers/customerVendorController');

// Import middleware
const {
  attachUser,
  requireCanCreate,
  requireCanRead,
  requireCanUpdate,
  requireCanDelete,
  requireAdminOrAccountant
} = require('../middleware/booksAuthMiddleware');

// Apply user attachment to all routes
router.use(attachUser);

// ===== CUSTOMER ROUTES =====
router.post('/customers', requireCanCreate('customers'), customerVendorController.createCustomer);
router.get('/customers/:id', requireCanRead('customers'), customerVendorController.getCustomer);
router.get('/customers', requireCanRead('customers'), customerVendorController.listCustomers);
router.put('/customers/:id', requireCanUpdate('customers'), customerVendorController.updateCustomer);
router.patch('/customers/:id/status', requireAdminOrAccountant, customerVendorController.toggleCustomerStatus);

// ===== VENDOR ROUTES =====
router.post('/vendors', requireCanCreate('vendors'), customerVendorController.createVendor);
router.get('/vendors/:id', requireCanRead('vendors'), customerVendorController.getVendor);
router.get('/vendors', requireCanRead('vendors'), customerVendorController.listVendors);
router.put('/vendors/:id', requireCanUpdate('vendors'), customerVendorController.updateVendor);
router.patch('/vendors/:id/status', requireAdminOrAccountant, customerVendorController.toggleVendorStatus);

// ===== INVOICE ROUTES =====
router.post('/invoices', requireCanCreate('invoices'), invoiceController.createInvoice);
router.get('/invoices/:id', requireCanRead('invoices'), invoiceController.getInvoice);
router.get('/invoices', requireCanRead('invoices'), invoiceController.listInvoices);
router.put('/invoices/:id', requireCanUpdate('invoices'), invoiceController.updateInvoice);
router.delete('/invoices/:id', requireCanDelete('invoices'), invoiceController.deleteInvoice);

// ===== TRANSACTION ROUTES =====
router.post('/transactions/income', requireCanCreate('transactions'), transactionController.createIncomeTransaction);
router.post('/transactions/expense', requireCanCreate('transactions'), transactionController.createExpenseTransaction);
router.get('/transactions/:id', requireCanRead('transactions'), transactionController.getTransaction);
router.get('/transactions', requireCanRead('transactions'), transactionController.listTransactions);
router.put('/transactions/:id', requireCanUpdate('transactions'), transactionController.updateTransaction);
router.delete('/transactions/:id', requireCanDelete('transactions'), transactionController.deleteTransaction);

// ===== PAYMENT ROUTES =====
router.post('/payments', requireCanCreate('payments'), paymentController.recordPayment);
router.get('/payments/:id', requireCanRead('payments'), paymentController.getPayment);
router.get('/payments', requireCanRead('payments'), paymentController.listPayments);
router.put('/payments/:id', requireCanUpdate('payments'), paymentController.updatePayment);
router.delete('/payments/:id', requireCanDelete('payments'), paymentController.deletePayment);

// ===== REPORT ROUTES =====
router.get('/reports/dashboard', requireCanRead('reports'), reportController.getFinancialDashboard);
router.get('/reports/profit-loss', requireCanRead('reports'), reportController.getProfitLossStatement);
router.get('/reports/customer-ledger/:customerId', requireCanRead('reports'), reportController.getCustomerLedger);
router.get('/reports/vendor-ledger/:vendorId', requireCanRead('reports'), reportController.getVendorLedger);
router.get('/reports/sales', requireCanRead('reports'), reportController.getSalesReport);
router.get('/reports/expenses', requireCanRead('reports'), reportController.getExpenseReport);

// Health check for Books Services
router.get('/health', (req, res) => {
  res.json({ status: 'Books Services API is running' });
});

module.exports = router;
