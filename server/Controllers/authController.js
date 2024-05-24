const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../db');
const bcrypt = require('bcrypt');

const router = express.Router();

router.use(bodyParser.json());

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    try {
        connection.query('SELECT Password, usertype FROM User WHERE username = ?', [username], async (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (rows.length == 1) {
                const hashedPassword = rows[0].Password;

                const result = await bcrypt.compare(password, hashedPassword);

                if (result) {
                    const { usertype } = rows[0];
                    res.json({ usertype });
                } else {
                    res.status(401).json({ error: 'Invalid username or password' });
                }
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        });
    } catch (err) {
        console.error('Error querying MySQL database:', err);
        next(err);
    }
});

module.exports = router;
