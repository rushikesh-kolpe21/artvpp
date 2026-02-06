const pool = require('../config/dbBooks');
const {
  generateInvoiceNumber,
  calculateInvoiceTotals,
  generateTransactionNumber,
  recordLedgerEntry,
  calculateDailySummary,
  calculateMonthlySummary
} = require('./booksUtils');

/**
 * Automatically create a sales invoice and transaction when an order is placed
 * This function should be called from the order placement API
 * 
 * @param {Object} orderData - Order details from e-commerce
 * @returns {Object} - Created invoice details
 */
const autoCreateSalesInvoice = async (orderData) => {
  const {
    orderId,
    customerId,
    items, // Array of {name, quantity, unit_price, tax_rate}
    totalAmount,
    taxAmount = 0,
    taxRate = 0,
    discountAmount = 0,
    customerEmail,
    customerName
  } = orderData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber('sales');

    // Create or update customer
    let finalCustomerId = customerId;
    if (!customerId && customerName && customerEmail) {
      const [customerResult] = await connection.query(
        `INSERT INTO customers (name, email) VALUES (?, ?) ON DUPLICATE KEY UPDATE email = email`,
        [customerName, customerEmail]
      );
      finalCustomerId = customerResult.insertId;
    }

    // Create invoice
    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices 
       (invoice_number, invoice_date, due_date, invoice_type, customer_id, 
        subtotal, tax_amount, tax_rate, discount_amount, total_amount, created_by)
       VALUES (?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'sales', ?, 
               ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        finalCustomerId || null,
        totalAmount - taxAmount,
        taxAmount,
        taxRate,
        discountAmount,
        totalAmount,
        1 // System user
      ]
    );

    const invoiceId = invoiceResult.insertId;

    // Insert invoice items
    for (const item of items) {
      const itemAmount = item.quantity * item.unit_price;
      const itemTax = item.tax_rate ? itemAmount * (item.tax_rate / 100) : 0;

      await connection.query(
        `INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, amount, tax_rate, tax_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.name, item.description || '', item.quantity, item.unit_price, itemAmount, item.tax_rate || 0, itemTax]
      );
    }

    // Create corresponding income transaction
    const transactionNumber = await generateTransactionNumber();
    const [transResult] = await connection.query(
      `INSERT INTO transactions 
       (transaction_number, transaction_date, transaction_type, category, amount, 
        payment_method, invoice_id, customer_id, status, created_by)
       VALUES (?, CURDATE(), 'income', 'Sales', ?, 'order_payment', ?, ?, 'completed', ?)`,
      [transactionNumber, totalAmount, invoiceId, finalCustomerId || null, 1]
    );

    const transactionId = transResult.insertId;

    // Record ledger entries
    await recordLedgerEntry(transactionId, 'Bank Account', totalAmount, 0, new Date().toISOString().split('T')[0]);
    await recordLedgerEntry(transactionId, 'Revenue - Sales', 0, totalAmount, new Date().toISOString().split('T')[0]);

    // Update daily and monthly summaries
    const date = new Date().toISOString().split('T')[0];
    await calculateDailySummary(date);
    const now = new Date();
    await calculateMonthlySummary(now.getFullYear(), now.getMonth() + 1);

    await connection.commit();

    return {
      invoiceId,
      invoiceNumber,
      transactionId,
      transactionNumber,
      totalAmount,
      message: 'Sales invoice created successfully'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating sales invoice:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Mark an invoice as paid (used when payment is received)
 * 
 * @param {number} invoiceId - Invoice ID
 * @param {number} paidAmount - Amount paid
 * @param {string} paymentMethod - Payment method
 * @returns {Object} - Updated invoice status
 */
const autoRecordPayment = async (invoiceId, paidAmount, paymentMethod = 'online') => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get invoice
    const [invoices] = await connection.query(
      'SELECT * FROM invoices WHERE id = ?',
      [invoiceId]
    );

    if (invoices.length === 0) {
      throw new Error('Invoice not found');
    }

    const invoice = invoices[0];
    const newPaidAmount = (invoice.paid_amount || 0) + paidAmount;

    if (newPaidAmount > invoice.total_amount) {
      throw new Error('Payment amount exceeds invoice total');
    }

    // Update paid amount
    await connection.query(
      'UPDATE invoices SET paid_amount = paid_amount + ? WHERE id = ?',
      [paidAmount, invoiceId]
    );

    // Determine payment status
    let paymentStatus = 'unpaid';
    if (newPaidAmount >= invoice.total_amount) {
      paymentStatus = 'paid';
    } else if (newPaidAmount > 0) {
      paymentStatus = 'partial';
    }

    // Update payment status
    await connection.query(
      'UPDATE invoices SET payment_status = ? WHERE id = ?',
      [paymentStatus, invoiceId]
    );

    // Record payment entry
    const [paymentResult] = await connection.query(
      `INSERT INTO payments (payment_number, invoice_id, payment_date, amount, payment_method, created_by)
       VALUES (?, ?, CURDATE(), ?, ?, ?)`,
      [
        `PAY${Date.now().toString().slice(-10)}`,
        invoiceId,
        paidAmount,
        paymentMethod,
        1
      ]
    );

    await connection.commit();

    return {
      invoiceId,
      newPaidAmount,
      paymentStatus,
      paymentId: paymentResult.insertId,
      message: `Payment recorded. Invoice is now ${paymentStatus}`
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error recording payment:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get financial summary for a specific period
 * 
 * @param {string} fromDate - From date (YYYY-MM-DD)
 * @param {string} toDate - To date (YYYY-MM-DD)
 * @returns {Object} - Financial summary
 */
const getFinancialSummary = async (fromDate, toDate) => {
  const connection = await pool.getConnection();
  try {
    const [summary] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions 
      WHERE status = 'completed' AND transaction_date BETWEEN ? AND ?
    `, [fromDate, toDate]);

    const totalIncome = summary[0].total_income || 0;
    const totalExpenses = summary[0].total_expenses || 0;
    const netProfit = totalIncome - totalExpenses;

    return {
      period: { from_date: fromDate, to_date: toDate },
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      profit_margin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) + '%' : '0%'
    };
  } finally {
    connection.release();
  }
};

