const express = require("express");
const bodyParser = require("body-parser");
const connection = require("../db");

const router = express.Router();

router.use(bodyParser.json());

router.get("/getProduct", (req, res) => {
  //get all product data
  const { branches, inStock, category, page = 1, limit = 8 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      p.productID,
      p.drugname,
      g.genericName,
      c.categoryName,
      p.categoryID,
      p.image,
      i.quantity,
      i.unitprice,
      b.branchName,
      i.branchID
    FROM product p 
    JOIN generic g ON p.genericID = g.genericID 
    JOIN category c ON p.categoryID = c.categoryID 
    JOIN inventory i ON p.productID = i.productID 
    JOIN branch b ON i.branchID = b.branchID
  `;

  const conditions = [];
  if (branches) {
    const branchList = branches.split(",");
    conditions.push(
      `b.branchName IN (${branchList.map((b) => `'${b}'`).join(", ")})`
    );
  }
  if (inStock) {
    if (inStock === "true") {
      conditions.push("i.quantity > 0");
    } else if (inStock === "false") {
      conditions.push("i.quantity <= 0");
    }
  }
  if (category) {
    conditions.push(`c.categoryName = '${category}'`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  connection.query(query, (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).json({ products: rows });
  });
});

router.get("/getBranches", (req, res) => {
  //get all branch data
  connection.query("SELECT DISTINCT branchName FROM branch", (err, rows) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).json({ branches: rows });
  });
});

router.get("/getCategories", (req, res) => {
  //get all category data
  connection.query(
    "SELECT DISTINCT categoryName FROM category",
    (err, rows) => {
      if (err) {
        console.error("Error querying MySQL database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(200).json({ categories: rows });
    }
  );
});

module.exports = router;
