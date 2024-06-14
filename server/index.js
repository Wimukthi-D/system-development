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
    secret: "JWTSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(express.static("images"));
// Importing routes

const userController = require("./Controllers/userController");
const authController = require("./Controllers/authController");
const stockController = require("./Controllers/stockController");
const billController = require("./Controllers/billController");
const tokenController = require("./Controllers/tokenController");
const chartController = require("./Controllers/chartController");
const orderController = require("./Controllers/orderController");
const transferController = require("./Controllers/transferController");
const landingController = require("./Controllers/landingController");
const mailController = require("./Controllers/mailController");
const notifyController = require("./Controllers/notifyController");
// Routes

app.use("/api/user", userController);
app.use("/api/auth", authController);
app.use("/api/stock", stockController);
app.use("/api/bill", billController);
app.use("/api/token", tokenController);
app.use("/api/chart", chartController);
app.use("/api/order", orderController);
app.use("/api/transfer", transferController);
app.use("/api/landing", landingController);
app.use("/api/mail", mailController);
app.use("/api/notify", notifyController);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
