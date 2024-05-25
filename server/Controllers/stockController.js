const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../db');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cors = require('cors');

const router = express.Router();

router.use(bodyParser.json());

router.use(cors());

router.get('/getStock', (req, res) => {
    // Query the database to get stock data
    connection.query(` SELECT
    p.productID, 
    i.stockID, 
    i.quantity, 
    b.branchName, 
    i.unitprice, 
    c.categoryName, 
    g.genericName,
    p.drugname,
    i.branchID,
    DATE_FORMAT(i.expireDate, '%Y-%m-%d') as expireDate,
    DATE_FORMAT(i.stockDate, '%Y-%m-%d') as stockDate,
    p.restock_level

FROM 
    inventory i
JOIN 
    branch b ON i.branchID = b.branchID
JOIN 
    product p ON i.productID = p.productID
JOIN 
    category c ON p.categoryID = c.categoryID
JOIN 
    generic g ON p.genericID = g.genericID`, (err, rows) => {
        if (err) {
            console.error('Error querying MySQL database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // If no error, send the retrieved stock data in the response
        res.status(200).json({ stocks: rows });
    });
});

router.post('/addStock', async (req, res) => {
    const { productID, BranchID, ExpireDate, stockDate, Quantity, unitprice} = req.body;

    connection.query('INSERT INTO inventory (`productID`, `branchID`, `expireDate`, `stockDate`, `quantity`, `unitPrice`) VALUES (?, ?, ?, ?, ?, ?)', [productID, BranchID, ExpireDate, stockDate, Quantity, unitprice], (err, result) => {
        if (err) {
            console.error('Error inserting Item:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.status(200).json({ message: 'Item added successfully', stockId: result.insertId });
    });
});

router.put('/updateStock/:id', async (req, res) => {
    const stockId = req.params.id;
    const { productID, BranchID, ExpireDate, stockDate, Quantity, UnitPrice} = req.body;

    try {
        connection.query('UPDATE inventory SET productID = ?, branchID = ?, expireDate = ?, stockDate = ?, quantity = ?, unitPrice = ? WHERE stockID = ?', [productID, BranchID, ExpireDate, stockDate, Quantity, UnitPrice, stockId], (err, result) => {
            if (err) {
                console.error('Error updating Item:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            res.status(200).json({ message: 'Item updated successfully', stockId });
        });
    } catch (err) {
        console.error('Error updating Item:', err);
        return res.status(500).json({ error: 'An error occurred while updating the Item' }); 
    }
}
);

router.delete('/deleteStock/:id', async (req, res) => {
    const stockId = req.params.id;
    
    try {
        // Execute the delete query
        const result = await connection.query('DELETE FROM inventory WHERE stockID = ?', [stockId]);
           
        // Check if the user was deleted successfully
        if (Array.isArray(result) && result[0].affectedRows === 0) {
            // User with the provided ID was not found
            return res.status(404).json({ error: 'Item not found' });
        }
    
        // User was deleted successfully
        return res.status(200).json({ message: 'Item deleted successfully', StockId: stockId });
    } catch (err) {
        // Error occurred while deleting user
        console.error('Error deleting Item:', err);
        return res.status(500).json({ error: 'An error occurred while deleting the Item' });
    }
    });

    router.get('/getProduct', (req, res) => {
        // Query the database to get Product data
        connection.query('SELECT * FROM product p JOIN generic g ON p.genericID = g.genericID JOIN category c ON p.categoryID = c.categoryID ', (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            // If no error, send the retrieved user data in the response
            res.status(200).json({ products: rows });
        });
    });

    router.get('/getGeneric', (req, res) => {
        // Query the database to get Generic data
        connection.query('SELECT * FROM generic', (err, rows) => {
            if (err) {
                console.error('Error querying MySQL database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            // If no error, send the retrieved user data in the response
            res.status(200).json({ Generics: rows });
        });
    }
     )

     router.post('/addProduct', async (req, res) => {
        const { DrugName, GenericName, categoryName, restock_level, Description } = req.body;
    
        try {
            // Check if product already exists with the same drugname and genericname
            let productResult = await new Promise((resolve, reject) => {
                connection.query(
                    `SELECT *
                     FROM product p
                     JOIN generic g ON p.genericID = g.genericID
                     WHERE p.drugname = ? AND g.genericName = ?`,
                    [DrugName, GenericName],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });
    
            if (productResult.length) {
                res.status(400).json({ message: 'Product already exists' });
                return;
            }
    
            // Check if category exists
            let categoryResult = await new Promise((resolve, reject) => {
                connection.query('SELECT categoryID FROM category WHERE categoryName = ?', [categoryName], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
    
            let finalCategoryID = categoryResult.length ? categoryResult[0].categoryID : null;
    
            if (!finalCategoryID) {
                // Insert new category
                let insertCategoryResult = await new Promise((resolve, reject) => {
                    connection.query('INSERT INTO category (`categoryName`) VALUES (?)', [categoryName], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                finalCategoryID = insertCategoryResult.insertId;
            }
    
            // Check if generic exists
            let genericResult = await new Promise((resolve, reject) => {
                connection.query('SELECT genericID FROM generic WHERE genericName = ?', [GenericName], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
    
            let finalGenericID = genericResult.length ? genericResult[0].genericID : null;
    
            if (!finalGenericID) {
                // Insert new generic
                let insertGenericResult = await new Promise((resolve, reject) => {
                    connection.query('INSERT INTO generic (`genericName`) VALUES (?)', [GenericName], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                finalGenericID = insertGenericResult.insertId;
            }
    
            // Set Description to null if it is empty
            let finalDescription = Description.trim() === '' ? null : Description;
    
            // Insert product
            let insertProductResult = await new Promise((resolve, reject) => {
                connection.query('INSERT INTO product (`drugname`, `genericID`, `categoryID`, `restock_level`, `Description`) VALUES (?, ?, ?, ?, ?)', [DrugName, finalGenericID, finalCategoryID, restock_level, finalDescription], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
    
            res.status(200).json({ message: 'Product added successfully', productId: insertProductResult.insertId });
    
        } catch (err) {
            console.error('Error inserting Product:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    router.put('/updateProduct/:id', async (req, res) => {
        const productId = req.params.id;
        const { drugName, genericName, categoryName, genericID, categoryID, restock_level, Description } = req.body;
    
        try {
            // Check if the product already exists, excluding the current product being updated
            const existingProduct = await new Promise((resolve, reject) => {
                connection.query(
                    'SELECT * FROM product p JOIN generic g ON p.genericID = g.genericID WHERE drugname = ? AND genericName = ? AND productId != ?',
                    [drugName, genericName, productId],
                    (err, result) => {
                        if (err) {
                            console.error('Error checking existing product:', err);
                            reject(err);
                        } else {
                            resolve(result[0]);
                        }
                    }
                );
            });
    
            if (existingProduct) {
                // Product already exists, return an error
                return res.status(400).json({ error: 'Product already exists' });
            }
    
            // Start a transaction
            connection.beginTransaction(async (err) => {
                if (err) {
                    throw err;
                }
    
                try {
                    // Log values for debugging
                    console.log('Updating generic table with:', { genericName, genericID });
                    console.log('Updating category table with:', { categoryName, categoryID });
                    console.log('Updating product table with:', { drugName, genericID, categoryID, restock_level, Description, productId });
    
                    // Update the generic table
                    await new Promise((resolve, reject) => {
                        connection.query(
                            'UPDATE generic SET genericName = ? WHERE genericID = ?',
                            [genericName, genericID],
                            (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(result);
                            }
                        );
                    });
    
                    // Update the category table
                    await new Promise((resolve, reject) => {
                        connection.query(
                            'UPDATE category SET categoryName = ? WHERE categoryID = ?',
                            [categoryName, categoryID],
                            (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(result);
                            }
                        );
                    });
    
                    // Update the product table
                    await new Promise((resolve, reject) => {
                        connection.query(
                            'UPDATE product SET drugname = ?, genericID = ?, categoryID = ?, restock_level = ?, Description = ? WHERE productId = ?',
                            [drugName, genericID, categoryID, restock_level, Description, productId],
                            (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(result);
                            }
                        );
                    });
    
                    // Commit the transaction
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                throw err;
                            });
                        }
                        res.status(200).json({ message: 'Product updated successfully', productId });
                    });
                } catch (err) {
                    connection.rollback(() => {
                        console.error('Error in update product transaction:', err);
                        res.status(500).json({ error: 'An error occurred while updating the product' });
                    });
                }
            });
        } catch (err) {
            console.error('Error in update product route:', err);
            res.status(500).json({ error: 'An error occurred while updating the product' });
        }
    });
    
    
    
    
    
    
    router.delete('/deleteProduct/:id', async (req, res) => {
        const productID = req.params.id;
        
        try {
            // Execute the delete query
            const result = await connection.query('DELETE FROM product WHERE productID = ?', [productID]);
               
            // Check if the user was deleted successfully
            if (Array.isArray(result) && result[0].affectedRows === 0) {
                // User with the provided ID was not found
                return res.status(404).json({ error: 'Product not found' });
            }
        
            // User was deleted successfully
            return res.status(200).json({ message: 'Product deleted successfully', productID: productID });
        } catch (err) {
            // Error occurred while deleting user
            console.error('Error deleting Product:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the Product' });
        }
        });



module.exports = router;