// import modules
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User'); // get 'User' model from mongoose.
const Contact = mongoose.model('Contact');
const router = express.Router(); // get Router from express to define data pathways

// '/signup' endpoint handler
// for requester to POST and sign up for a new user entry in database collection
router.post('/signup', async (req, res) => {
  console.log('sign up');
  // req receives data from express (parsed as json due to body-parser)
  const { email, password } = req.body;

  try {
    // onSave
    // feed User model the data its schema wants.
    const user = new User({ email, password }); // now the User model in Mongoose has the collection of data {email, password}
    await user.save(); // asynchronously save it forward to MongoDB from User model

    const contact = new Contact({ userId: user._id, contacts: [] });
    contact.save();

    // postSave
    // https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim
    // make json web token for user on success
    const token = jwt.sign({ userId: user.id }, 'SECRET_KEY'); // arg1: info to encode inside, arg2: a key to sign token
    // respond back to POST requester with a JWT and user id
    res.send({ token, userId: user._id });

    // onError
  } catch (error) {
    // respond back to API POST caller status code 422 and an error message to API POST caller.
    res.status(422).send(error.message);
  }
});

// '/signin' endpoint handler
// for requester to POST and sign into their own profile and get jwt
router.post('/signin', async (req, res) => {
  console.log('log in');
  // get data
  const { email, password } = req.body; // get email and pass from request body

  // validate data
  // onEmpty, send back error response
  if (!email || !password) {
    return res.status(422).send({ error: 'Email or Password cannot be empty' });
  }

  // validate email.
  // Try finding user by matching the supposed email with the ones in user Model
  const user = await User.findOne({ email: email }); // do that asynchronously

  // onInvalid, no such user in database
  if (!user) {
    return res.status(404).send({ error: 'Invalid Email or Password' }); // ! don't misspell status as state.
  }

  // validate password
  try {
    // try validating given password with our store hashed password via the method previously defined in User
    await user.comparePassword(password); // this returns a promise which potentially outputs error
    // onSuccess, generate json web token with encoded data and a key
    const token = jwt.sign({ userId: user.id }, 'SECRET_KEY');
    // respond back to POST requester with a JWT and user id
    res.send({ token, userId: user._id });
  } catch (error) {
    // onError, respond back with error
    return res.status(422).send({ error: 'Invalid Email or Password' });
  }
});

module.exports = router; // export the express router
