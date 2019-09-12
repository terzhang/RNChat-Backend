const express = require('express');
const app = express();
// register models to Mongoose
require('./models/Chat');
require('./models/User');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
port = 3000;

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
