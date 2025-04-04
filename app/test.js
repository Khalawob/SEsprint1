const express = require('express');
const path = require('path');

const app = express();

// Simple test route
app.get('/', (req, res) => {
  res.send('Hello World! Test server is working.');
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
});
