const pool = require('../config/dbBooks');

// Generate unique invoice number
const generateInvoiceNumber = async (invoiceType) => {
  const prefix = invoiceType === 'sales' ? 'INV' : 'PUR';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'SELECT COUNT(*) as count FROM invoices WHERE invoice_number LIKE ?',
      [`${prefix}${year}${month}%`]
    );
    
    const nextNumber = String(result[0].count + 1).padStart(4, '0');
    return `${prefix}${year}${month}${nextNumber}`;
  } finally {
    connection.release();
  }
};

// Generate unique transaction number
const generateTransactionNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'SELECT COUNT(*) as count FROM transactions WHERE transaction_number LIKE ?',
      [`TXN${year}${month}${day}%`]
    );
    
    const nextNumber = String(result[0].count + 1).padStart(5, '0');
    return `TXN${year}${month}${day}${nextNumber}`;
  } finally {
    connection.release();
  }
};

// Generate unique payment number
const generatePaymentNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      'SELECT COUNT(*) as count FROM payments WHERE payment_number LIKE ?',
      [`PAY${year}${month}%`]
    );
    
    const nextNumber = String(result[0].count + 1).padStart(5, '0');
    return `PAY${year}${month}${nextNumber}`;
  } finally {
    connection.release();
  }
};

// Calculate invoice totals
const calculateInvoiceTotals = (items, taxRate, discountAmount) => {
  let subtotal = 0;
  let totalTax = 0;

  items.forEach(item => {
    const itemAmount = item.quantity * item.unit_price;
    subtotal += itemAmount;
    
    if (item.tax_rate) {
      const itemTax = itemAmount * (item.tax_rate / 100);
      totalTax += itemTax;
    }
  });

  // Apply tax to subtotal if invoice-level tax is provided
  if (taxRate && !items.some(i => i.tax_rate)) {
    totalTax = subtotal * (taxRate / 100);
  }

  const totalAfterTax = subtotal + totalTax;
  const totalAmount = totalAfterTax - (discountAmount || 0);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax_amount: parseFloat(totalTax.toFixed(2)),
    discount_amount: discountAmount || 0,
    total_amount: parseFloat(totalAmount.toFixed(2))
  };
};

// Update invoice payment status
const updatePaymentStatus = async (invoiceId) => {
  const connection = await pool.getConnection();
  try {
    const [invoices] = await connection.query(
      'SELECT total_amount, paid_amount FROM invoices WHERE id = ?',
      [invoiceId]
    );

    if (invoices.length === 0) return null;

    const { total_amount, paid_amount } = invoices[0];
    let paymentStatus = 'unpaid';

    if (paid_amount >= total_amount) {
      paymentStatus = 'paid';
    } else if (paid_amount > 0) {
      paymentStatus = 'partial';
    }

    await connection.query(
      'UPDATE invoices SET payment_status = ? WHERE id = ?',
      [paymentStatus, invoiceId]
    );

    return paymentStatus;
  } finally {
    connection.release();
  }
};

// Record ledger entry (double-entry bookkeeping)
const recordLedgerEntry = async (transactionId, accountName, debit, credit, entryDate) => {
  const connection = await pool.getConnection();
  try {
    // Get current balance
    const [lastEntry] = await connection.query(
      'SELECT balance FROM ledger_entries WHERE account_name = ? ORDER BY entry_date DESC, id DESC LIMIT 1',
      [accountName]
    );

    let newBalance = (debit || 0) - (credit || 0);
    if (lastEntry.length > 0) {
      newBalance += lastEntry[0].balance || 0;
    }

    const [result] = await connection.query(
      'INSERT INTO ledger_entries (transaction_id, account_name, debit, credit, entry_date, balance) VALUES (?, ?, ?, ?, ?, ?)',
      [transactionId, accountName, debit || 0, credit || 0, entryDate, newBalance]
    );

    return { id: result.insertId, balance: newBalance };
  } finally {
    connection.release();
  }
};

