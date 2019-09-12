const express = require('express');
const router = express.Router();

// handler for post request from '/' route
router.route('/').post((req, res, next) => {
  username = localStorage.setItem('user', req.body.username);
});

module.exports = router;
