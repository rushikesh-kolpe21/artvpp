const pool = require('../config/dbBooks');
const {
  generateTransactionNumber,
  recordLedgerEntry,
  calculateDailySummary,
  calculateMonthlySummary
} = require('../utils/booksUtils');

// Create income transaction
const createIncomeTransaction = async (req, res) => {
  const { amount, category, subcategory, paymentMethod, description, customerId, invoiceId, referenceNumber } = req.body;
  const userId = req.user?.id;

  if (!amount || !category) {
    return res.status(400).json({ error: 'Amount and category are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate transaction number
    const transactionNumber = await generateTransactionNumber();

    // Create transaction
    const [transResult] = await connection.query(
      `INSERT INTO transactions 
       (transaction_number, transaction_date, transaction_type, category, subcategory, amount, 
        payment_method, description, customer_id, invoice_id, reference_number, status, created_by)
       VALUES (?, CURDATE(), 'income', ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [
        transactionNumber,
        category,
        subcategory || '',
        amount,
        paymentMethod || 'bank_transfer',
        description || '',
        customerId || null,
        invoiceId || null,
        referenceNumber || '',
        userId
      ]
    );

    const transactionId = transResult.insertId;

    // Record ledger entries (double-entry bookkeeping)
    // Debit: Bank/Cash Account, Credit: Revenue Account
    await recordLedgerEntry(transactionId, 'Bank Account', amount, 0, new Date().toISOString().split('T')[0]);
    await recordLedgerEntry(transactionId, `Revenue - ${category}`, 0, amount, new Date().toISOString().split('T')[0]);

    // Update daily summary
    const date = new Date().toISOString().split('T')[0];
    await calculateDailySummary(date);

    // Update monthly summary
    const now = new Date();
    await calculateMonthlySummary(now.getFullYear(), now.getMonth() + 1);

    await connection.commit();

    res.status(201).json({
      message: 'Income transaction created successfully',
      transactionId,
      transactionNumber,
      amount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating income transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  } finally {
    connection.release();
  }
};

// Create expense transaction
const createExpenseTransaction = async (req, res) => {
  const { amount, category, subcategory, paymentMethod, description, vendorId, invoiceId, referenceNumber } = req.body;
  const userId = req.user?.id;

  if (!amount || !category) {
    return res.status(400).json({ error: 'Amount and category are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate transaction number
    const transactionNumber = await generateTransactionNumber();

    // Create transaction
    const [transResult] = await connection.query(
      `INSERT INTO transactions 
       (transaction_number, transaction_date, transaction_type, category, subcategory, amount, 
        payment_method, description, vendor_id, invoice_id, reference_number, status, created_by)
       VALUES (?, CURDATE(), 'expense', ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
      [
        transactionNumber,
        category,
        subcategory || '',
        amount,
        paymentMethod || 'bank_transfer',
        description || '',
        vendorId || null,
        invoiceId || null,
        referenceNumber || '',
        userId
      ]
    );

    const transactionId = transResult.insertId;

    // Record ledger entries (double-entry bookkeeping)
    // Debit: Expense Account, Credit: Bank/Cash Account
    await recordLedgerEntry(transactionId, `Expense - ${category}`, amount, 0, new Date().toISOString().split('T')[0]);
    await recordLedgerEntry(transactionId, 'Bank Account', 0, amount, new Date().toISOString().split('T')[0]);

    // Update daily summary
    const date = new Date().toISOString().split('T')[0];
    await calculateDailySummary(date);

    // Update monthly summary
    const now = new Date();
    await calculateMonthlySummary(now.getFullYear(), now.getMonth() + 1);

    await connection.commit();

    res.status(201).json({
      message: 'Expense transaction created successfully',
      transactionId,
      transactionNumber,
      amount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating expense transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  } finally {
    connection.release();
  }
};

// Get single transaction
const getTransaction = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [transactions] = await connection.query(
      `SELECT t.*, c.name as customer_name, v.name as vendor_name
       FROM transactions t
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN vendors v ON t.vendor_id = v.id
       WHERE t.id = ?`,
      [id]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction: transactions[0] });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  } finally {
    connection.release();
  }
};

// List transactions with filters
const listTransactions = async (req, res) => {
  const { transactionType, category, fromDate, toDate, status, limit = 50, offset = 0 } = req.query;

  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT t.*, c.name as customer_name, v.name as vendor_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN vendors v ON t.vendor_id = v.id
      WHERE 1=1
    `;

    const params = [];

    if (transactionType) {
      query += ' AND t.transaction_type = ?';
      params.push(transactionType);
    }

    if (category) {
      query += ' AND t.category = ?';
      params.push(category);
    }

    if (fromDate && toDate) {
      query += ' AND t.transaction_date BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [transactions] = await connection.query(query, params);

    res.json({ transactions });
  } catch (error) {
    console.error('Error listing transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  } finally {
    connection.release();
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, category, subcategory, paymentMethod, description, referenceNumber, status } = req.body;

  const connection = await pool.getConnection();
  try {
    // Verify transaction exists
    const [transactions] = await connection.query('SELECT * FROM transactions WHERE id = ?', [id]);
    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Prevent updating completed transactions for compliance
    if (transactions[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot modify completed transactions. Consider creating a reversal entry.' });
    }

    await connection.query(
      `UPDATE transactions SET amount = ?, category = ?, subcategory = ?, payment_method = ?, 
       description = ?, reference_number = ?, status = ? WHERE id = ?`,
      [amount, category, subcategory || '', paymentMethod, description || '', referenceNumber || '', status || 'pending', id]
    );

    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  } finally {
    connection.release();
  }
};

// Delete transaction (only pending ones)
const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [transactions] = await connection.query('SELECT status FROM transactions WHERE id = ?', [id]);

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transactions[0].status !== 'pending') {
      return res.status(400).json({ error: 'Can only delete pending transactions' });
    }

    await connection.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  } finally {
    connection.release();
  }
};

module.exports = {
  createIncomeTransaction,
  createExpenseTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction
};
