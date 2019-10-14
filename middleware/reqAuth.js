const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// validate the json web token and authenticate User
const reqAuth = (req, res, next) => {
  // inspect the incoming (req)uest
  // ! it's headers not header, mind the 's'
  const { authorization } = req.headers; // get authorization header from the request

  // (res)pond accordingly
  if (!authorization) {
    return res.status(401).send({ error: 'No authority, try logging in.' });
  }

  // Note: authorization === `Bearer ${token}`
  const STR_SPACE = ' ';
  const STR_EMPTY = '';
  // replace everything before token with an empty string in Authorization field.
  const token = authorization.replace('Bearer' + STR_SPACE, STR_EMPTY);

  // verify jwt with key, then use its output as callback to function
  jwt.verify(token, 'SECRET_KEY', async (error, payload) => {
    // onError, the verification failed. respond accordingly
    if (error) {
      return res
        .status(401)
        .send({ error: 'Something is wrong, try logging in.' });
    }

    // now that the token and key are valid means this is an existing user.
    // get the existing user profile within the User model in mongoose
    const { userId } = payload;
    const user = await User.findById(userId); // find it via matching id with payload's id
    req.user = user; // put user profile in the request body for the next middleware.

    next(); // move onto next middleware.
  });
};
module.exports = reqAuth;
