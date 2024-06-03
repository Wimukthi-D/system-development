const express = require("express");
const bodyParser = require("body-parser");
const connection = require("../db");

const router = express.Router();

router.use(bodyParser.json());

router.get("/getStock", (req, res) => {
  // Query the database to get stock data
  connection.query(
    ` SELECT
    i.stockID, 
    i.quantity, 
    b.branchName, 
    i.unitprice, 
    c.categoryName,
    g.genericName,
    p.drugname,
    i.branchID,
    DATE_FORMAT(i.expireDate, '%Y-%m-%d') as expireDate,
    DATE_FORMAT(i.stockDate, '%Y-%m-%d') as stockDate
    

FROM 
    inventory i
JOIN 
    branch b ON i.branchID = b.branchID
JOIN 
    product p ON i.productID = p.productID
JOIN 
    category c ON p.categoryID = c.categoryID
JOIN 
    generic g ON p.genericID = g.genericID`,
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // If no error, send the retrieved stock data in the response
      res.status(200).json({ stocks: rows });
    }
  );
});

router.post("/submit", (req, res) => {
  const { items, discount, total, paymentMethod, amountPaid } = req.body;
  console.log(items);
  // Start a transaction
  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const insertInvoiceQuery = `
        INSERT INTO invoices (discount, total, paymentMethod, amountPaid, createdAt)
        VALUES (?, ?, ?, ?, NOW())
      `;

    connection.query(
      insertInvoiceQuery,
      [discount, total, paymentMethod, amountPaid],
      (err, result) => {
        if (err) {
          console.error("Error inserting invoice:", err);
          return connection.rollback(() => {
            res.status(500).send("Internal Server Error");
          });
        }

        const invoiceID = result.insertId;

        const insertItemsQuery = `
            INSERT INTO invoice_items (invoiceID, stockID, amount, branchID)
            VALUES ?
          `;

        const itemsData = items.map((item) => [
          invoiceID,
          item.stockID,
          item.amount,
          item.branchID,
        ]);

        connection.query(insertItemsQuery, [itemsData], (err) => {
          if (err) {
            console.error("Error inserting invoice items:", err);
            return connection.rollback(() => {
              res.status(500).send("Internal Server Error");
            });
          }

          // Commit the transaction
          connection.commit((err) => {
            if (err) {
              console.error("Error committing transaction:", err);
              return connection.rollback(() => {
                res.status(500).send("Internal Server Error");
              });
            }

            res.status(201).json({ message: "Invoice submitted successfully" });
          });
        });
      }
    );
  });
});

router.get("/getCustomer", (req, res) => {
  connection.query(
    `SELECT Firstname FROM user WHERE Usertype = 'Customer'`,
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // If no error, send the retrieved customer data in the response
      res.status(200).json({ customers: rows });
    }
  );
});

module.exports = router;
