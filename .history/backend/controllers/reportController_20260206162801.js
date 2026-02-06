const pool = require('../config/dbBooks');
const {
  getFinancialOverview,
  getCustomerBalance,
  getVendorBalance
} = require('../utils/booksUtils');

// Get financial dashboard
const getFinancialDashboard = async (req, res) => {
  const { period = 'monthly' } = req.query;

  const connection = await pool.getConnection();
  try {
    let dateQuery = '';
    let labelFormat = '';

    if (period === 'daily') {
      dateQuery = `DATE(t.transaction_date) as date_label`;
      labelFormat = 'daily';
    } else if (period === 'monthly') {
      dateQuery = `DATE_FORMAT(t.transaction_date, '%Y-%m') as date_label`;
      labelFormat = 'monthly';
    } else {
      dateQuery = `YEAR(t.transaction_date) as date_label`;
      labelFormat = 'yearly';
    }

    // Get income data
    const [incomeData] = await connection.query(`
      SELECT 
        ${dateQuery},
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income
      FROM transactions
      WHERE transaction_type = 'income' AND status = 'completed'
      GROUP BY date_label
      ORDER BY date_label DESC
      LIMIT 12
    `);

    // Get expense data
    const [expenseData] = await connection.query(`
      SELECT 
        ${dateQuery},
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions
      WHERE transaction_type = 'expense' AND status = 'completed'
      GROUP BY date_label
      ORDER BY date_label DESC
      LIMIT 12
    `);

    // Get expense breakdown by category
    const [expenseByCategory] = await connection.query(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE transaction_type = 'expense' AND status = 'completed'
      AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY category
      ORDER BY total DESC
    `);

    // Get income breakdown by category
    const [incomeByCategory] = await connection.query(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE transaction_type = 'income' AND status = 'completed'
      AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY category
      ORDER BY total DESC
    `);

    // Get overall summary
    const [summary] = await connection.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions
      WHERE status = 'completed'
    `);

    const overallSummary = summary[0];
    overallSummary.net_profit = overallSummary.total_income - overallSummary.total_expenses;

    res.json({
      period,
      incomeData,
      expenseData,
      expenseByCategory,
      incomeByCategory,
      summary: overallSummary
    });
  } catch (error) {
    console.error('Error fetching financial dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  } finally {
    connection.release();
  }
};

// Get profit and loss statement
const getProfitLossStatement = async (req, res) => {
  const { fromDate, toDate } = req.query;

  if (!fromDate || !toDate) {
    return res.status(400).json({ error: 'From date and to date are required' });
  }

  const connection = await pool.getConnection();
  try {
    // Get revenue
    const [revenue] = await connection.query(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE transaction_type = 'income' AND status = 'completed'
      AND transaction_date BETWEEN ? AND ?
      GROUP BY category
    `, [fromDate, toDate]);

    // Get expenses
    const [expenses] = await connection.query(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE transaction_type = 'expense' AND status = 'completed'
      AND transaction_date BETWEEN ? AND ?
      GROUP BY category
    `, [fromDate, toDate]);

    // Calculate totals
    const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    const netProfit = totalRevenue - totalExpenses;

    res.json({
      period: {
        from_date: fromDate,
        to_date: toDate
      },
      revenue: {
        by_category: revenue,
        total: totalRevenue
      },
      expenses: {
        by_category: expenses,
        total: totalExpenses
      },
      net_profit: netProfit,
      profit_margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) + '%' : '0%'
    });
  } catch (error) {
    console.error('Error fetching P&L statement:', error);
    res.status(500).json({ error: 'Failed to fetch P&L statement' });
  } finally {
    connection.release();
  }
};

// Get customer ledger
const getCustomerLedger = async (req, res) => {
  const { customerId } = req.params;

  const connection = await pool.getConnection();
  try {
    // Check if customer exists
    const [customers] = await connection.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer balance
    const balance = await getCustomerBalance(customerId);

    // Get all transactions
    const [transactions] = await connection.query(`
      SELECT i.*, p.payment_number, COALESCE(SUM(pay.amount), 0) as total_paid
      FROM invoices i
      LEFT JOIN payments p ON i.id = p.invoice_id
      LEFT JOIN payments pay ON i.id = pay.invoice_id
      WHERE i.customer_id = ? AND i.invoice_type = 'sales'
      GROUP BY i.id
      ORDER BY i.invoice_date DESC
    `, [customerId]);

    res.json({
      customer: customers[0],
      balance,
      transactions
    });
  } catch (error) {
    console.error('Error fetching customer ledger:', error);
    res.status(500).json({ error: 'Failed to fetch customer ledger' });
  } finally {
    connection.release();
  }
};

// Get vendor ledger
const getVendorLedger = async (req, res) => {
  const { vendorId } = req.params;

  const connection = await pool.getConnection();
  try {
    // Check if vendor exists
    const [vendors] = await connection.query('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    if (vendors.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get vendor balance
    const balance = await getVendorBalance(vendorId);

    // Get all transactions
    const [transactions] = await connection.query(`
      SELECT i.*, p.payment_number, COALESCE(SUM(pay.amount), 0) as total_paid
      FROM invoices i
      LEFT JOIN payments p ON i.id = p.invoice_id
      LEFT JOIN payments pay ON i.id = pay.invoice_id
      WHERE i.vendor_id = ? AND i.invoice_type = 'purchase'
      GROUP BY i.id
      ORDER BY i.invoice_date DESC
    `, [vendorId]);

    res.json({
      vendor: vendors[0],
      balance,
      transactions
    });
  } catch (error) {
    console.error('Error fetching vendor ledger:', error);
    res.status(500).json({ error: 'Failed to fetch vendor ledger' });
  } finally {
    connection.release();
  }
};

// Get sales report
const getSalesReport = async (req, res) => {
  const { fromDate, toDate } = req.query;

  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT 
        i.invoice_number,
        i.invoice_date,
        c.name as customer_name,
        i.total_amount,
        i.paid_amount,
        i.payment_status,
        COUNT(ii.id) as item_count
      FROM invoices i
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.invoice_type = 'sales'
    `;

    const params = [];

    if (fromDate && toDate) {
      query += ' AND i.invoice_date BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    }

    query += ' GROUP BY i.id ORDER BY i.invoice_date DESC';

    const [sales] = await connection.query(query, params);

    const summary = {
      total_sales: sales.reduce((sum, s) => sum + s.total_amount, 0),
      total_paid: sales.reduce((sum, s) => sum + s.paid_amount, 0),
      total_outstanding: 0,
      total_invoices: sales.length,
      paid_count: sales.filter(s => s.payment_status === 'paid').length,
      partial_count: sales.filter(s => s.payment_status === 'partial').length,
      unpaid_count: sales.filter(s => s.payment_status === 'unpaid').length
    };

    summary.total_outstanding = summary.total_sales - summary.total_paid;

    res.json({
      period: {
        from_date: fromDate || 'all_time',
        to_date: toDate || 'all_time'
      },
      sales,
      summary
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ error: 'Failed to fetch sales report' });
  } finally {
    connection.release();
  }
};

// Get expense report
const getExpenseReport = async (req, res) => {
  const { fromDate, toDate } = req.query;

  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT 
        t.transaction_number,
        t.transaction_date,
        t.category,
        t.subcategory,
        t.amount,
        v.name as vendor_name,
        t.payment_method,
        t.status,
        t.description
      FROM transactions t
      LEFT JOIN vendors v ON t.vendor_id = v.id
      WHERE t.transaction_type = 'expense'
    `;

    const params = [];

    if (fromDate && toDate) {
      query += ' AND t.transaction_date BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    }

    query += ' ORDER BY t.transaction_date DESC';

    const [expenses] = await connection.query(query, params);

    // Group by category
    const byCategory = {};
    expenses.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = { total: 0, count: 0, items: [] };
      }
      byCategory[exp.category].total += exp.amount;
      byCategory[exp.category].count += 1;
      byCategory[exp.category].items.push(exp);
    });

    const summary = {
      total_expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      total_transactions: expenses.length,
      by_category: byCategory,
      by_payment_method: expenses.reduce((acc, e) => {
        acc[e.payment_method] = (acc[e.payment_method] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      period: {
        from_date: fromDate || 'all_time',
        to_date: toDate || 'all_time'
      },
      expenses,
      summary
    });
  } catch (error) {
    console.error('Error fetching expense report:', error);
    res.status(500).json({ error: 'Failed to fetch expense report' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getFinancialDashboard,
  getProfitLossStatement,
  getCustomerLedger,
  getVendorLedger,
  getSalesReport,
  getExpenseReport
};
