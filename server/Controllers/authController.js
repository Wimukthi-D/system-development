const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.use(bodyParser.json());

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    try {
        connection.query('SELECT * FROM User WHERE username = ?', [username], async (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (rows.length == 1) {
                const hashedPassword = rows[0].Password;
                const result = await bcrypt.compare(password, hashedPassword);

                if (result) {

                    
                    const {userID, Usertype, FirstName, BranchID} = rows[0]; 
                    const token = jwt.sign({ id: userID, role:Usertype, FirstName:FirstName, branchID:BranchID }, 'JWTSecret', { expiresIn: "24h" });
                     
                    //const  usertype  = rows[0].Usertype;
                    res.json({ auth: true, token: token});
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
