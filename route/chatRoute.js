const express = require('express');
const connect = require('../dbconnection');
const Chat = require('../models/Chat');

const router = express.Router(); // declare the router from express

// handler for get request from '/' route
router.route('/').get((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;

  // connect to database, then callback on promise success
  // https://mongoosejs.com/docs/connections.html#callback
  connect.then(db => {
    /* let data = Chats.find({ message: 'Anonymous' }); */

    // fetch all messages from Chat collection
    // then callback on promise success
    Chat.find({}).then(chat => {
      // res.json() formats the json then calls res.send()
      // https://stackoverflow.com/questions/19041837/difference-between-res-send-and-res-json-in-express-js
      res.json(chat); // respond back with the chat document
    });
  });
});

module.exports = router;
