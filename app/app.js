// Import express.js
const express = require("express");
const path = require("path");
const session = require("express-session");

// Import custom services
const recommendationService = require('./services/recommendationService');
const userPointsService = require('./services/userPointsService');
const messagingService = require('./services/messagingService');
const locationService = require('./services/locationService');

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
  res.locals.user = req.session.user;
  next();
});

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the static directory
app.use(express.static(path.join(__dirname, '../static')));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from node_modules
app.use('/node_modules', express.static('node_modules'));

// Simple in-memory user store for demonstration
const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',  // This is the correct email format
    password: 'password123',
    location: 'London'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password456',
    location: 'Manchester'
  }
];

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
    postedBy: 'John Doe',
    postedDate: '2025-04-02',
    condition: 'Excellent',
    allergens: 'None',
    dietaryInfo: 'Vegan, Gluten-Free',
    pickupTimes: 'Weekdays after 5pm, Weekends anytime',
    contactMethod: 'In-app messaging',
    imageUrl: '/images/apple.png',
    nutritionalValue: 'High in fiber and vitamin C',
    organic: true,
    verified: true
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
    postedBy: 'Jane Smith',
    postedDate: '2025-04-03',
    condition: 'Fresh',
    allergens: 'Gluten, may contain traces of nuts',
    dietaryInfo: 'Vegetarian',
    pickupTimes: 'Today until 8pm',
    contactMethod: 'In-app messaging or phone',
    imageUrl: '/images/bread.png',
    nutritionalValue: 'Good source of complex carbohydrates',
    organic: false,
    verified: true
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
    postedBy: 'Sarah Johnson',
    postedDate: '2025-04-03',
    condition: 'Fresh',
    allergens: 'None',
    dietaryInfo: 'Vegan, Gluten-Free, Organic',
    pickupTimes: 'Weekdays after 6pm',
    contactMethod: 'In-app messaging',
    imageUrl: '/images/vegetables.png',
    nutritionalValue: 'Rich in vitamins and minerals',
    organic: true,
    verified: true
  },
  {
    id: 4,
    title: 'Leftover Birthday Cake',
    category: 'Desserts',
    description: 'Half of a chocolate birthday cake from yesterday\'s party.',
    quantity: 1,
    unit: 'cake',
    expiryDate: '2025-04-05',
    location: 'West London',
    distance: 4.2,
    postedBy: 'Mike Brown',
    postedDate: '2025-04-02',
    condition: 'Good',
    allergens: 'Eggs, Dairy, Gluten, Nuts',
    dietaryInfo: 'Vegetarian',
    pickupTimes: 'Today or tomorrow, flexible times',
    contactMethod: 'In-app messaging',
    imageUrl: '/images/cake.png',
    nutritionalValue: 'High in calories and sugar',
    organic: false,
    verified: false
  },
  {
    id: 5,
    title: 'Organic Milk',
    category: 'Dairy',
    description: 'Unopened organic whole milk, 1 liter. Expiring soon.',
    quantity: 1,
    unit: 'liter',
    expiryDate: '2025-04-04',
    location: 'Central London',
    distance: 0.8,
    postedBy: 'Emma Wilson',
    postedDate: '2025-04-03',
    condition: 'Excellent',
    allergens: 'Dairy',
    dietaryInfo: 'Vegetarian',
    pickupTimes: 'Today only, between 2pm and 8pm',
    contactMethod: 'In-app messaging or phone',
    imageUrl: '/images/milk.png',
    nutritionalValue: 'Good source of calcium and protein',
    organic: true,
    verified: true
  },
  {
    id: 6,
    title: 'Pasta Sauce',
    category: 'Canned Goods',
    description: '3 jars of homemade tomato pasta sauce.',
    quantity: 3,
    unit: 'jars',
    expiryDate: '2025-04-20',
    location: 'North London',
    distance: 2.3,
    postedBy: 'David Garcia',
    postedDate: '2025-04-01',
    condition: 'Excellent',
    allergens: 'None',
    dietaryInfo: 'Vegan, Gluten-Free',
    pickupTimes: 'Weekends only',
    contactMethod: 'In-app messaging',
    imageUrl: '/images/sauce.png',
    nutritionalValue: 'Rich in lycopene and antioxidants',
    organic: true,
    verified: true
  },
  {
    id: 7,
    title: 'Rice and Beans',
    category: 'Cooked Meals',
    description: 'Homemade rice and beans, enough for 2-3 people.',
    quantity: 1,
    unit: 'container',
    expiryDate: '2025-04-04',
    location: 'East London',
    distance: 1.7,
    postedBy: 'Maria Lopez',
    postedDate: '2025-04-03',
    condition: 'Good',
    allergens: 'None',
    dietaryInfo: 'Vegan, Gluten-Free',
    pickupTimes: 'Today after 6pm',
    contactMethod: 'In-app messaging',
    imageUrl: '/images/rice.png',
    nutritionalValue: 'Good source of protein and fiber',
    organic: false,
    verified: false
  },
  {
    id: 8,
    title: 'Organic Bananas',
    category: 'Fruits',
    description: 'Bunch of organic bananas, slightly ripe.',
    quantity: 6,
    unit: 'pieces',
    expiryDate: '2025-04-06',
    location: 'South London',
    distance: 3.5,
    postedBy: 'Tom Wilson',
    postedDate: '2025-04-02',
    condition: 'Good',
    allergens: 'None',
    dietaryInfo: 'Vegan, Gluten-Free, Organic',
    pickupTimes: 'Flexible, contact to arrange',
    contactMethod: 'In-app messaging',
    imageUrl: '/images/banana.png',
    nutritionalValue: 'Rich in potassium and fiber',
    organic: true,
    verified: true
  }
];

