const express = require("express");
const bodyParser = require("body-parser");
const connection = require("../db");

const router = express.Router();

router.use(bodyParser.json());

router.get("/getSupplier", (req, res) => {
  connection.query(
    ` SELECT
    s.supplierID,
    u.userID,
    u.FirstName,
    u.LastName,
    u.email
FROM 
    supplier s
JOIN 
    user u ON u.userID = s.userID`,
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(200).json({ suppliers: rows });
    }
  );
});

router.get("/getSupplierProducts", (req, res) => {
  const supplierID = req.query.supplierID;
  connection.query(
    `SELECT sp.productID, p.drugname,g.genericName FROM supplyproduct sp JOIN product p ON sp.productID = p.productID JOIN generic g ON g.genericID = p.genericID WHERE supplierID = ?`,
    [supplierID],
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(200).json({ products: rows });
    }
  );
});

router.get("/getProduct", (req, res) => {
  connection.query(
    `SELECT p.productID,p.drugname,g.genericName  FROM product p JOIN generic g ON p.genericID = g.genericID`,
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(200).json({ products: rows });
    }
  );
});

router.post("/Assign", (req, res) => {
  const { productID, supplierID } = req.body;

  // Check if the combination of supplierID and productID already exists
  connection.query(
    `SELECT * FROM supplyproduct WHERE productID = ? AND supplierID = ?`,
    [productID, supplierID],
    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }

      if (results.length > 0) {
        // If the combination exists, send a response indicating the product is already assigned to the supplier
        res
          .status(409)
          .json({ message: "Product already assigned to this supplier" });
      } else {
        // If the combination does not exist, insert the new record
        connection.query(
          `INSERT INTO supplyproduct (productID, supplierID) VALUES (?, ?)`,
          [productID, supplierID],
          (err, result) => {
            if (err) {
              console.error("Error querying MySQL database:", err);
              res.status(500).send("Internal Server Error");
              return;
            }
            res.status(200).json({ message: "Product assigned successfully" });
          }
        );
      }
    }
  );
});

