const express = require('express');
const app = express();
// register models to Mongoose
require('./models/Chat');
require('./models/User');

//import mongoose
const mongoose = require('mongoose');
// set up express app instance
const express = require('express'); // express module
const app = express(); // instance of express app
// create http server using express
const server = require('http').createServer(app);

// import socket.io and have it listen to http server
const io = require('socket.io').listen(server);

const port = process.env.PORT || 3000; // assign port

// Middlewares:
// Data body parser for data going through the express app
app.use('/', express.json); // using built-in express.json as parser

/* // Static files does not need to be generated, modified, or processed before delivery.L
app.use(express.static(__dirname + '/public')); // serve static file in the /public directory */

// database connection
const connect = require('./dbconnection');


const Chat = mongoose.model('Chat');
io.on('connection', socket => {
  console.log('User connected');
  // turn the socket on at this connection
  socket.on('chat message', msg => {
    console.log(msg);
    io.emit('chat message', msg); // emit msg to all client listening to this socket.io server
  });
});

server.listen(port, () => {
  console.log('server running on port ' + port);
});