// Sample conversations data for the messaging system
const conversations = [
  {
    id: 'conv-1-2',
    participants: [1, 2],
    title: 'Conversation between John and Jane',
    createdAt: '2025-04-01T10:30:00Z',
    updatedAt: '2025-04-03T15:45:00Z',
    lastMessagePreview: 'Thanks for the vegetables!',
    unreadCount: {
      1: 0,
      2: 1
    }
  }
];

// Sample messages data
const messages = [
  {
    id: 'msg-1',
    senderId: 1,
    recipientId: 2,
    conversationId: 'conv-1-2',
    content: 'Hi Jane, I noticed you have some vegetables available. Are they still available?',
    type: 'text',
    status: 'read',
    timestamp: '2025-04-01T10:30:00Z',
    readAt: '2025-04-01T10:35:00Z'
  },
  {
    id: 'msg-2',
    senderId: 2,
    recipientId: 1,
    conversationId: 'conv-1-2',
    content: 'Hi John! Yes, they are still available. When would you like to pick them up?',
    type: 'text',
    status: 'read',
    timestamp: '2025-04-01T10:35:00Z',
    readAt: '2025-04-01T10:40:00Z'
  },
  {
    id: 'msg-3',
    senderId: 1,
    recipientId: 2,
    conversationId: 'conv-1-2',
    content: 'Great! Would tomorrow around 5pm work for you?',
    type: 'text',
    status: 'read',
    timestamp: '2025-04-01T10:40:00Z',
    readAt: '2025-04-01T10:45:00Z'
  },
  {
    id: 'msg-4',
    senderId: 2,
    recipientId: 1,
    conversationId: 'conv-1-2',
    content: 'Perfect! Here\'s my address: 123 Green Street, London',
    type: 'text',
    status: 'read',
    timestamp: '2025-04-01T10:45:00Z',
    readAt: '2025-04-01T11:00:00Z'
  },
  {
    id: 'msg-5',
    senderId: 1,
    recipientId: 2,
    conversationId: 'conv-1-2',
    content: 'Got it, see you tomorrow!',
    type: 'text',
    status: 'read',
    timestamp: '2025-04-01T11:00:00Z',
    readAt: '2025-04-01T11:15:00Z'
  },
  {
    id: 'msg-6',
    senderId: 2,
    recipientId: 1,
    conversationId: 'conv-1-2',
    content: 'Thanks for picking up the vegetables! Hope you enjoy them.',
    type: 'text',
    status: 'delivered',
    timestamp: '2025-04-03T15:45:00Z'
  }
];