router.get("/getOrder", (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT 
      o.orderID,
      u.FirstName, 
      u.LastName,
      o.supplierID,
      u.userID, 
      DATE_FORMAT(o.orderDate, '%Y/%m/%d') as orderdate,
      DATE_FORMAT(o.approveDate, '%Y/%m/%d') as approvedate,
      DATE_FORMAT(o.deliverDate, '%Y/%m/%d') as deliverdate,
      DATE_FORMAT(o.receiveDate, '%Y/%m/%d') as receivedate,
      o.price,
      o.note,
      o.status,
      ds.productID,
      p.drugname,
      g.genericName,
      ds.quantity,
      ds.unitprice
    FROM orders o 
    JOIN dispatchsupply ds ON o.orderID = ds.orderID 
    JOIN product p ON ds.productID = p.productID 
    JOIN generic g ON p.genericID = g.genericID 
    JOIN supplier s ON o.supplierID = s.supplierID 
    JOIN user u ON u.userID = s.userID`;

  if (status) {
    query += ` WHERE o.status = ${connection.escape(status)}`;
  }

  connection.query(query, (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const orders = rows.reduce((acc, row) => {
      const {
        orderID,
        FirstName,
        LastName,
        userID,
        orderdate,
        approvedate,
        deliverdate,
        receivedate,
        price,
        note,
        status,
        productID,
        drugname,
        genericName,
        quantity,
        unitprice,
      } = row;

      const orderIndex = acc.findIndex((order) => order.orderID === orderID);
      if (orderIndex !== -1) {
        acc[orderIndex].products.push({
          productID,
          drugname,
          genericName,
          quantity,
          unitprice,
        });
      } else {
        acc.push({
          orderID,
          FirstName,
          LastName,
          userID,
          orderdate,
          approvedate,
          deliverdate,
          receivedate,
          price,
          note,
          status,
          products: [{ productID, drugname, genericName, quantity, unitprice }],
        });
      }
      return acc;
    }, []);

    res.status(200).json({ orders });
  });
});

router.get("/getSpecificOrder", (req, res) => {
  const { status, userID } = req.query;
  let query = `
    SELECT 
      o.orderID,
      u.FirstName, 
      u.LastName,
      o.supplierID,
      DATE_FORMAT(o.orderDate, '%Y/%m/%d') as orderdate,
      DATE_FORMAT(o.approveDate, '%Y/%m/%d') as approvedate,
      DATE_FORMAT(o.deliverDate, '%Y/%m/%d') as deliverdate,
      DATE_FORMAT(o.receiveDate, '%Y/%m/%d') as receivedate,
      o.price,
      o.note,
      o.status,
      ds.productID,
      p.drugname,
      g.genericName,
      ds.quantity,
      ds.unitprice
    FROM orders o 
    JOIN dispatchsupply ds ON o.orderID = ds.orderID 
    JOIN product p ON ds.productID = p.productID 
    JOIN generic g ON p.genericID = g.genericID 
    JOIN supplier s ON o.supplierID = s.supplierID 
    JOIN user u ON u.userID = s.userID WHERE u.userID =  ${connection.escape(
      userID
    )}`;
  if (status) {
    query += ` AND o.status = ${connection.escape(status)}`;
  }

  connection.query(query, (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const orders = rows.reduce((acc, row) => {
      const {
        orderID,
        FirstName,
        LastName,
        orderdate,
        approvedate,
        deliverdate,
        receivedate,
        price,
        note,
        status,
        productID,
        drugname,
        genericName,
        quantity,
        unitprice,
      } = row;

      const orderIndex = acc.findIndex((order) => order.orderID === orderID);
      if (orderIndex !== -1) {
        acc[orderIndex].products.push({
          productID,
          drugname,
          genericName,
          quantity,
          unitprice,
        });
      } else {
        acc.push({
          orderID,
          FirstName,
          LastName,
          orderdate,
          approvedate,
          deliverdate,
          receivedate,
          price,
          note,
          status,
          products: [{ productID, drugname, genericName, quantity, unitprice }],
        });
      }
      return acc;
    }, []);

    res.status(200).json({ orders });
  });
});

router.post("/CreateOrder", (req, res) => {
  const { supplierID, products, additionalInfo, status, approvedate } =
    req.body;

  let newApproveDate = null;

  if (approvedate === true) {
    newApproveDate = new Date();
  } else {
    newApproveDate = null;
  }

  console.log(newApproveDate);
  // Insert the order
  connection.query(
    `INSERT INTO orders (supplierID, orderDate,approveDate ,note, status) VALUES (?, CURDATE(), ?, ? ,?)`,
    [supplierID, newApproveDate, additionalInfo, status],
    (err, result) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).json("Internal Server Error");
        return;
      }

      const orderID = result.insertId;
      // Insert each product into dispatchsupply
      const productInserts = products.map((product) => {
        return new Promise((resolve, reject) => {
          const { productID, quantity, unitprice } = product;
          connection.query(
            `INSERT INTO dispatchsupply (orderID, productID, quantity, unitprice) VALUES (?, ?, ?, ?)`,
            [orderID, productID, quantity, unitprice],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            }
          );
        });
      });

      Promise.all(productInserts)
        .then(() => {
          res.status(200).json("Order created successfully");
        })
        .catch((err) => {
          console.error("Error inserting products into dispatchsupply:", err);
          res.status(500).json("Internal Server Error");
        });
    }
  );
});

router.post("/updatePending", (req, res) => {
  const { orderID, status } = req.body;

  connection.query(
    `SELECT status FROM orders WHERE orderID = ?`,
    [orderID],
    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).json("Internal Server Error");
        return;
      }

      if (results.length === 0) {
        res.status(404).json("Order not found");
        return;
      }

      const currentStatus = results[0].status;
      if (currentStatus === "Pending") {
        const updateQuery = `
          UPDATE orders 
          SET status = ?, approvedate = ? 
          WHERE orderID = ?
        `;
        const approvedDate = new Date();

        connection.query(
          updateQuery,
          [status, approvedDate, orderID],
          (err, result) => {
            if (err) {
              console.error("Error updating MySQL database:", err);
              res.status(500).json("Internal Server Error");
              return;
            }
            res.status(200).json("Order updated successfully");
          }
        );
      } else {
        res.status(400).json("Order status is not pending");
      }
    }
  );
});

router.post("/updateApproved", async (req, res) => {
  const { orderID, status, note, unitPrices, price } = req.body.data;
  connection.query(
    `SELECT status FROM orders WHERE orderID = ?`,
    [orderID],

    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        return res.status(500).json("Internal Server Error");
      }

      if (results.length === 0) {
        return res.status(404).json("Order not found");
      }

      const currentStatus = results[0].status;

      if (currentStatus === "Approved") {
        const updateQuery = `
          UPDATE orders
          SET status = ?, note = ?, price = ?
          WHERE orderID = ?
        `;
        connection.query(
          updateQuery,
          [status, note, price, orderID],
          (err, result) => {
            if (err) {
              console.error("Error updating MySQL database:", err);
              return res.status(500).json("Internal Server Error");
            }
          }
        );

        const updateUnitPrices = unitPrices.map((unitPrice) => {
          return new Promise((resolve, reject) => {
            const { productID, unitprice } = unitPrice;
            connection.query(
              `UPDATE dispatchsupply SET unitprice = ? WHERE orderID = ? AND productID = ?`,
              [unitprice, orderID, productID],
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              }
            );
          });
        });

        Promise.all(updateUnitPrices)
          .then(() => {
            return res.status(200).json("Order updated successfully");
          })
          .catch((err) => {
            console.error("Error updating unit prices:", err);
            return res.status(500).json("Internal Server Error");
          });
      } else {
        return res.status(400).json("Order status is not Approved");
      }
    }
  );
});

router.post("/updatePrice", (req, res) => {
  const { orderID, status } = req.body;

  connection.query(
    // Check if status is "Shipped"
    `SELECT status FROM orders WHERE orderID = ?`,
    [orderID],
    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        return res.status(500).json("Internal Server Error");
      }

      if (results.length === 0) {
        return res.status(404).json("Order not found");
      }

      const currentStatus = results[0].status;

      if (currentStatus === "Price Updated") {
        const updateQuery = `
          UPDATE orders 
          SET status = ? 
          WHERE orderID = ?
        `;

        connection.query(updateQuery, [status, orderID], (err, result) => {
          if (err) {
            console.error("Error updating MySQL database:", err);
            return res.status(500).json("Internal Server Error");
          }
          return res.status(200).json("Order updated successfully");
        });
      } else {
        return res.status(400).json("Order status is not Price Updated");
      }
    }
  );
});

router.post("/updateConfirmed", (req, res) => {
  const { orderID, status, deliverDate, note } = req.body.data; // Extract data

  if (status !== "Shipped") {
    // Check if status is "Shipped"
    return res.status(400).json("Invalid status");
  }

  connection.query(
    `SELECT status FROM orders WHERE orderID = ?`,
    [orderID],
    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        return res.status(500).json("Internal Server Error");
      }

      if (results.length === 0) {
        return res.status(404).json("Order not found");
      }

      const currentStatus = results[0].status;

      if (currentStatus === "Confirmed") {
        // Check if current status is "Confirmed"
        const updateQuery = `
          UPDATE orders 
          SET status = ?, deliverdate = ?, note = ? 
          WHERE orderID = ?
        `;

        connection.query(
          updateQuery,
          [status, deliverDate, note, orderID],
          (err, result) => {
            if (err) {
              console.error("Error updating MySQL database:", err);
              return res.status(500).json("Internal Server Error");
            }
            return res.status(200).json("Order updated successfully");
          }
        );
      } else {
        return res.status(400).json("Order status is not Confirmed");
      }
    }
  );
});

router.post("/updateShipped", (req, res) => {
  const { orderID, status } = req.body;

  connection.query(
    `SELECT status FROM orders WHERE orderID = ?`,
    [orderID],
    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        return res.status(500).json("Internal Server Error");
      }

      if (results.length === 0) {
        return res.status(404).json("Order not found");
      }

      const currentStatus = results[0].status;

      if (currentStatus === "Shipped") {
        const updateQuery = `
          UPDATE orders 
          SET status = ?, receivedate = CURDATE()
          WHERE orderID = ?
        `;

        connection.query(updateQuery, [status, orderID], (err, result) => {
          if (err) {
            console.error("Error updating MySQL database:", err);
            return res.status(500).json("Internal Server Error");
          }
          return res.status(200).json("Order updated successfully");
        });
      } else {
        return res.status(400).json("Order status is not Confirmed");
      }
    }
  );
});

router.post("/updateReceived", (req, res) => {
  const { orderID, status, products } = req.body;

  connection.query(
    `SELECT status FROM orders WHERE orderID = ?`,
    [orderID],
    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        return res.status(500).json("Internal Server Error");
      }

      if (results.length === 0) {
        return res.status(404).json("Order not found");
      }

      const currentStatus = results[0].status;

      if (currentStatus === "Received" || currentStatus === "Shipped") {
        let updateQuery;
        let queryParams = [status, orderID];

        if (currentStatus === "Shipped") {
          updateQuery = `UPDATE orders SET status = ?, receiveDate = CURDATE() WHERE orderID = ?`; 
        } else {
          updateQuery = `UPDATE orders SET status = ? WHERE orderID = ?`;
        }

        connection.query(updateQuery, queryParams, (err, result) => {
          if (err) {
            console.error("Error updating MySQL database:", err);
            return res.status(500).json("Internal Server Error");
          }

          const productUpdates = products.map((product) => {
            return new Promise((resolve, reject) => {
              const { productID, quantity, unitprice } = product;
              connection.query(
                `INSERT INTO inventory (productID, quantity, branchID, unitPrice) VALUES (?, ?, 1, ?)`,
                [productID, quantity, unitprice],
                (err, result) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(result);
                  }
                }
              );
            });
          });

          Promise.all(productUpdates)
            .then(() => {
              return res
                .status(200)
                .json("Order and inventory updated successfully");
            })
            .catch((err) => {
              console.error("Error updating product quantities:", err);
              return res.status(500).json("Internal Server Error");
            });
        });
      } else {
        return res.status(400).json("Order status is not valid");
      }
    }
  );
});

router.post("/debug", (req, res) => {
  console.log(req.body);
  const { unitprice, orderID } = req.body;
  res.status(200).json("Received");

  connection.query(
    `UPDATE dispatchsupply SET unitprice = ? WHERE orderID = ?`,
    [unitprice, orderID],
    (err, result) => {
      if (err) {
        console.error("Error updating MySQL database:", err);
        return;
      }
    }
  );
});

module.exports = router;
