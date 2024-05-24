const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../db');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cors = require('cors');
const e = require('express');


const router = express.Router();

router.use(bodyParser.json());

router.use(cors());

router.post('/register', (req, res) => {
    const { Username, Password, FirstName, LastName, NIC, Email, PhoneNumber, Address, Usertype, BranchID } = req.body;

    // Hash password
    bcrypt.hash(Password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Check if username, NIC, email, and phone number already exist
        connection.query('SELECT * FROM User WHERE Username = ? OR NIC = ? OR Email = ? OR PhoneNumber = ?', [Username, NIC, Email, PhoneNumber], (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (rows.length > 0) {
                const existingFields = rows[0];
                let errors = {};

                if (existingFields.Username === Username) {
                    errors.Username = 'Username already exists';
                }
                
                if (existingFields.NIC === NIC) {
                    errors.NIC = 'NIC already exists';
                }
                
                if (existingFields.Email === Email) {
                    errors.Email = 'Email already exists';
                }

                if (existingFields.PhoneNumber === PhoneNumber) {
                    errors.PhoneNumber = 'Phone number already exists';
                }

                res.status(400).json({ error: 'Fields already exist', errors });
                return;
                
            }else{
                // Set Email to null if it's empty
                const userEmail = Email.trim() === '' ? null : Email;

            // Insert new user into database with hashed password
            
            connection.query('INSERT INTO User (`Username`, `Password`, `FirstName`, `LastName`, `NIC`, `Email`, `PhoneNumber`, `Address`, `Usertype`,`BranchID`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)', 
            [Username, hashedPassword, FirstName, LastName, NIC, userEmail, PhoneNumber, Address, Usertype, Usertype === 'Customer' || Usertype === 'Supplier' ? null : BranchID], 
            (err, result) => {
                if (err) {
                    console.error('Error inserting into MySQL database:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }else{
                    const registrationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

                    switch (Usertype) {
                        case 'Cashier':
                            connection.query('INSERT INTO Cashier (`UserId`, `hiredDate`) VALUES (?, ?)', [result.insertId, registrationDate], (err, result) => {
                                if (err) {
                                    console.error('Error inserting into CashierTable:', err);
                                }
                            });
                            break;
                        case 'Staff':
                            connection.query('INSERT INTO Staff (`UserId`, `hiredDate`) VALUES (?, ?)', [result.insertId, registrationDate], (err, result) => {
                                if (err) {
                                    console.error('Error inserting into StaffTable:', err);
                                }
                            });
                            break;
                        case 'Manager':
                            connection.query('INSERT INTO Manager (`UserId`, `hiredDate`) VALUES (?, ?)', [result.insertId, registrationDate], (err, result) => {
                                if (err) {
                                    console.error('Error inserting into ManagerTable:', err);
                                }
                            });
                            break;
                        case 'Supplier':
                            connection.query('INSERT INTO Supplier (`UserId`, `hiredDate`) VALUES (?, ?)', [result.insertId, registrationDate], (err, result) => {
                                if (err) {
                                    console.error('Error inserting into SupplierTable:', err);
                                }
                            });
                            break;
                        case 'Customer':
                            connection.query('INSERT INTO Customer (`UserId`) VALUES (?)', [result.insertId], (err, result) => {
                                if (err) {
                                    console.error('Error inserting into CustomerTable:', err);
                                }
                            });
                            break;                  
                    }
                    res.status(201).json({ message: 'User registered successfully', UserId: result.insertId });
                } 
            });

            }
        });
    });
});


router.put('/update/:id', async (req, res, next) => {
    const userID = req.params.id;
    const { Username, FirstName, LastName, NIC, Email, PhoneNumber, Address, Usertype, BranchID } = req.body;

    try {

        // Check if username, NIC, email, and phone number already exist
        connection.query('SELECT * FROM User WHERE (Username = ? OR NIC = ? OR Email = ? OR PhoneNumber = ?) AND UserID != ?', [Username, NIC, Email, PhoneNumber,userID], (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (rows.length > 0) {
                const existingFields = rows[0];
                let errors = {};

                if (existingFields.Username === Username) {
                    errors.Username = 'Username already exists';
                }
                
                if (existingFields.NIC === NIC) {
                    errors.NIC = 'NIC already exists';
                }
                
                if (existingFields.Email === Email) {
                    errors.Email = 'Email already exists';
                }

                if (existingFields.PhoneNumber === PhoneNumber) {
                    errors.PhoneNumber = 'Phone number already exists';
                }

                res.status(400).json({ error: 'Fields already exist', errors });
                return;
                
            }else{
                // Set Email to null if it's empty
                const userEmail = Email.trim() === '' ? null : Email;

                connection.query('UPDATE User SET Username = ?, FirstName = ?, LastName = ?, NIC = ?, Email = ?, PhoneNumber = ?, Address = ?, Usertype = ?, BranchID = ? WHERE UserID = ?',
    [Username, FirstName, LastName, NIC, userEmail, PhoneNumber, Address, Usertype, Usertype === 'Customer' || Usertype === 'Supplier' ? null : BranchID, userID],
    (err, result) => {
        if (err) {
            // Handle the error
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        if (result.affectedRows === 0) {
            // If no rows were affected, the user was not found
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // User was updated successfully
        res.status(200).json({ message: 'User updated successfully', UserId: userID });
    });

            }
        });

    } catch (err) {
        console.error('Error updating MySQL database:', err);
        next(err);
    }
});

router.get('/getuser', (req, res) => {
    // Query the database to get user data
    connection.query('SELECT * FROM User', (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // If no error, send the retrieved user data in the response
        res.status(200).json({ users: rows });
    });
});

router.post('/resetpass/:userID', async (req, res) => {
    const userID = req.params.userID;
    const { newPassword } = req.body;
try {

    // Query the database to get the user's current password
    connection.query('SELECT Password FROM User WHERE UserID = ?', [userID], async (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentPassword = rows[0].Password;

        // Compare the current password with the new password
        const passwordsMatch = await bcrypt.compare(newPassword, currentPassword);
        if (passwordsMatch) {
            return res.status(400).json({ message: 'New password cannot be the same as the current password' });
        }

        // Hash the new password
        bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing password:', hashErr);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // Update the user's password
            connection.query('UPDATE User SET Password = ? WHERE UserID = ?', [hashedPassword, userID], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating password:', updateErr);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                return res.status(200).json({ message: 'Password reset successfully', UserId: userID });
            });
        });
    });
} catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Internal server error' });
}
});

router.delete('/delete/:id', async (req, res) => {
const userId = req.params.id;

try {
    // Execute the delete query
    const result = await connection.query('DELETE FROM User WHERE UserID = ?', [userId]);
       
    // Check if the user was deleted successfully
    if (Array.isArray(result) && result[0].affectedRows === 0) {
        // User with the provided ID was not found
        return res.status(404).json({ error: 'User not found' });
    }

    // User was deleted successfully
    return res.status(200).json({ message: 'User deleted successfully', UserId: userId });
} catch (err) {
    // Error occurred while deleting user
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'An error occurred while deleting the user' });
}
});




module.exports = router;
