const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: 'JWTSecret', // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));


// Importing routes
const { addTest } = require('./Controllers/testController'); 
const userController = require('./Controllers/userController'); 
const authController = require('./Controllers/authController');
const stockController = require('./Controllers/stockController');

// Routes
app.post('/Test', addTest);
app.use('/api/user', userController);
app.use('/api/auth', authController);
app.use('/api/stock', stockController);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
 