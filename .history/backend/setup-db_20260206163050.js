#!/usr/bin/env node

/**
 * Database Setup Script for Books Services
 * Run: node setup-db.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'artvpp_books';

async function setupDatabase() {
  let connection;
  try {
    console.log('\n📚 Books Services Database Setup\n');
    console.log('Configuration:');
    console.log(`  Host: ${DB_HOST}`);
    console.log(`  User: ${DB_USER}`);
    console.log(`  Database: ${DB_NAME}\n`);

    // Connect to MySQL (without database)
    console.log('1️⃣  Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });
    console.log('   ✓ Connected\n');

    // Create database
    console.log('2️⃣  Creating database...');
    try {
      await connection.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      console.log(`   ✓ Dropped existing database (if exists)`);
    } catch (e) {
      // Ignore if database didn't exist
    }

    await connection.query(
      `CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`   ✓ Created database: ${DB_NAME}\n`);

    // Switch to new database
    await connection.query(`USE ${DB_NAME}`);

    // Read schema
    console.log('3️⃣  Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    console.log('   ✓ Schema file read\n');

    // Execute schema
    console.log('4️⃣  Creating tables...');
    
    // Split by semicolon and filter empty statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    let tableCount = 0;
    for (const statement of statements) {
      try {
        await connection.query(statement);
        if (statement.includes('CREATE TABLE')) {
          tableCount++;
        }
      } catch (error) {
        console.error(`   ✗ Error executing statement: ${error.message}`);
        throw error;
      }
    }
    console.log(`   ✓ Created ${tableCount} tables\n`);

    // Seed initial data
    console.log('5️⃣  Seeding initial data...');
    await seedInitialData(connection);
    console.log('   ✓ Initial data added\n');

    // Verify tables
    console.log('6️⃣  Verifying setup...');
    const [tables] = await connection.query(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?`,
      [DB_NAME]
    );
    console.log(`   ✓ ${tables[0].count} tables created\n`);

    console.log('✅ Setup completed successfully!\n');
    console.log('📝 Next steps:');
    console.log(`   1. Configure your .env file with DB credentials`);
    console.log(`   2. Run: npm run dev`);
    console.log(`   3. Test: curl http://localhost:5000/api/books/health`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Setup failed!\n');
    console.error(`Error: ${error.message}\n`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your MySQL credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function seedInitialData(connection) {
  try {
    // Insert default financial configuration
    await connection.query(`
      INSERT INTO financial_config (config_key, config_value, data_type, description)
      VALUES
        ('default_tax_rate', '18', 'number', 'Default GST/Tax rate percentage'),
        ('business_name', 'ArtVpp', 'string', 'Business name'),
        ('currency', 'INR', 'string', 'Currency code'),
        ('fiscal_year_starts', '04-01', 'date', 'Fiscal year start date'),
        ('invoice_prefix_sales', 'INV', 'string', 'Sales invoice prefix'),
        ('invoice_prefix_purchase', 'PUR', 'string', 'Purchase invoice prefix'),
        ('enable_tax_calculation', 'true', 'boolean', 'Enable automatic tax calculation'),
        ('tax_rounding', '2', 'number', 'Decimal places for tax'),
        ('auto_generate_invoice_number', 'true', 'boolean', 'Auto-generate invoice numbers');
    `);

    // Insert sample expense categories
    const [result] = await connection.query(`
      SELECT COUNT(*) as count FROM financial_config WHERE config_key LIKE 'category_%'
    `);

    if (result[0].count === 0) {
      // Expense categories
      const expenseCategories = [
        'Materials & Supplies',
        'Staff Salaries',
        'Utilities',
        'Office Rent',
        'Marketing',
        'Technology',
        'Professional Fees',
        'Office Equipment',
        'Shipping & Logistics',
        'Insurance'
      ];

      for (let i = 0; i < expenseCategories.length; i++) {
        await connection.query(`
          INSERT INTO financial_config (config_key, config_value, data_type)
          VALUES (?, ?, 'string')
        `, [`expense_category_${i + 1}`, expenseCategories[i]]);
      }
    }
  } catch (error) {
    // Ignore seeding errors, as it's optional
    console.log('   ℹ  Basic configuration added (some may already exist)');
  }
}

// Run setup
setupDatabase();
