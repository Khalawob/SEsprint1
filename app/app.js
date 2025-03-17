// Import express.js
const express = require("express");

// Create express app
const app = express();

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", (req, res) => {
    res.render("index", (err, html) => {
        if (err) {
            console.error("Error rendering index:", err);
            return res.status(500).send("Error rendering page.");
        }
        res.send(html);
    });
});

// About page
app.get("/about", (req, res) => {
    res.render("about", (err, html) => {
        if (err) {
            console.error("Error rendering about:", err);
            return res.status(500).send("Error rendering page.");
        }
        res.send(html);
    });
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

// User list page with database query
app.get("/userlist", (req, res) => {
    const sql = 'SELECT * FROM Users';
    db.query(sql)
      .then(results => {
          res.render('userlist', { data: results }, (err, html) => {
              if (err) {
                  console.error("Error rendering userlist:", err);
                  return res.status(500).send("Error rendering page.");
              }
              res.send(html);
          });
      })
      .catch(err => {
          console.error("Database query error:", err);
          res.status(500).send("Database query error.");
      });
});

// Listing page
app.get("/listing", (req, res) => {
    res.render("listing", (err, html) => {
        if (err) {
            console.error("Error rendering listing:", err);
            return res.status(500).send("Error rendering page.");
        }
        res.send(html);
    });
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

// Enhanced tag route with additional data for dropdowns
app.get("/tag", (req, res) => {
    const categories = ["Fruits", "Vegetables", "Baked Goods", "Others"];
    res.render("tag", { categories }, (err, html) => {
        if (err) {
            console.error("Error rendering tag:", err);
            return res.status(500).send("Error rendering page.");
        }
        res.send(html);
    });
});

// Route for testing the database
app.get("/db_test", (req, res) => {
    const sql = 'SELECT * FROM test_table';
    db.query(sql)
      .then(results => {
          console.log(results);
          res.send('Check console for results');
      })
      .catch(err => {
          console.error("Database test error:", err);
          res.status(500).send("Database test error.");
      });
});

// Goodbye route
app.get("/goodbye", (req, res) => {
    res.send("Goodbye world!");
});

// Dynamic route for /hello/<name>
app.get("/hello/:name", (req, res) => {
    res.render("hello", { name: req.params.name }, (err, html) => {
        if (err) {
            console.error("Error rendering hello:", err);
            return res.status(500).send("Error rendering page.");
        }
        res.send(html);
    });
});

// Start server on port 3000
app.listen(3000, () => {
    console.log("Server running at http://127.0.0.1:3000/");
});
