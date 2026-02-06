const pool = require('../config/dbBooks');
const { getCustomerBalance, getVendorBalance } = require('../utils/booksUtils');

// ===== CUSTOMER OPERATIONS =====

// Create customer
const createCustomer = async (req, res) => {
  const { name, email, phone, address, city, state, pincode, gstNumber, panNumber, creditLimit } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `INSERT INTO customers (name, email, phone, address, city, state, pincode, gst_number, pan_number, credit_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email || '', phone || '', address || '', city || '', state || '', pincode || '', gstNumber || '', panNumber || '', creditLimit || 0]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      customerId: result.insertId,
      name
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  } finally {
    connection.release();
  }
};

// Get customer details
const getCustomer = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [customers] = await connection.query('SELECT * FROM customers WHERE id = ?', [id]);

    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const balance = await getCustomerBalance(id);

    res.json({
      customer: customers[0],
      balance
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  } finally {
    connection.release();
  }
};

// List customers
const listCustomers = async (req, res) => {
  const { isActive = true, limit = 50, offset = 0 } = req.query;

  const connection = await pool.getConnection();
  try {
    const [customers] = await connection.query(
      `SELECT * FROM customers WHERE is_active = ? ORDER BY name ASC LIMIT ? OFFSET ?`,
      [isActive === 'true' || isActive === true, parseInt(limit), parseInt(offset)]
    );

    res.json({ customers });
  } catch (error) {
    console.error('Error listing customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  } finally {
    connection.release();
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, city, state, pincode, gstNumber, panNumber, creditLimit } = req.body;

  const connection = await pool.getConnection();
  try {
    const [customers] = await connection.query('SELECT * FROM customers WHERE id = ?', [id]);

    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await connection.query(
      `UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, 
       gst_number = ?, pan_number = ?, credit_limit = ? WHERE id = ?`,
      [name, email || '', phone || '', address || '', city || '', state || '', pincode || '', gstNumber || '', panNumber || '', creditLimit || 0, id]
    );

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  } finally {
    connection.release();
  }
};

// Toggle customer active status
const toggleCustomerStatus = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [customers] = await connection.query('SELECT is_active FROM customers WHERE id = ?', [id]);

    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const newStatus = !customers[0].is_active;
    await connection.query('UPDATE customers SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({ message: 'Customer status updated', isActive: newStatus });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ error: 'Failed to update customer status' });
  } finally {
    connection.release();
  }
};

// ===== VENDOR OPERATIONS =====

// Create vendor
const createVendor = async (req, res) => {
  const { name, email, phone, address, city, state, pincode, gstNumber, panNumber, bankAccount, ifscCode } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Vendor name is required' });
  }

  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `INSERT INTO vendors (name, email, phone, address, city, state, pincode, gst_number, pan_number, bank_account, ifsc_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email || '', phone || '', address || '', city || '', state || '', pincode || '', gstNumber || '', panNumber || '', bankAccount || '', ifscCode || '']
    );

    res.status(201).json({
      message: 'Vendor created successfully',
      vendorId: result.insertId,
      name
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  } finally {
    connection.release();
  }
};

// Get vendor details
const getVendor = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [vendors] = await connection.query('SELECT * FROM vendors WHERE id = ?', [id]);

    if (vendors.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const balance = await getVendorBalance(id);

    res.json({
      vendor: vendors[0],
      balance
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  } finally {
    connection.release();
  }
};

// List vendors
const listVendors = async (req, res) => {
  const { isActive = true, limit = 50, offset = 0 } = req.query;

  const connection = await pool.getConnection();
  try {
    const [vendors] = await connection.query(
      `SELECT * FROM vendors WHERE is_active = ? ORDER BY name ASC LIMIT ? OFFSET ?`,
      [isActive === 'true' || isActive === true, parseInt(limit), parseInt(offset)]
    );

    res.json({ vendors });
  } catch (error) {
    console.error('Error listing vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  } finally {
    connection.release();
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, city, state, pincode, gstNumber, panNumber, bankAccount, ifscCode } = req.body;

  const connection = await pool.getConnection();
  try {
    const [vendors] = await connection.query('SELECT * FROM vendors WHERE id = ?', [id]);

    if (vendors.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    await connection.query(
      `UPDATE vendors SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, 
       gst_number = ?, pan_number = ?, bank_account = ?, ifsc_code = ? WHERE id = ?`,
      [name, email || '', phone || '', address || '', city || '', state || '', pincode || '', gstNumber || '', panNumber || '', bankAccount || '', ifscCode || '', id]
    );

    res.json({ message: 'Vendor updated successfully' });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  } finally {
    connection.release();
  }
};

// Toggle vendor active status
const toggleVendorStatus = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [vendors] = await connection.query('SELECT is_active FROM vendors WHERE id = ?', [id]);

    if (vendors.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const newStatus = !vendors[0].is_active;
    await connection.query('UPDATE vendors SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({ message: 'Vendor status updated', isActive: newStatus });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({ error: 'Failed to update vendor status' });
  } finally {
    connection.release();
  }
};

module.exports = {
  // Customers
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
  toggleCustomerStatus,
  // Vendors
  createVendor,
  getVendor,
  listVendors,
  updateVendor,
  toggleVendorStatus
};