// Enhanced user data with points and stats
users.forEach(user => {
  user.points = Math.floor(Math.random() * 2000) + 500;
  user.stats = {
    itemsShared: Math.floor(Math.random() * 20) + 5,
    itemsReceived: Math.floor(Math.random() * 15) + 3,
    wastePreventedKg: Math.floor(Math.random() * 50) + 10,
    averageRating: (3.5 + Math.random() * 1.5).toFixed(1),
    totalRatings: Math.floor(Math.random() * 15) + 5,
    successfulCompletions: Math.floor(Math.random() * 15) + 5,
    activeWeeks: Math.floor(Math.random() * 10) + 2,
    uniqueConnections: Math.floor(Math.random() * 10) + 3,
    fiveStarRatings: Math.floor(Math.random() * 5) + 1,
    coordinates: {
      lat: 51.5074 + (Math.random() - 0.5) * 0.1,
      lon: -0.1278 + (Math.random() - 0.5) * 0.1
    }
  };
  user.badges = [];
  user.createdAt = '2025-03-01T00:00:00Z';
  user.emailVerified = true;
  user.phoneVerified = Math.random() > 0.5;
  user.dietaryPreferences = ['vegetarian', 'organic'];
  user.categoryPreferences = ['vegetables', 'fruits', 'baked goods'];
});

// Add coordinates to food listings
foodListings.forEach(listing => {
  listing.coordinates = {
    lat: 51.5074 + (Math.random() - 0.5) * 0.2,
    lon: -0.1278 + (Math.random() - 0.5) * 0.2
  };
  listing.providerRating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
});

// For debugging - log the available users
console.log("Available test users:", users.map(u => ({ email: u.email, password: u.password })));

// Define routes and other middleware below this line
// Home page
app.get("/", (req, res) => {
    console.log("Home page request");
    res.render("index", { title: "Minimise Food Waste - Home" });
});

// About page
app.get("/about", (req, res) => {
    res.render("about");
});

// Login page
app.get("/login", (req, res) => {
    res.render("login", { title: "Login - Minimise Food Waste" });
});

// Login form submission
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    console.log("Login attempt with:", { email, password });
    
    // For testing purposes, allow any login credentials
    // Create a user object based on the provided email
    const userName = email.split('@')[0]; // Extract name from email
    
    // Create a session for the user
    req.session.user = {
        id: Date.now(), // Generate a unique ID
        name: userName.charAt(0).toUpperCase() + userName.slice(1), // Capitalize first letter
        email: email,
        location: "Unknown Location",
        isLoggedIn: true
    };
    
    console.log("Session user set:", req.session.user);
    
    // Redirect to home page after successful login
    return res.redirect('/');
});

// Signup page
app.get("/signup", (req, res) => {
    res.render("signup", { title: "Sign Up - Minimise Food Waste" });
});

// Signup form submission
app.post("/signup", (req, res) => {
    const { firstName, lastName, email, location, password } = req.body;
    
    console.log("Signup attempt:", { firstName, lastName, email, location, password: "***" });
    
    // Create a new user object
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, // Generate a unique ID
        name: `${firstName} ${lastName}`,
        email: email,
        password: password, // In a real app, this should be hashed
        location: location || "Unknown Location"
    };
    
    // Add the new user to the in-memory users array
    users.push(newUser);
    
    // Create a session for the user
    req.session.user = {
        ...newUser,
        isLoggedIn: true
    };
    
    console.log("New user created and added to community:", newUser);
    console.log("Session user set:", req.session.user);
    
    // Redirect to home page after successful signup
    res.redirect('/');
});

// Logout route
app.get("/logout", (req, res) => {
    // Clear the user session
    req.session.destroy();
    res.redirect('/');
});

