const express = require("express");
const bodyParser = require("body-parser");
const connection = require("../db");

const router = express.Router();

router.use(bodyParser.json());

router.get("/getStock", (req, res) => {
  //get all stock data
  connection.query(
    ` SELECT
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
  const { items, paymentMethod, cashierID, branchID, customerID } = req.body;

  // Check the availability of items before proceeding
  checkItemAvailability(
    items,
    branchID,
    (availabilityError, unavailableProduct) => {
      if (availabilityError) {
        res.status(400).json({
          error: `Insufficient stock for product: ${unavailableProduct}`,
        });
        return;
      }

      // If all items have sufficient stock, proceed with inserting the sale
      insertSale(
        branchID,
        customerID,
        cashierID,
        paymentMethod,
        handleAfterSaleInsert
      );
    }
  );

  function checkItemAvailability(items, branchID, callback) {
    let itemsChecked = 0;

    items.forEach((item) => {
      //check if the quantity of the product is available in the inventory
      const { productID, quantity } = item;
      connection.query(
        "SELECT quantity FROM inventory WHERE productID = ? AND branchID = ?",
        [productID, branchID],
        (err, results) => {
          if (err) {
            console.error("Error checking inventory:", err);
            res.status(500).send("Internal Server Error");
            return;
          }

          const availableQuantity = results.length ? results[0].quantity : 0;
          if (availableQuantity < quantity) {
            callback(new Error("Insufficient stock"), item.productID);
            return;
          }

          itemsChecked++;
          if (itemsChecked === items.length) {
            callback(null);
          }
        }
      );
    });
  }

  function insertSale(
    branchID,
    customerID,
    cashierID,
    paymentMethod,
    callback
  ) {
    const currentDateTime = new Date();
    connection.query(
      "INSERT INTO sale(`branchID`, `customer_ID`, `userID`, `Date_time`, `paymentmethod`) VALUES (?, ?, ?, ?, ?)",
      [branchID, customerID, cashierID, currentDateTime, paymentMethod],
      (err, result) => {
        if (err) {
          console.error("Error inserting sale data into MySQL database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        console.log("Sale data inserted successfully");
        const saleID = result.insertId;
        callback(saleID, items); // Call the callback with the saleID and items
      }
    );
  }

  function handleAfterSaleInsert(saleID, items) {
    // Perform the next query or operations using saleID
    console.log("Performing next operation with saleID:", saleID);
    let itemCount = 0;

    // Insert each item into saleproduct table
    items.forEach((item) => {
      const { productID, quantity, unitprice } = item;
      connection.query(
        "INSERT INTO saleproduct (`productID`, `saleID`, `quantity`, `unitprice`) VALUES (?, ?, ?, ?)",
        [productID, saleID, quantity, unitprice],
        (err, result) => {
          if (err) {
            console.error("Error inserting data into saleproduct:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          console.log("Data inserted into saleproduct successfully");

          itemCount++;
          if (itemCount === items.length) {
            reduceInventory(items, () => {
              // Once all items are inserted and inventory is reduced, send the success response
              res.status(200).json({
                message: "All items inserted successfully",
                data: saleID,
              });
            });
          }
        }
      );
    });
  }

  function reduceInventory(items, callback) {
    let inventoryCount = 0;

    // Reduce inventory for each item
    items.forEach((item) => {
      const { productID, quantity, stockID } = item;
      connection.query(
        "UPDATE inventory SET quantity = quantity - ? WHERE productID = ? && stockID = ?",
        [quantity, productID, stockID],
        (err, result) => {
          if (err) {
            console.error("Error reducing inventory:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          console.log("Inventory reduced successfully for stock:", stockID);

          // Increment the inventoryCount
          inventoryCount++;

          // Check if all inventory has been updated
          if (inventoryCount === items.length) {
            // Call the callback once inventory reduction is completed for all items
            callback();
          }
        }
      );
    });
  }
});

router.get("/getBranch", (req, res) => {
  //get all branch data
  connection.query(`SELECT branchID , branchName FROM branch `, (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.status(200).json({ branches: rows });
  });
});

router.put("/getCustomerID/:FirstName", (req, res) => {
  //get customerID from customer table using FirstName
  const FirstName = req.params.FirstName;
  connection.query(
    `SELECT customerID FROM customer WHERE userID = (SELECT userID FROM user WHERE FirstName = ? && Usertype = 'Customer')`,
    [FirstName],
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(200).json({ customerID: rows[0].customerID });
    }
  );
});

router.get("/getHistory", (req, res) => {
  //get all sales history data
  connection.query(
    `SELECT s.saleID, s.branchID,b.branchName, u.FirstName,DATE_FORMAT(s.date_time, '%Y/%m/%d  @%H:%i') as date_time
,sp.quantity,sp.unitprice,p.drugname, g.genericName,s.customer_ID FROM sale s JOIN saleproduct sp ON s.saleID = sp.saleID JOIN product p ON p.productID = sp.productID JOIN generic g ON g.genericID = p.genericID JOIN user u ON u.userID = s.userID JOIN branch b ON b.branchID = u.branchID`,
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(200).json({ history: rows });
    }
  );
});

router.get("/getCustomer", (req, res) => {
  //get customer data
  connection.query(
    `SELECT u.FirstName,c.customerID FROM user u JOIN customer c ON u.userID = c.userID WHERE Usertype = 'Customer'`,
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      res.status(200).json({ customers: rows });
    }
  );
});

router.get("/getCustomerHistory", (req, res) => {
  //get customer history of sales
  const userID = req.query.userID;

  if (!userID) {
    res.status(400).send("Bad Request: userID is required");
    return;
  }

  connection.query(
    //get customerID from customer table using userID
    `SELECT customerID FROM customer WHERE userID = ?`,
    [userID],
    (err, customerResult) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (customerResult.length === 0) {
        res.status(404).send("Customer not found");
        return;
      }

      const customerID = customerResult[0].customerID;

      connection.query(
        //get sales history of customer using customerID
        `SELECT s.saleID, s.branchID, b.branchName, u.FirstName,
                DATE_FORMAT(s.date_time, '%Y/%m/%d @%H:%i') as date_time,
                sp.quantity, sp.unitprice, p.drugname, g.genericName, s.customer_ID 
         FROM sale s 
         JOIN saleproduct sp ON s.saleID = sp.saleID 
         JOIN product p ON p.productID = sp.productID 
         JOIN generic g ON g.genericID = p.genericID 
         JOIN user u ON u.userID = s.userID 
         JOIN branch b ON b.branchID = u.branchID 
         WHERE s.customer_ID = ?
         ORDER BY s.saleID`,
        [customerID],
        (err, rows) => {
          if (err) {
            console.error("Error querying MySQL database:", err);
            res.status(500).send("Internal Server Error");
            return;
          }

          res.status(200).json({ history: rows });
        }
      );
    }
  );
});

module.exports = router;
