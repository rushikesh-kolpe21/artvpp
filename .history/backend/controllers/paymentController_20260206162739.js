const pool = require('../config/dbBooks');
const {
  generatePaymentNumber,
  updatePaymentStatus,
  recordLedgerEntry
} = require('../utils/booksUtils');

// Record payment for an invoice
const recordPayment = async (req, res) => {
  const { invoiceId, amount, paymentMethod, referenceNumber, notes } = req.body;
  const userId = req.user?.id;

  if (!invoiceId || !amount) {
    return res.status(400).json({ error: 'Invoice ID and amount are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get invoice details
    const [invoices] = await connection.query(
      'SELECT * FROM invoices WHERE id = ?',
      [invoiceId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoices[0];
    const newPaidAmount = (invoice.paid_amount || 0) + amount;

    // Validate payment amount
    if (newPaidAmount > invoice.total_amount) {
      return res.status(400).json({ error: 'Payment amount exceeds total invoice amount' });
    }

    // Generate payment number
    const paymentNumber = await generatePaymentNumber();

    // Record payment
    const [paymentResult] = await connection.query(
      `INSERT INTO payments (payment_number, invoice_id, payment_date, amount, payment_method, reference_number, notes, created_by)
       VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)`,
      [paymentNumber, invoiceId, amount, paymentMethod || 'bank_transfer', referenceNumber || '', notes || '', userId]
    );

    // Update invoice paid amount
    await connection.query(
      'UPDATE invoices SET paid_amount = paid_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [amount, invoiceId]
    );

    // Update payment status
    await updatePaymentStatus(invoiceId);

    // Record ledger entry
    const accountName = invoice.invoice_type === 'sales' ? 'Accounts Receivable' : 'Accounts Payable';
    await recordLedgerEntry(
      paymentResult.insertId,
      accountName,
      0,
      amount,
      new Date().toISOString().split('T')[0]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Payment recorded successfully',
      paymentNumber,
      paymentId: paymentResult.insertId,
      amount,
      totalPaidAmount: newPaidAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  } finally {
    connection.release();
  }
};

// Get payment details
const getPayment = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [payments] = await connection.query(
      `SELECT p.*, i.invoice_number, i.total_amount, c.name as customer_name, v.name as vendor_name
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN customers c ON i.customer_id = c.id
       LEFT JOIN vendors v ON i.vendor_id = v.id
       WHERE p.id = ?`,
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment: payments[0] });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  } finally {
    connection.release();
  }
};

// List payments for an invoice or all payments
const listPayments = async (req, res) => {
  const { invoiceId, fromDate, toDate, limit = 50, offset = 0 } = req.query;

  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT p.*, i.invoice_number, i.total_amount, c.name as customer_name, v.name as vendor_name
      FROM payments p
      LEFT JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN vendors v ON i.vendor_id = v.id
      WHERE 1=1
    `;

    const params = [];

    if (invoiceId) {
      query += ' AND p.invoice_id = ?';
      params.push(invoiceId);
    }

    if (fromDate && toDate) {
      query += ' AND p.payment_date BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    }

    query += ' ORDER BY p.payment_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [payments] = await connection.query(query, params);

    res.json({ payments });
  } catch (error) {
    console.error('Error listing payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  } finally {
    connection.release();
  }
};

// Update payment
const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { amount, paymentMethod, referenceNumber, notes } = req.body;

  const connection = await pool.getConnection();
  try {
    // Get current payment
    const [payments] = await connection.query(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const oldPayment = payments[0];
    const difference = amount - oldPayment.amount;

    // Get invoice to validate new amount
    const [invoices] = await connection.query(
      'SELECT * FROM invoices WHERE id = ?',
      [oldPayment.invoice_id]
    );

    const invoice = invoices[0];
    const newPaidAmount = invoice.paid_amount + difference;

    if (newPaidAmount > invoice.total_amount) {
      return res.status(400).json({ error: 'Updated payment amount exceeds invoice total' });
    }

    // Update payment amount
    await connection.query(
      'UPDATE payments SET amount = ?, payment_method = ?, reference_number = ?, notes = ? WHERE id = ?',
      [amount, paymentMethod, referenceNumber || '', notes || '', id]
    );

    // Update invoice paid amount
    await connection.query(
      'UPDATE invoices SET paid_amount = ? WHERE id = ?',
      [newPaidAmount, oldPayment.invoice_id]
    );

    // Update payment status
    await updatePaymentStatus(oldPayment.invoice_id);

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  } finally {
    connection.release();
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [payments] = await connection.query(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = payments[0];

    // Update invoice paid amount
    await connection.query(
      'UPDATE invoices SET paid_amount = paid_amount - ? WHERE id = ?',
      [payment.amount, payment.invoice_id]
    );

    // Delete payment
    await connection.query('DELETE FROM payments WHERE id = ?', [id]);

    // Update payment status
    await updatePaymentStatus(payment.invoice_id);

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  } finally {
    connection.release();
  }
};

module.exports = {
  recordPayment,
  getPayment,
  listPayments,
  updatePayment,
  deletePayment
};
