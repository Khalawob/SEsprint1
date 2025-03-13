// Import express.js
const express = require("express");

// Create express app
var app = express();

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    var test_data = ['one', 'two', 'three', 'four'];
    res.render("index", { title: "Minimise Food Waste", heading: "Welcome to Minimise Food Waste", data: test_data });
});

// About Page
app.get("/about", function(req, res) {
    res.render("about");
});

// User Profile Page (Static - Can be removed if not needed)
app.get("/userprofile", function(req, res) {
    res.render("userprofile");
});

// User Profile Page (Dynamic - Fetch user details from DB)
app.get("/userprofile/:id", function(req, res) {
    const userId = req.params.id;
    const sql = `
        SELECT u.User_ID, u.User_Name, u.Location, u.Email, 
               (SELECT COUNT(*) FROM Item WHERE User_ID = u.User_ID) AS Total_Items_Donated,
               (SELECT COUNT(*) FROM Request WHERE User_ID = u.User_ID) AS Total_Items_Requested
        FROM Users u
        WHERE u.User_ID = ?
    `;

    db.query(sql, [userId]).then(results => {
        if (results.length > 0) {
            res.render("userprofile", { user: results[0] });
        } else {
            res.send("User not found.");
        }
    }).catch(err => {
        console.error(err);
        res.send("Error retrieving user profile.");
    });
});

// User List Page - Fetch from Database
app.get("/userlist", function(req, res) {
    var sql = 'SELECT * FROM Users';
    db.query(sql).then(results => {
        res.render('userlist', { data: results });
    }).catch(err => {
        console.error(err);
        res.send("Error retrieving user list.");
    });
});

// Listing Page
app.get("/listing", function(req, res) {
    res.render("listing");
});

// Tag Page
app.get("/tag", function(req, res) {
    res.render("tag");
});

// Detailed Page - Dynamic ID
app.get("/detailed/:id", function(req, res) {
    const id = req.params.id;
    const sql = `
      SELECT i.Item_ID, i.Item_name, i.Quantity, i.Claimed, c.Category_Name
      FROM Item i
      INNER JOIN Category c ON i.Category_ID = c.Category_ID
      WHERE i.Item_ID = ?
    `;
    db.query(sql, [id]).then(results => {
        if (results.length > 0) {
            res.render("detailed", { listing: results[0] });
        } else {
            res.send("No listing found.");
        }
    }).catch(err => {
        console.error(err);
        res.send("Error retrieving listing details.");
    });
});

// Catch /detailed without ID and redirect
app.get("/detailed", function(req, res) {
    res.send("Please provide an item ID. Example: /detailed/1");
});

// Goodbye Page
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Dynamic Route for /hello/<name>
app.get("/hello/:name", function(req, res) {
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});
