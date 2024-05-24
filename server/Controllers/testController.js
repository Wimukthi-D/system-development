// testController.js

const db = require('../db'); // Import your database module

const addTest = (req, res) => {
    const sql = "INSERT INTO Test (`Username`, `Password`) VALUES (?, ?)";
    const values = [req.body.username, req.body.password];
    db.query(sql, values, (err, result) => {
        if(err){
            return res.json("ERROR veffef");
        }
        return res.json(result); 
    });
};

module.exports = { addTest };
