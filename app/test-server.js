// Simple test server to debug issues
const express = require("express");
const path = require("path");
const session = require("express-session");

// Create express app
const app = express();

// Use the Pug templating engine
app.set('view engine', 'pug');

// Set views directory with absolute path
const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
console.log("Views directory set to:", viewsPath);

// Session middleware
app.use(session({
  secret: 'foodwaste-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Middleware to make session available to all templates
app.use((req, res, next) => {
  // Create a mock user for testing
  req.session.user = {
    id: 999,
    name: 'Test User',
    email: 'test@example.com',
    isLoggedIn: true,
    points: 750,
    level: {
      name: 'Silver',
      minPoints: 500,
      progressPercentage: 65,
      pointsToNextLevel: 250
    },
    badges: [
      { name: 'Early Adopter', icon: 'seedling', color: 'success' },
      { name: 'Food Saver', icon: 'apple-alt', color: 'danger' }
    ],
    stats: {
      coordinates: {
        lat: 51.5074,
        lon: -0.1278
      },
      itemsShared: 12,
      itemsReceived: 8,
      wastePreventedKg: 25
    },
    dietaryPreferences: ['vegetarian', 'organic'],
    categoryPreferences: ['vegetables', 'fruits', 'baked goods'],
    unreadMessages: 2
  };
  
  // Make user available to all templates
  res.locals.user = req.session.user;
  next();
});

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Sample food listings data
const foodListings = [
  {
    id: 1,
    title: 'Fresh Apples',
    category: 'Fruits',
    description: '5 apples available, picked yesterday. Must go today!',
    quantity: 5,
    unit: 'pieces',
    expiryDate: '2025-04-04',
    location: 'North London',
    distance: 2,
    provider: 'John Doe',
    postedDate: '2025-04-02',
    condition: 'Excellent',
    imageUrl: 'https://images.unsplash.com/photo-1576021182211-9ea8dced3690',
    coordinates: {
      lat: 51.5274,
      lon: -0.1378
    },
    providerRating: 4.8,
    matchScore: 95
  },
  {
    id: 2,
    title: 'Homemade Bread',
    category: 'Baked Goods',
    description: '2 loaves of sourdough bread, baked this morning.',
    quantity: 2,
    unit: 'loaves',
    expiryDate: '2025-04-05',
    location: 'East London',
    distance: 1.5,
    provider: 'Jane Smith',
    postedDate: '2025-04-03',
    condition: 'Fresh',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
    coordinates: {
      lat: 51.5174,
      lon: -0.1178
    },
    providerRating: 4.5,
    matchScore: 85
  },
  {
    id: 3,
    title: 'Garden Vegetables',
    category: 'Vegetables',
    description: 'Assorted vegetables from my garden - tomatoes, cucumbers, and more.',
    quantity: 10,
    unit: 'pieces',
    expiryDate: '2025-04-07',
    location: 'South London',
    distance: 3,
    provider: 'Sarah Johnson',
    postedDate: '2025-04-03',
    condition: 'Fresh',
    imageUrl: 'https://images.unsplash.com/photo-1563699182-58875fcdd4e3',
    coordinates: {
      lat: 51.4974,
      lon: -0.1378
    },
    providerRating: 4.2,
    matchScore: 78
  }
];

// Sample conversations data
const conversations = [
  {
    id: 'conv-1',
    otherParticipant: {
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    lastMessagePreview: 'Are the apples still available?',
    unreadCount: 1,
    timestamp: '2025-04-03T15:45:00Z'
  },
  {
    id: 'conv-2',
    otherParticipant: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
    lastMessagePreview: 'Thanks for the vegetables!',
    unreadCount: 0,
    timestamp: '2025-04-02T10:30:00Z'
  }
];

// Sample messages
const messages = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    sender: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    content: 'Hi there! Are the apples still available?',
    timestamp: '2025-04-03T15:30:00Z',
    status: 'delivered'
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    sender: {
      id: 999,
      name: 'Test User',
      avatar: null
    },
    content: 'Yes, they are! When would you like to pick them up?',
    timestamp: '2025-04-03T15:35:00Z',
    status: 'read'
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    sender: {
      id: 1,
      name: 'John Doe',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    content: 'Great! Could I come by around 5pm today?',
    timestamp: '2025-04-03T15:45:00Z',
    status: 'delivered'
  }
];

// Simple home route
app.get("/", (req, res) => {
    res.render("index", { title: "Minimise Food Waste - Home" });
});

// Recommendations route
app.get("/recommendations", (req, res) => {
    try {
        // Mock data for rendering
        const weatherData = {
            condition: 'Partly Cloudy',
            temperature: '18°C',
            icon: 'fas fa-cloud-sun',
            suggestedTimeSlots: [
                { label: 'Afternoon (12pm - 5pm)', score: 5 },
                { label: 'Evening (5pm - 9pm)', score: 4 },
                { label: 'Morning (8am - 12pm)', score: 3 }
            ]
        };
        
        res.render("recommendations", {
            title: "Recommendations - Test",
            user: req.session.user,
            personalizedRecommendations: foodListings,
            collaborativeRecommendations: foodListings.slice(0, 2),
            nearbyListings: foodListings,
            weather: weatherData
        });
    } catch (error) {
        console.error('Recommendations route error:', error);
        res.status(500).send('An error occurred: ' + error.message);
    }
});

// Messages route
app.get("/messages", (req, res) => {
    try {
        // Mock data for rendering
        const messageStats = {
            totalMessages: 15,
            unreadMessages: 2,
            activeConversations: 2,
            averageResponseTime: '30',
            totalConversations: 2,
            responseRate: 85
        };
        
        // Mock users for the new message modal
        const users = [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' },
            { id: 3, name: 'Sarah Johnson' }
        ];
        
        res.render("messages", {
            title: "Messages - Minimise Food Waste",
            user: req.session.user,
            currentUser: req.session.user,
            conversations: conversations,
            stats: messageStats,
            users: users,
            foodListings: foodListings
        });
    } catch (error) {
        console.error('Messages route error:', error);
        res.status(500).send('An error occurred: ' + error.message);
    }
});

// Individual conversation route
app.get("/messages/:conversationId", (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const conversation = conversations.find(c => c.id === conversationId);
        
        if (!conversation) {
            return res.status(404).send('Conversation not found');
        }
        
        const conversationMessages = messages.filter(m => m.conversationId === conversationId);
        
        res.render("conversation", {
            title: `Conversation with ${conversation.otherParticipant.name} - Minimise Food Waste`,
            user: req.session.user,
            conversation: conversation,
            messages: conversationMessages,
            otherUser: conversation.otherParticipant
        });
    } catch (error) {
        console.error('Conversation route error:', error);
        res.status(500).send('An error occurred: ' + error.message);
    }
});

// Start server on port 3001 (different from main app)
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running at http://127.0.0.1:${PORT}/`);
});
