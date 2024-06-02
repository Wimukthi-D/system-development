const express = require('express');
const bodyParser = require('body-parser');
const connection = require('../Config/db');

const router = express.Router();
router.use(bodyParser.json());

// Endpoint to place an order
router.post('/placeOrder', (req, res) => {
    try {
        const { userID, customerID, orderDate, totalAmount, items } = req.body;
        const newcustomerID = customerID === "" ? null : customerID;
        const formattedOrderDate = new Date(orderDate).toISOString().slice(0, 19).replace('T', ' ');

        connection.query('INSERT INTO `Order` (userID, customerID, orderDate, status) VALUES (?, ?, ?, ?)',
            [userID, newcustomerID, formattedOrderDate, 'Ordered'],
            (err, result) => {
                if (err) {
                    console.error('Error inserting into MySQL database:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                const orderID = result.insertId;
                const transactionQuery = 'INSERT INTO Transaction (OrderID, TransactionAmount, Date, status) VALUES (?, ?, ?, ?)';
                connection.query(transactionQuery, [orderID, totalAmount, formattedOrderDate, 'Buy']);

                const insertItemQuery = 'INSERT INTO Order_Product (OrderID, ItemCode, Quantity, UnitPrice, status) VALUES (?, ?, ?, ?, ?)';
                Promise.all(items.map(item => {
                    return new Promise((resolve, reject) => {
                        connection.query(insertItemQuery, [orderID, item.itemCode, item.quantity, item.unitPrice, 'Buy'], (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                }))
                    .then(() => {
                        res.status(201).json({ orderID });
                    })
                    .catch(err => {
                        console.error('Error inserting items:', err);
                        res.status(500).send('Internal Server Error');
                    });
            });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order', errorMessage: error.message });
    }
});

// Endpoint to get orders
router.get('/orderDetails', (req, res) => {
    try {
        const query = `
            SELECT 
                o.OrderID, 
                o.OrderDate, 
                u.UserName AS CashierName, 
                c.FirstName, 
                t.TransactionAmount, 
                o.Status AS OrderStatus,
                op.ItemCode,
                p.Name AS ItemName,
                op.Quantity,
                op.UnitPrice
            FROM 
                \`Order\` o
                LEFT JOIN User u ON o.UserID = u.UserID
                LEFT JOIN Customer c ON o.CustomerID = c.CustomerID
                LEFT JOIN Transaction t ON o.OrderID = t.OrderID
                LEFT JOIN Order_Product op ON o.OrderID = op.OrderID
                LEFT JOIN Product p ON op.ItemCode = p.ItemCode`;

        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching order details:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                const ordersWithItems = results.reduce((acc, curr) => {
                    // Parse OrderID as an integer
                    const OrderID = parseInt(curr.OrderID);

                    const { ItemCode, ItemName, Quantity, UnitPrice, ...orderData } = curr;
                    if (!OrderID) {
                        console.warn('Missing OrderID for item:', curr);
                        return acc;
                    }

                    const item = { itemCode: ItemCode, itemName: ItemName, quantity: Quantity, unitPrice: UnitPrice };
                    if (!acc[OrderID]) {
                        acc[OrderID] = { ...orderData, OrderID, items: [item] };
                    } else {
                        acc[OrderID].items.push(item);
                    }

                    return acc;
                }, {});

                const orders = Object.values(ordersWithItems);
                res.status(200).json(orders);
            }
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});

// Endpoint to get the next available order number
router.get('/nextOrderNumber', (req, res) => {
    try {
        connection.query('SELECT MAX(OrderID) AS maxOrderId FROM `Order`', (err, result) => {
            if (err) {
                console.error('Error fetching max order ID:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            
            const maxOrderId = result[0].maxOrderId || 0; // If no orders exist, start from 0
            const nextOrderNumber = maxOrderId + 1;

            res.status(200).json({ nextOrderNumber });
        });
    } catch (error) {
        console.error('Error fetching next order number:', error);
        res.status(500).json({ error: 'Failed to fetch next order number' });
    }
});


module.exports = router;
