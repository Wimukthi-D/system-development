const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post("/request", (req, res) => { 
    const { token, items } = req.body;

    try {
        const decoded = jwt.verify(token, 'JWTSecret');
    
        const responseItems = items.map(item => {
            const newItem = { ...item };
            if (item.userID) newItem.userID = decoded.id;
            if (item.branchID) newItem.branchID = decoded.branchID; 
            if (item.FirstName) newItem.FirstName = decoded.FirstName; 
            if (item.Usertype) newItem.Usertype = decoded.role; 
            return newItem;
        });

        res.json({ items: responseItems });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

module.exports = router;
