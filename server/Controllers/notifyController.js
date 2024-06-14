const express = require("express");
const bodyParser = require("body-parser");
const connection = require("../db");

const router = express.Router();

router.use(bodyParser.json());

router.get("/lowStock", (req, res) => {
  connection.query(
    `
        SELECT
        p.drugname,
        g.genericName,
        b.branchName,
        i.quantity
        FROM 
        inventory i 
        JOIN product p 
        ON p.productID = i.productID 
        JOIN
        branch b 
        ON b.branchID = i.branchID
        JOIN generic g 
        ON g.genericID = p.genericID
        WHERE i.quantity < p.restock_level`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.status(200).json({ data: result });
      }
    }
  );
});

router.get("/expiringStock", (req, res) => {
  connection.query(
    `
            SELECT
            p.drugname,
            g.genericName,
            b.branchName,
            i.expireDate
            FROM 
            inventory i 
            JOIN product p 
            ON p.productID = i.productID 
            JOIN
            branch b 
            ON b.branchID = i.branchID
            JOIN generic g 
            ON g.genericID = p.genericID
            WHERE i.expireDate < DATE_ADD(CURDATE(), INTERVAL 3 MONTH)`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.status(200).json({ data: result });
      }
    }
  );
});

module.exports = router;
