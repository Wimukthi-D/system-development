const express = require('express');
const router = express.Router();
const { login, logout } = require('../Controllers/handleLogin.js');

router.post('/login', login);
router.post('/', logout);


module.exports = router;