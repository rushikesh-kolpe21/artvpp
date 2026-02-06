const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import routes
const booksRoutes = require('./routes/booksRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ArtVpp Backend' });
});

// Books Services API Routes
app.use('/api/books', booksRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ Books Services API available at http://localhost:${PORT}/api/books`);
});
