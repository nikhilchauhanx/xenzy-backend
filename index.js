// 1. Import the express and cors libraries
const express = require('express');
const cors = require('cors'); // <-- Import cors

// 2. Create an instance of an express application
const app = express();

// 3. Use the cors middleware
// This will allow your frontend on localhost:3000 to make requests to this backend
app.use(cors()); // <-- Use cors

// 4. Define the port the server will run on
const PORT = 3001; // IMPORTANT: We'll use 3001 to avoid conflict with the frontend on 3000

// This is the mock product data, just like on our frontend.
// Later, this will come from a real database.
const mockProducts = [
  { id: 1, name: 'My Awesome Trench Coat', seller: '@timeless_threads', price: 999.00, imageUrl: 'https://placehold.co/400x500/B2AC88/FFFFFF?text=Item+5' },
  { id: 2, name: 'Vintage Silk Scarf', seller: '@vintagesoul', price: 18.00, imageUrl: 'https://placehold.co/400x500/E07A5F/FFFFFF?text=Item+6' },
  { id: 3, name: '80s Windbreaker Jacket', seller: '@retrorewind', price: 75.00, imageUrl: 'https://placehold.co/400x500/B2AC88/FFFFFF?text=Item+7' },
  { id: 4, name: 'Leather Ankle Boots', seller: '@stylehunter', price: 88.00, imageUrl: 'https://placehold.co/400x500/E07A5F/FFFFFF?text=Item+8' },
  { id: 5, name: 'Denim Overall Dress', seller: '@denimdreams', price: 45.00, imageUrl: 'https://placehold.co/400x500/B2AC88/FFFFFF?text=Item+9' },
  { id: 6, name: 'Knit Cardigan', seller: '@cozycorner', price: 32.00, imageUrl: 'https://placehold.co/400x500/E07A5F/FFFFFF?text=Item+10' },
];


// 5. Define our first API route to get all products
app.get('/api/products', (req, res) => {
  // res.json() automatically sends data in the correct JSON format
  res.json(mockProducts);
});

// 6. Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
