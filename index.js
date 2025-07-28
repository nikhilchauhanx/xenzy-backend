// 1. Import the express library
const express = require('express');

// 2. Create an instance of an express application
const app = express();

// 3. Define the port the server will run on
const PORT = 3000;

// 4. Define a basic route for the homepage
app.get('/', (req, res) => {
  res.send('Welcome to the Xenzy Backend!');
});

// 5. Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});