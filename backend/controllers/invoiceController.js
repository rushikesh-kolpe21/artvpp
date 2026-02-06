const pool = require('../config/dbBooks');
const {
  generateInvoiceNumber,
  calculateInvoiceTotals,
  updatePaymentStatus,
  recordLedgerEntry
} = require('../utils/booksUtils');

// Create a new invoice
const createInvoice = async (req, res) => {
  const { invoiceType, customerId, vendorId, items, taxRate, discountAmount, dueDate, notes } = req.body;
  const userId = req.user?.id;

  if (!invoiceType || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invoice type and items are required' });
  }

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
        subtotal, tax_amount, tax_rate, discount_amount, total_amount, created_by)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoiceType,
        customerId || null,
        vendorId || null,
        subtotal,
        tax_amount,
        taxRate || 0,
        discountAmount || 0,
        total_amount,
        userId
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

    await connection.commit();

    res.status(201).json({
      message: 'Invoice created successfully',
      invoiceId,
      invoiceNumber,
      totalAmount: total_amount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  } finally {
    connection.release();
  }
};

// Get single invoice with items
const getInvoice = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [invoices] = await connection.query(
      `SELECT i.*, c.name as customer_name, c.email as customer_email, v.name as vendor_name, v.email as vendor_email
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       LEFT JOIN vendors v ON i.vendor_id = v.id
       WHERE i.id = ?`,
      [id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const [items] = await connection.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [id]
    );

    res.json({
      invoice: invoices[0],
      items
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  } finally {
    connection.release();
  }
};

// List all invoices with filters
const listInvoices = async (req, res) => {
  const { invoiceType, paymentStatus, customerId, vendorId, fromDate, toDate, limit, offset } = req.query;

  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT i.*, c.name as customer_name, v.name as vendor_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN vendors v ON i.vendor_id = v.id
      WHERE 1=1
    `;

    const params = [];

    if (invoiceType) {
      query += ' AND i.invoice_type = ?';
      params.push(invoiceType);
    }

    if (paymentStatus) {
      query += ' AND i.payment_status = ?';
      params.push(paymentStatus);
    }

    if (customerId) {
      query += ' AND i.customer_id = ?';
      params.push(customerId);
    }

    if (vendorId) {
      query += ' AND i.vendor_id = ?';
      params.push(vendorId);
    }

    if (fromDate && toDate) {
      query += ' AND i.invoice_date BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    }

    query += ' ORDER BY i.invoice_date DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }

    const [invoices] = await connection.query(query, params);

    res.json({ invoices });
  } catch (error) {
    console.error('Error listing invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  } finally {
    connection.release();
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { items, taxRate, discountAmount, dueDate, notes } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verify invoice exists
    const [invoices] = await connection.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Prevent updating paid invoices
    if (invoices[0].payment_status === 'paid') {
      return res.status(400).json({ error: 'Cannot update a paid invoice' });
    }

    // Calculate new totals
    const { subtotal, tax_amount, total_amount } = calculateInvoiceTotals(items, taxRate, discountAmount);

    // Update invoice
    await connection.query(
      `UPDATE invoices SET subtotal = ?, tax_amount = ?, tax_rate = ?, discount_amount = ?, 
       total_amount = ?, due_date = ?, notes = ? WHERE id = ?`,
      [subtotal, tax_amount, taxRate || 0, discountAmount || 0, total_amount, dueDate, notes || '', id]
    );

    // Delete old items
    await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

    // Insert new items
    for (const item of items) {
      const itemAmount = item.quantity * item.unit_price;
      const itemTax = item.tax_rate ? itemAmount * (item.tax_rate / 100) : 0;

      await connection.query(
        `INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, amount, tax_rate, tax_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, item.name, item.description || '', item.quantity, item.unit_price, itemAmount, item.tax_rate || 0, itemTax]
      );
    }

    await connection.commit();
    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  } finally {
    connection.release();
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [invoices] = await connection.query('SELECT payment_status FROM invoices WHERE id = ?', [id]);

    if (invoices.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoices[0].payment_status !== 'unpaid') {
      return res.status(400).json({ error: 'Can only delete unpaid invoices' });
    }

    await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    await connection.query('DELETE FROM invoices WHERE id = ?', [id]);

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  } finally {
    connection.release();
  }
};

module.exports = {
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice
};
