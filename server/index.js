const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const jwt = require("jsonwebtoken");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: "JWTSecret", // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true if using HTTPS
  })
);

// Importing routes

const userController = require("./Controllers/userController");
const authController = require("./Controllers/authController");
const stockController = require("./Controllers/stockController");
const billController = require("./Controllers/billController");
const tokenController = require("./Controllers/tokenController");

// Routes

app.use("/api/user", userController);
app.use("/api/auth", authController);
app.use("/api/stock", stockController);
app.use("/api/bill", billController);
app.use("/api/token", tokenController);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
