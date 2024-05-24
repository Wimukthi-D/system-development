const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