// User profile page
app.get("/userprofile", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  // Get the current user from session
  const currentUser = req.session.user;
  
  // Calculate user level
  const userLevel = userPointsService.getUserLevel(currentUser.points || 0);
  
  // Calculate environmental impact
  const environmentalImpact = userPointsService.calculateEnvironmentalImpact(currentUser);
  
  // Calculate trust score
  const trustScore = userPointsService.calculateTrustScore(currentUser);
  
  // Update badges
  const updatedUser = userPointsService.updateBadges(currentUser);
  
  // Add sample data for the profile page
  const userProfile = {
    ...updatedUser,
    joinDate: "April 2025",
    level: userLevel,
    trustScore,
    environmentalImpact,
    recentActivity: [
      { type: 'share', item: 'Organic Apples', date: 'April 2, 2025' },
      { type: 'receive', item: 'Homemade Bread', date: 'March 28, 2025' },
      { type: 'rating', value: 5, from: 'Jane Smith', date: 'March 25, 2025' }
    ],
    sharedItems: [
      { name: "Organic Apples", date: "April 2, 2025", status: "Available" },
      { name: "Pasta", date: "March 30, 2025", status: "Collected" },
      { name: "Tomatoes", date: "March 20, 2025", status: "Expired" }
    ],
    receivedItems: [
      { name: "Homemade Bread", date: "March 28, 2025", status: "Received", from: "Jane Smith" },
      { name: "Organic Milk", date: "March 25, 2025", status: "Consumed", from: "Emma Wilson" }
    ],
    savedItems: [
      { name: "Garden Vegetables", date: "April 7, 2025", distance: 3 },
      { name: "Pasta Sauce", date: "April 20, 2025", distance: 2.3 },
      { name: "Organic Bananas", date: "April 6, 2025", distance: 3.5 },
    ],
    impact: {
      foodWaste: { current: environmentalImpact.wastePreventedKg, goal: environmentalImpact.wastePreventedKg + 15 },
      carbonEmissions: { current: Math.round(environmentalImpact.carbonSavedKg), goal: Math.round(environmentalImpact.carbonSavedKg) + 30 },
      communityContribution: { level: userLevel.name, next: userLevel.nextLevel?.name || "Maximum Level", progress: userLevel.progressPercentage }
    },
    upcomingEvents: [
      { name: "Food Preservation Workshop", date: "April 15, 2025", location: "Community Center, London", status: "Registered" },
      { name: "Community Potluck", date: "April 22, 2025", location: "Green Park, London", status: "Interested" },
      { name: "Sustainable Cooking Webinar", date: "May 5, 2025", location: "Online (Zoom)", status: "Not Registered" }
    ]
  };
  
  // Update session with any badge or point changes
  req.session.user = updatedUser;
  
  res.render("userprofile", { 
    title: `${currentUser.name} - Profile | Minimise Food Waste`,
    user: userProfile
  });
});

// View another user's profile
app.get("/user-profile/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.render("userprofile", { title: "User Not Found" });
    }
    
    // Add sample data for the profile page
    const userProfile = {
        ...user,
        joinDate: "April 2025",
        itemsShared: Math.floor(Math.random() * 20),
        itemsReceived: Math.floor(Math.random() * 15),
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        wastePreventedKg: Math.floor(Math.random() * 30),
        badges: [
            { name: "Early Adopter", icon: "seedling" },
            { name: "Top Sharer", icon: "award" },
            { name: "Community Builder", icon: "users" }
        ],
        sharedItems: [
            { name: "Homemade Bread", date: "April 3, 2025", status: "Available" },
            { name: "Organic Milk", date: "April 4, 2025", status: "Claimed" }
        ],
        impact: {
            foodWaste: { current: Math.floor(Math.random() * 30), goal: 40 },
            carbonEmissions: { current: Math.floor(Math.random() * 20), goal: 30 },
            communityContribution: { level: "Active", next: "Enthusiast", progress: 60 }
        }
    };
    
    res.render("userprofile", { 
        title: `${user.name} - Profile | Minimise Food Waste`,
        user: userProfile,
        isOtherUser: true
    });
});

// User list page with in-memory user store
app.get("/userlist", (req, res) => {
    // Add some additional user data for display purposes
    const enhancedUsers = users.map(user => ({
        ...user,
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        joinDate: "April 2025",
        itemsShared: Math.floor(Math.random() * 20),
        itemsReceived: Math.floor(Math.random() * 15),
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        wastePreventedKg: Math.floor(Math.random() * 30),
        bio: "Passionate about reducing food waste and sharing homegrown produce with the community."
    }));
    
    res.render('userlist', { 
        title: "Community - Minimise Food Waste",
        data: enhancedUsers 
    });
});

