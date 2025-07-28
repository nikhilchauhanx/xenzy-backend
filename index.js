// 1. Import all necessary packages
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- Middleware to verify JWT ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 2. Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 3. Express App
const app = express();

// 4. Middleware
app.use(cors());
app.use(express.json());

// 5. Port
const PORT = 3001;

// --- API ROUTES ---

// GET all products (Public)
app.get('/api/products', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, name, seller, price, "imageUrl", user_id, created_at FROM products');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error('Error fetching products:', err.stack);
    res.status(500).json({ message: 'Error fetching data from the database' });
  }
});

// --- NEW ENDPOINT ---
// GET a single product by its ID (Public)
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params; // Get the ID from the URL parameter

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(result.rows[0]); // Send back the single product found
  } catch (err) {
    console.error(`Error fetching product with id ${id}:`, err.stack);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});


// POST a new product (Protected)
app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, seller, price, imageUrl } = req.body;
  const userId = req.user.userId;
  if (!name || !price || !imageUrl) {
    return res.status(400).json({ message: 'Name, price, and imageUrl are required.' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO products (name, seller, price, "imageUrl", user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, seller, price, imageUrl, userId]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err.stack);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

// GET products for the currently logged-in user (Protected)
app.get('/api/my-products', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products WHERE user_id = $1', [userId]);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user products:', err.stack);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});


// --- AUTH ROUTES ---
// ... (Auth routes are unchanged)
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Error during registration:', err.stack);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );
    res.json({ token, message: 'Login successful!' });
  } catch (err) {
    console.error('Error during login:', err.stack);
    res.status(500).json({ message: 'An error occurred on the server.' });
  }
});


// 6. Start the server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
