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
// import routes
const chatRouter = require('./route/chatRoute');
const loginRouter = require('./route/loginRoute');
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


const Chat = mongoose.model('Chat');
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