// Listing page
app.get("/listing", (req, res) => {
    // Get filter parameters from query string
    const category = req.query.category || '';
    const organic = req.query.organic || '';
    const distance = req.query.distance || '';
    const dietaryInfo = req.query.dietary || '';
    
    // Filter food listings based on query parameters
    let filteredListings = [...foodListings];
    
    if (category) {
        filteredListings = filteredListings.filter(item => item.category === category);
    }
    
    if (organic === 'true') {
        filteredListings = filteredListings.filter(item => item.organic === true);
    }
    
    if (distance) {
        filteredListings = filteredListings.filter(item => item.distance <= parseFloat(distance));
    }
    
    if (dietaryInfo) {
        filteredListings = filteredListings.filter(item => item.dietaryInfo.includes(dietaryInfo));
    }
    
    // Get all unique categories for the filter dropdown
    const categories = [...new Set(foodListings.map(item => item.category))];
    
    // Get all unique dietary info options for the filter dropdown
    const dietaryOptions = [...new Set(
        foodListings.flatMap(item => 
            item.dietaryInfo.split(',').map(option => option.trim())
        )
    )];
    
    res.render("listing", { 
        title: "Browse Food Listings",
        listings: filteredListings,
        categories: categories || [],
        dietaryOptions: dietaryOptions || [],
        filters: {
            category: category || '',
            organic: organic === 'true',
            distance: distance || '',
            dietary: dietaryInfo || ''
        }
    });
});

// Detailed page for a specific food item
app.get("/detailed/:id", (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = foodListings.find(item => item.id === itemId);
    
    if (!item) {
        return res.status(404).send("Food item not found");
    }
    
    res.render("detailed", { 
        title: `${item.title} - Food Details`,
        item: item,
        listings: foodListings // Pass all food listings for the similar items section
    });
});

// Detailed page
app.get("/detailed", (req, res) => {
    res.render("detailed");
});

// Enhanced tag route with additional data for dropdowns
app.get("/tag", (req, res) => {
    const categories = ["Fruits", "Vegetables", "Baked Goods", "Others"];
    res.render("tag", { categories });
});

// Route for testing the in-memory user store
app.get("/db_test", (req, res) => {
    console.log(users);
    res.send('Check console for results');
});

// Goodbye route
app.get("/goodbye", (req, res) => {
    res.send("Goodbye world!");
});

// Dynamic route for /hello/<name>
app.get("/hello/:name", (req, res) => {
    res.render("hello", { name: req.params.name });
});

// Messages route - display user's conversations
app.get("/messages", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const userId = req.session.user.id;
  
  // Get user's conversations with details
  let userConversations = [];
  let messageStats = {
    totalMessages: 0,
    unreadMessages: 0,
    totalConversations: 0,
    responseRate: 0,
    averageResponseTime: '0'
  };
  
  try {
    // Check if messagingService exists before calling its methods
    if (messagingService && typeof messagingService.getUserConversations === 'function') {
      userConversations = messagingService.getUserConversations(userId, conversations, users);
    } else {
      console.warn('messagingService or getUserConversations method not available');
    }
    
    // Get messaging stats if the service is available
    if (messagingService && typeof messagingService.getUserMessageStats === 'function') {
      messageStats = messagingService.getUserMessageStats(userId, conversations, messages);
    } else {
      console.warn('messagingService or getUserMessageStats method not available');
    }
  } catch (error) {
    console.error('Error in messages route:', error);
  }
  
  // Get all users for the new message dropdown (excluding current user)
  const otherUsers = users.filter(u => u.id !== userId);
  
  res.render("messages", {
    title: "Messages - Minimise Food Waste",
    user: req.session.user,
    currentUser: req.session.user,
    conversations: userConversations,
    stats: messageStats,
    users: otherUsers,
    foodListings: foodListings || []
  });
});

