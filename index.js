// register models to Mongoose
require('./models/Chat');
require('./models/User');

//import mongoose
const mongoose = require('mongoose');
// set up express app instance
const express = require('express'); // express module
const app = express(); // instance of express app
// import routes
const chatRouter = require('./route/chatRoute');
const loginRouter = require('./route/loginRoute');
// middlewares
const reqAuth = require('./middleware/reqAuth');
const socketAuth = require('./middleware/socketAuth');

// create http server using express
const server = require('http').createServer(app);

// import socket.io and have it listen to http server
const io = require('socket.io').listen(server);

const port = process.env.PORT || 3000; // assign port

// Middlewares:
// Data body parser for data going through the express app
app.use('/', express.json); // using built-in express.json as parser
// middleware for each path
app.use('/chats', chatRouter);
app.use('/login', loginRouter);

/* // Static files does not need to be generated, modified, or processed before delivery.L
app.use(express.static(__dirname + '/public')); // serve static file in the /public directory */

// database connection
const connect = require('./dbconnection');

// GET '/' root endpoint handler (meaning any GET request)
// perform callback(s): check requester's authorization with reqAuth first
// then another callback to send back response
// https://expressjs.com/en/5x/api.html#app.get.method
app.get(
  '/',
  (req, res, next) => requireAuth(req, res, next),
  (req, res) => {
    // req === { user: {email: "...", password: "..."} }
    res.send(`Email: ${req.user.email}`); // (res)pond with message back to requester
  }
);

const Chat = mongoose.model('Chat');

// Middleware for socket io:
// authenticate socket and give it callback function
io.use((socket, next) => socketAuth(socket, next));

// socket.io cheat sheet: https://socket.io/docs/emit-cheatsheet/
// handler for when a socket connection is established
io.on('connection', socket => {
  // While connected...
  // do callback for this socket connection
  console.log('User connected');

  // socket doc: https://socket.io/docs/server-api/#Socket
  // the on method: https://socket.io/docs/server-api/#socket-on-eventName-callback

  // handler for 'disconnect' event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // handler for 'typing' event
  socket.on('typing', data => {
    console.log(msg);
    // adding braodcast flag before emit will send data to everyone except the sender
    // https://socket.io/docs/server-api/#Flag-‘broadcast’
    socket.broadcast.emit('notifyTyping', {
      user: data.user,
      message: data.message
    });
  });

  // handler for chat message events
  socket.on('chat message', msg => {
    // broadcast received message to everyone in port except the sender
    io.broadcast.emit('chat message', msg);
    console.log('Broadcasted msg: ', msg);

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
