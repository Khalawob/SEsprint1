// Simple test server with minimal dependencies
const express = require("express");
const path = require("path");

// Create express app
const app = express();

// Use the Pug templating engine
app.set('view engine', 'pug');

// Set views directory with absolute path
const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
console.log("Views directory set to:", viewsPath);

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Mock user data
const user = {
  id: 999,
  name: 'Test User',
  email: 'test@example.com',
  isLoggedIn: true,
  points: 750,
  unreadMessages: 2
};

// Simple home route
app.get("/", (req, res) => {
  res.render("index", { 
    title: "Minimise Food Waste - Home",
    user: user
  });
});

// Simple recommendations route
app.get("/recommendations", (req, res) => {
  res.render("recommendations", {
    title: "Recommendations - Minimise Food Waste",
    user: user,
    personalizedRecommendations: [],
    collaborativeRecommendations: [],
    nearbyListings: [],
    weather: {
      temperature: '18',
      condition: 'Sunny'
    }
  });
});

// Simple messages route
app.get("/messages", (req, res) => {
  res.render("messages", {
    title: "Messages - Minimise Food Waste",
    user: user,
    currentUser: user,
    conversations: [],
    stats: {
      totalMessages: 0,
      unreadMessages: 0,
      totalConversations: 0,
      responseRate: 0,
      averageResponseTime: '0'
    },
    users: [],
    foodListings: []
  });
});

// Start server on port 3002
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Simple server running at http://localhost:${PORT}/`);
});