// Get customer balance
const getCustomerBalance = async (customerId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN invoice_type = 'sales' THEN total_amount ELSE 0 END), 0) as total_due,
        COALESCE(SUM(CASE WHEN invoice_type = 'sales' THEN paid_amount ELSE 0 END), 0) as total_paid
      FROM invoices 
      WHERE customer_id = ? AND payment_status != 'paid'
    `, [customerId]);

    const totalDue = result[0].total_due || 0;
    const totalPaid = result[0].total_paid || 0;
    const balance = totalDue - totalPaid;

    return {
      total_due: totalDue,
      total_paid: totalPaid,
      outstanding_balance: balance
    };
  } finally {
    connection.release();
  }
};

// Get vendor balance
const getVendorBalance = async (vendorId) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN invoice_type = 'purchase' THEN total_amount ELSE 0 END), 0) as total_due,
        COALESCE(SUM(CASE WHEN invoice_type = 'purchase' THEN paid_amount ELSE 0 END), 0) as total_paid
      FROM invoices 
      WHERE vendor_id = ? AND payment_status != 'paid'
    `, [vendorId]);

    const totalDue = result[0].total_due || 0;
    const totalPaid = result[0].total_paid || 0;
    const balance = totalDue - totalPaid;

    return {
      total_due: totalDue,
      total_paid: totalPaid,
      outstanding_balance: balance
    };
  } finally {
    connection.release();
  }
};

// Calculate daily financial summary
const calculateDailySummary = async (summaryDate) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions 
      WHERE DATE(transaction_date) = ?
    `, [summaryDate]);

    const totalIncome = result[0].total_income || 0;
    const totalExpenses = result[0].total_expenses || 0;
    const netProfit = totalIncome - totalExpenses;

    // Update or insert summary
    await connection.query(`
      INSERT INTO daily_summary (summary_date, total_income, total_expenses, net_profit)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        total_income = VALUES(total_income),
        total_expenses = VALUES(total_expenses),
        net_profit = VALUES(net_profit),
        updated_at = CURRENT_TIMESTAMP
    `, [summaryDate, totalIncome, totalExpenses, netProfit]);

    return { total_income: totalIncome, total_expenses: totalExpenses, net_profit: netProfit };
  } finally {
    connection.release();
  }
};

// Calculate monthly financial summary
const calculateMonthlySummary = async (year, month) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions 
      WHERE YEAR(transaction_date) = ? AND MONTH(transaction_date) = ?
    `, [year, month]);

    const totalIncome = result[0].total_income || 0;
    const totalExpenses = result[0].total_expenses || 0;
    const netProfit = totalIncome - totalExpenses;

    // Update or insert summary
    await connection.query(`
      INSERT INTO monthly_summary (year, month, total_income, total_expenses, net_profit)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        total_income = VALUES(total_income),
        total_expenses = VALUES(total_expenses),
        net_profit = VALUES(net_profit),
        updated_at = CURRENT_TIMESTAMP
    `, [year, month, totalIncome, totalExpenses, netProfit]);

    return { total_income: totalIncome, total_expenses: totalExpenses, net_profit: netProfit };
  } finally {
    connection.release();
  }
};

// Get financial overview
const getFinancialOverview = async (fromDate, toDate) => {
  const connection = await pool.getConnection();
  try {
    const [transactions] = await connection.query(`
      SELECT 
        transaction_type,
        COALESCE(SUM(amount), 0) as total
      FROM transactions 
      WHERE transaction_date BETWEEN ? AND ? AND status = 'completed'
      GROUP BY transaction_type
    `, [fromDate, toDate]);

    const overview = {
      total_income: 0,
      total_expenses: 0,
      net_profit: 0
    };

    transactions.forEach(t => {
      if (t.transaction_type === 'income') {
        overview.total_income = parseFloat(t.total);
      } else {
        overview.total_expenses = parseFloat(t.total);
      }
    });

    overview.net_profit = overview.total_income - overview.total_expenses;

    return overview;
  } finally {
    connection.release();
  }
};

module.exports = {
  generateInvoiceNumber,
  generateTransactionNumber,
  generatePaymentNumber,
  calculateInvoiceTotals,
  updatePaymentStatus,
  recordLedgerEntry,
  getCustomerBalance,
  getVendorBalance,
  calculateDailySummary,
  calculateMonthlySummary,
  getFinancialOverview
};
