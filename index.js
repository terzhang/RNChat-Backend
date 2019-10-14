// register models to Mongoose
require('./models/Chat');
require('./models/Contact');
require('./models/User');

//import mongoose
const mongoose = require('mongoose');
// express app instance
const express = require('express');
// routes
const authRoute = require('./route/authRoute');
const contactRoute = require('./route/contactRoute');
const searchRoute = require('./route/searchRoute');
// middlewares
const reqAuth = require('./middleware/reqAuth');
const socketAuth = require('./middleware/socketAuth');

const app = express(); // instance of express app
// create http server using express
const server = require('http').createServer(app);

// import socket.io and have it listen to http server
const io = require('socket.io').listen(server);

const port = process.env.PORT || 3000; // assign port

// Middlewares:
// Data body parser for data going through the express app
app.use(express.json()); // using built-in express.json as parser
// middleware for each path
app.use(authRoute);
/* app.use('/chats', chatRoute); */
app.use(contactRoute);
app.use(searchRoute);

// database connection
require('./dbconnection');

// GET '/' root endpoint handler (meaning any GET request)
// perform callback(s): check requester's authorization with reqAuth first
// then another callback to send back response
// https://expressjs.com/en/5x/api.html#app.get.method
app.get(
  '/',
  (req, res, next) => reqAuth(req, res, next),
  (req, res) => {
    // req === { user: {email: "...", password: "..."} }
    res.send(`Email: ${req.user.email}`); // (res)pond with message back to requester
  }
);

/* // Middleware for socket io:
// authenticate socket and give it callback function
io.use((socket, next) => socketAuth(socket, next)); */

// socket.io cheat sheet: https://socket.io/docs/emit-cheatsheet/
// io is the global socket.io module
// this is a listener for all sockets on a socket 'connection'
io.on('connection', socket => {
  // While connected to this particular socket
  // socket doc: https://socket.io/docs/server-api/#Socket
  console.log('User connected');

  // the on method: https://socket.io/docs/server-api/#socket-on-eventName-callback

  // handler for the native 'disconnect' event
  socket.on('disconnect', () => {
    console.log('User disconnected');
    socket.leave(socket.room);
  });

  socket.on('joinRoom', data => {
    // data === {username, roomId, userId, ...targetId}
    const { username, userId, contactId } = data;
    console.log(data);
    // store username and room name in socket session
    socket.username = username;

    /* // https://stackoverflow.com/a/43998335/11389585
    // check if the roomId concatenated with userId first exist
    if (io.sockets.adapter.rooms[userId + contactId][userId + contactId]) {
      console.log(io.sockets.adapter.rooms[userId + contactId]);
      socket.roomId = userId + contactId;
    } else {
      console.log(io.sockets.adapter.rooms[contactId + userId]);
      socket.roomId = contactId + userId;
    } */

    // sort the room occupant ID then join them together as string for use as Room ID
    socket.roomId = [userId, contactId].sort().join('');

    socket.join(socket.roomId);
    // echo back that they have joined the room
    socket
      .to(socket.roomId)
      .emit('updateRoom', 'SERVER', 'you have connected to' + socket.roomId);
    console.log(username, 'has joined room, ' + socket.roomId);
  });

  socket.on('leaveRoom', data => {
    // data === {roomId, userId, ...targetId}
    // leave the current room (stored in session)
    socket.leave(socket.roomId);
    console.log('user ' + socket.username, 'has left room ' + socket.roomId);
    socket
      .to(socket.roomId)
      .emit('updateRoom', 'SERVER', socket.username + ' has left this room');
  });

  socket.on('switchRoom', data => {
    // data === {roomId, userId, ...targetId}
    // leave the current room (stored in session)
    socket.leave(socket.roomId);
    console.log('user ' + socket.username, 'has left room ' + socket.roomId);
    socket
      .to(socket.roomId)
      .emit('updateRoom', 'SERVER', socket.username + ' has left this room');

    // set the new roomId in socket session
    socket.roomId = data.roomId;
    // join new room
    socket.join(socket.roomId);
    socket
      .to(socket.roomId)
      .emit('updateRoom', 'SERVER', socket.username + ' has joined the room');
    console.log(
      'user ' + socket.username,
      'has switched to room ' + socket.roomId
    );
  });

  // handler for 'typing' event
  socket.on('isTyping', data => {
    /* console.log('someone is typing'); */
    // adding braodcast flag before emit will send data to everyone except the sender
    // https://socket.io/docs/server-api/#Flag-‘broadcast’
    socket.broadcast.to(socket.roomId).emit('notifyTyping', {
      user: data.user,
      message: data.message
    });
  });

  // handler for 'not typing' event
  socket.on('isNotTyping', data => {
    /* console.log('someone stopped typing'); */
    // relay to other users
    socket.broadcast.to(socket.roomId).emit('notifyNotTyping', {
      user: data.user,
      message: data.message
    });
  });

  // https://socket.io/docs/server-api/#socket-to-room
  // handler for chat message events
  socket.on('chat message', msg => {
    if (socket.roomId) {
      // broadcast received message to everyone in port except the sender
      socket.broadcast.to(socket.roomId).emit('chat message', msg);
      console.log('Broadcasted msg: ', msg);
    } else {
      socket.emit('chat message', { error: 'You are not in a room' });
    }

    /* 
    // make new Chat document with chatSchema
    const chatMessage = new Chat({ message: msg, sender: 'Anonymous' });
    // save it to the chat collection in the database
    chatMessage.save();
    */
  });
});

// start listening at the port
server.listen(port, () => {
  console.log('server running on port ' + port);
});