// Individual conversation route
app.get("/messages/:conversationId", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const userId = req.session.user.id;
  const conversationId = req.params.conversationId;
  
  // Get the conversation
  const conversation = conversations.find(conv => conv.id === conversationId);
  
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(404).render("error", { 
      title: "Conversation Not Found",
      message: "The conversation you're looking for doesn't exist or you don't have access to it."
    });
  }
  
  // Get the other participant
  const otherParticipantId = conversation.participants.find(id => id !== userId);
  const otherParticipant = users.find(user => user.id === otherParticipantId);
  
  // Get conversation messages
  const conversationMessages = messagingService.getConversationMessages(conversationId, messages);
  
  // Mark messages as read
  const unreadMessageIds = conversationMessages
    .filter(msg => msg.recipientId === userId && msg.status !== 'read')
    .map(msg => msg.id);
  
  if (unreadMessageIds.length > 0) {
    // Update messages
    messagingService.markMessagesAsRead(unreadMessageIds, messages);
    
    // Update conversation unread count
    conversation.unreadCount[userId] = 0;
  }
  
  res.render("conversation", {
    title: `Conversation with ${otherParticipant.name} - Minimise Food Waste`,
    user: req.session.user,
    conversation,
    messages: conversationMessages,
    otherUser: otherParticipant
  });
});

// Send message route
app.post("/messages/:conversationId/send", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: "Not logged in" });
  }
  
  const userId = req.session.user.id;
  const conversationId = req.params.conversationId;
  const { content, type = 'text' } = req.body;
  
  // Get the conversation
  const conversation = conversations.find(conv => conv.id === conversationId);
  
  if (!conversation || !conversation.participants.includes(userId)) {
    return res.status(404).json({ success: false, error: "Conversation not found" });
  }
  
  // Get the recipient
  const recipientId = conversation.participants.find(id => id !== userId);
  
  // Create new message
  const newMessage = messagingService.createMessage(userId, recipientId, content, type);
  
  // Add message to messages array
  messages.push(newMessage);
  
  // Update conversation
  const updatedConversation = messagingService.updateConversationWithMessage(conversation, newMessage);
  Object.assign(conversation, updatedConversation);
  
  // Award points for activity
  const updatedUser = userPointsService.awardPoints(req.session.user, 'DAILY_LOGIN');
  req.session.user = updatedUser;
  
  return res.json({ success: true, message: newMessage });
});

// Recommendations route
app.get("/recommendations", async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const currentUser = req.session.user;
  
  // Ensure user has necessary properties
  if (!currentUser.stats) {
    currentUser.stats = {};
  }
  
  // Default coordinates for London if user doesn't have coordinates
  if (!currentUser.stats.coordinates) {
    currentUser.stats.coordinates = {
      lat: 51.5074,
      lon: -0.1278
    };
    console.log("Using default coordinates for user:", currentUser.id);
  }
  
  // Get personalized recommendations
  const userPreferences = {
    dietary: currentUser.dietaryPreferences || [],
    categories: currentUser.categoryPreferences || []
  };
  
  const personalizedRecommendations = recommendationService.getPersonalizedRecommendations(
    currentUser,
    foodListings,
    userPreferences
  );
  
  // Get collaborative filtering recommendations
  const collaborativeRecommendations = recommendationService.getCollaborativeFilteringRecommendations(
    currentUser,
    users,
    foodListings
  );
  
  // Get nearby food listings
  const nearbyListings = locationService.findNearbyFoodListings(
    currentUser.stats.coordinates,
    foodListings,
    5
  );
  
  // Get weather data for user's location and suggested pickup times
  let weatherData = null;
  let suggestedPickupTimes = null;
  
  try {
    // Get weather data
    const weatherResponse = await locationService.getWeatherForLocation(currentUser.stats.coordinates);
    if (weatherResponse && weatherResponse.success) {
      weatherData = weatherResponse.weather;
    }
    
    // Get suggested pickup times
    const pickupTimesResponse = await locationService.suggestOptimalPickupTimes(currentUser.stats.coordinates);
    if (pickupTimesResponse && pickupTimesResponse.success) {
      suggestedPickupTimes = pickupTimesResponse.suggestedTimeSlots;
      
      // Add suggested time slots to weather data
      if (weatherData) {
        weatherData.suggestedTimeSlots = suggestedPickupTimes;
      }
    }
  } catch (error) {
    console.error('Error fetching weather or pickup times:', error);
  }
  
  res.render("recommendations", {
    title: "Personalized Recommendations - Minimise Food Waste",
    user: currentUser,
    personalizedRecommendations: personalizedRecommendations.slice(0, 6),
    collaborativeRecommendations: collaborativeRecommendations.slice(0, 4),
    nearbyListings: nearbyListings.slice(0, 6),
    weather: weatherData
  });
});

// Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
});

module.exports = app;
