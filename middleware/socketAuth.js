const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// validate the json web token and authenticate User
const socketAuth = (socket, callback) => {
  // get Authentication token from extra header from client.
  const authorization = socket.handshake.headers['Authentication'];

  if (!authorization) {
    return callback(new Error('No authority, try logging in.'));
  }

  // Note: authorization === `Bearer ${token}`
  const STR_SPACE = ' ';
  const STR_EMPTY = '';
  const token = authorization.replace('Bearer' + STR_SPACE, STR_EMPTY);

  // verify jwt with key, then use its output as callback to function
  jwt.verify(token, 'SECRET_KEY', async (error, payload) => {
    // onError, the verification failed. respond accordingly
    if (error) {
      return callback(new Error('Token invalid'));
    }
    return callback(payload);
  });
};

module.exports = socketAuth;
