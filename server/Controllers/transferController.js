const express = require("express");
const bodyParser = require("body-parser");
const connection = require("../db");

const router = express.Router();

router.use(bodyParser.json());

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

router.get("/getTransfer", (req, res) => {
  const { status } = req.query;
  let query = `
      SELECT 
          t.transferID,
          t.branchID,
          DATE_FORMAT(t.orderdate, '%Y-%m-%d') AS orderdate,
          DATE_FORMAT(t.confirmdate, '%Y-%m-%d') AS confirmdate,
          t.price,
          t.note,
          t.status,
          dt.productID,
          dt.quantity,
          dt.unitprice,
          b.branchName,
          p.drugname,
          g.genericName
      FROM transfer t 
      JOIN dispatchtransfer dt ON t.transferID = dt.transferID 
      JOIN product p ON dt.productID = p.productID 
      JOIN generic g ON p.genericID = g.genericID
      JOIN branch b ON t.branchID = b.branchID`;

  if (status) {
    query += ` WHERE t.status = ${connection.escape(status)}`;
  }

  connection.query(query, (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const transfers = rows.reduce((acc, row) => {
      const {
        transferID,
        branchID,
        orderdate,
        confirmdate,
        price,
        note,
        status,
        productID,
        drugname,
        genericName,
        quantity,
        unitprice,
        branchName,
      } = row;

      const transferIndex = acc.findIndex(
        (transfer) => transfer.transferID === transferID
      );

      if (transferIndex !== -1) {
        acc[transferIndex].products.push({
          productID,
          drugname,
          genericName,
          quantity,
          unitprice,
        });
      } else {
        acc.push({
          transferID,
          branchID,
          orderdate,
          confirmdate,
          price,
          note,
          status,
          branchName,
          products: [{ productID, drugname, genericName, quantity, unitprice }],
        });
      }
      return acc;
    }, []);

    res.status(200).json({ transfers });
  });
});

router.post("/submitRequest", (req, res) => {
  const { branchID, products, note, status } = req.body;

  // Insert the transfer
  connection.query(
    `INSERT INTO transfer (branchID, orderdate,note, status) VALUES (?, CURDATE(),?,?)`,
    [branchID, note, status],
    (err, result) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).json("Internal Server Error");
        return;
      }

      const transferID = result.insertId;
      // Insert each product into dispatchsupply
      const productInserts = products.map((product) => {
        return new Promise((resolve, reject) => {
          const { productID, quantity } = product;
          connection.query(
            `INSERT INTO dispatchtransfer (transferID, productID, quantity) VALUES (?, ?, ?)`,
            [transferID, productID, quantity],
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
  const { transferID, status, note, products } = req.body; // Extract data

  console.log(req.body);
  // Validate that products is an array
  if (!Array.isArray(products)) {
    return res.status(400).json("Invalid products data");
  }

  connection.query(
    `SELECT status FROM transfer WHERE transferID = ?`,
    [transferID],
    (err, results) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        return res.status(500).json("Internal Server Error");
      }

      if (results.length === 0) {
        return res.status(404).json("Order not found");
      }

      const currentStatus = results[0].status;

      if (currentStatus === "Pending") {
        // Begin transaction
        connection.beginTransaction((err) => {
          if (err) {
            console.error("Error starting MySQL transaction:", err);
            return res.status(500).json("Internal Server Error");
          }

          // Calculate the total price
          let totalPrice = 0;
          products.forEach((product) => {
            totalPrice += product.unitprice * product.quantity;
          });

          // Update transfer status, note, and total price
          const updateTransferQuery = `
            UPDATE transfer 
            SET status = ?, confirmdate = CURDATE(), note = ?, price = ?
            WHERE transferID = ?
          `;

          connection.query(
            updateTransferQuery,
            [status, note, totalPrice, transferID],
            (err, result) => {
              if (err) {
                console.error("Error updating transfer:", err);
                return connection.rollback(() => {
                  res.status(500).json("Internal Server Error");
                });
              }

              // Update each product's unit price and note
              const updateProductQueries = products.map((product) => {
                return new Promise((resolve, reject) => {
                  const { productID, unitprice, note } = product;
                  const updateProductQuery = `
                    UPDATE dispatchtransfer 
                    SET unitprice = ?
                    WHERE transferID = ? AND productID = ?
                  `;

                  connection.query(
                    updateProductQuery,
                    [unitprice, transferID, productID],
                    (err, result) => {
                      if (err) {
                        reject(err);
                      } else {
                        resolve();
                      }
                    }
                  );
                });
              });

              // Execute all product update queries
              Promise.all(updateProductQueries)
                .then(() => {
                  connection.commit((err) => {
                    if (err) {
                      console.error("Error committing MySQL transaction:", err);
                      return connection.rollback(() => {
                        res.status(500).json("Internal Server Error");
                      });
                    }
                    res.status(200).json("Transfer updated successfully");
                  });
                })
                .catch((err) => {
                  console.error("Error updating products:", err);
                  connection.rollback(() => {
                    res.status(500).json("Internal Server Error");
                  });
                });
            }
          );
        });
      } else {
        return res.status(400).json("Transfer status is not Pending");
      }
    }
  );
});

router.post("/updateConfirmed", (req, res) => {
  const { transferID, status, products, branchID } = req.body;
  console.log(req.body);

  connection.query(
    `SELECT status FROM transfer WHERE transferID = ?`,
    [transferID],
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
        let updateQuery = `UPDATE transfer SET status = ? WHERE transferID = ?`;
        let queryParams = [status, transferID];

        connection.query(updateQuery, queryParams, (err, result) => {
          if (err) {
            console.error("Error updating MySQL database:", err);
            return res.status(500).json("Internal Server Error");
          }

          const productUpdates = products.map((product) => {
            return new Promise((resolve, reject) => {
              const { productID, quantity, unitprice } = product;
              connection.query(
                `INSERT INTO inventory (productID, quantity, branchID, unitPrice) VALUES (?, ?, ?, ?)`,
                [productID, quantity, branchID, unitprice],
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