/**
 * Auto reconcile payments from order system
 * This syncs payment status from the e-commerce order with books
 * 
 * @param {Object} orderPaymentData - Payment data from order
 * @returns {Object} - Reconciliation result
 */
const autoReconcilePayment = async (orderPaymentData) => {
  const {
    orderId,
    invoiceId,
    paidAmount,
    paymentMethod,
    transactionId
  } = orderPaymentData;

  try {
    const result = await autoRecordPayment(invoiceId, paidAmount, paymentMethod);
    return {
      success: true,
      orderId,
      ...result
    };
  } catch (error) {
    console.error('Error reconciling payment:', error);
    return {
      success: false,
      orderId,
      error: error.message
    };
  }
};

/**
 * Generate invoice for a customer
 * Can be used for manual invoices outside of orders
 * 
 * @param {Object} invoiceData - Invoice details
 * @returns {Object} - Created invoice
 */
const generateCustomInvoice = async (invoiceData) => {
  const {
    invoiceType = 'sales',
    customerId,
    vendorId,
    items,
    taxRate = 0,
    discountAmount = 0,
    dueDate,
    notes = ''
  } = invoiceData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(invoiceType);

    // Calculate totals
    const { subtotal, tax_amount, total_amount } = calculateInvoiceTotals(items, taxRate, discountAmount);

    // Create invoice
    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices 
       (invoice_number, invoice_date, due_date, invoice_type, customer_id, vendor_id, 
        subtotal, tax_amount, tax_rate, discount_amount, total_amount, notes, created_by)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoiceType,
        customerId || null,
        vendorId || null,
        subtotal,
        tax_amount,
        taxRate,
        discountAmount,
        total_amount,
        notes,
        1
      ]
    );

    const invoiceId = invoiceResult.insertId;

    // Insert items
    for (const item of items) {
      const itemAmount = item.quantity * item.unit_price;
      const itemTax = item.tax_rate ? itemAmount * (item.tax_rate / 100) : 0;

      await connection.query(
        `INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, amount, tax_rate, tax_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.name, item.description || '', item.quantity, item.unit_price, itemAmount, item.tax_rate || 0, itemTax]
      );
    }

    await connection.commit();

    return {
      invoiceId,
      invoiceNumber,
      totalAmount: total_amount,
      message: 'Custom invoice created'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating custom invoice:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  autoCreateSalesInvoice,
  autoRecordPayment,
  getFinancialSummary,
  autoReconcilePayment,
  generateCustomInvoice
};
