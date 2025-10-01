const express = require('express');
const router = express.Router();

// Example stub endpoint
router.get('/test', (req, res) => {
    res.json({ message: "Auth route working" });
});

module.exports = router;
