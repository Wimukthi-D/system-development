const express = require("express");
const bodyParser = require("body-parser");
const connection = require("../db");

const router = express.Router();

router.use(bodyParser.json());

router.get("/getStock", (req, res) => {
  // Query the database to get stock data
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

router.get("/getBranch", (req, res) => {
  connection.query(`SELECT branchID , branchName FROM branch `, (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // If no error, send the retrieved customer data in the response
    res.status(200).json({ branches: rows });
  });
});

router.get("/getRevenue", (req, res) => {
  const { timeRange, branchID } = req.query;

  let query;
  let queryParams = [];

  if (timeRange === "day") {
    query = `
        SELECT HOUR(s.date_time) as time, SUM(sp.quantity * sp.unitprice) as revenue, s.branchID
        FROM sale s
        JOIN saleproduct sp ON s.saleID = sp.saleID
        WHERE s.date_time >= NOW() - INTERVAL 1 DAY
      `;
  } else if (timeRange === "week") {
    query = `
        SELECT DATE(s.date_time) as time, SUM(sp.quantity * sp.unitprice) as revenue, s.branchID
        FROM sale s
        JOIN saleproduct sp ON s.saleID = sp.saleID
        WHERE s.date_time >= NOW() - INTERVAL 7 DAY
      `;
  } else if (timeRange === "month") {
    query = `
        SELECT WEEK(s.date_time) as time, SUM(sp.quantity * sp.unitprice) as revenue, s.branchID
        FROM sale s
        JOIN saleproduct sp ON s.saleID = sp.saleID
        WHERE s.date_time >= NOW() - INTERVAL 1 MONTH
      `;
  } else if (timeRange === "year") {
    query = `
        SELECT MONTH(s.date_time) as time, SUM(sp.quantity * sp.unitprice) as revenue, s.branchID
        FROM sale s
        JOIN saleproduct sp ON s.saleID = sp.saleID
        WHERE s.date_time >= NOW() - INTERVAL 1 YEAR
      `;
  } else {
    res.status(400).send("Invalid time range");
    return;
  }

  if (branchID) {
    query += " AND s.branchID = ?";
    queryParams.push(branchID);
  }

  query += " GROUP BY time, s.branchID ORDER BY time";

  connection.query(query, queryParams, (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    res.status(200).json({ Revenue: rows });
  });
});

module.exports = router;
