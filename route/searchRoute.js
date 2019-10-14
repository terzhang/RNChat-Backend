// import modules
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User'); // get 'User' model from mongoose.
const router = express.Router(); // get Router from express to define data pathways

// '/users' endpoint handler
router.get('/users', async (req, res) => {
  console.log('someone searched for a user');
  // https://flaviocopes.com/express-get-query-variables/
  const { email } = req.query; // get email and pass from request query
  // validate data
  // onEmpty, send back error response
  if (!email) {
    return res.status(422).send({ error: 'Email cannot be empty' });
  }

  // validate email.
  // Try finding user by matching the supposed email with the ones in user Model
  const user = await User.findOne({ email: email }); // do that asynchronously
  // onInvalid, no such user in database
  if (!user) {
    return res.status(404).send(`${email} does not exist`);
  }

  if (!user.avatar) {
    user.avatar = null;
  }

  // send back the user info
  res.send({ _id: user.id, email, avatar: user.avatar });
});

module.exports = router; // export the express router
