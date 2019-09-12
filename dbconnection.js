// mongoose will handle the connection to the database
const mongoose = require('mongoose');
// replace mongoose's promise library with bluebird's
mongoose.Promise = require('bluebird');

// url to MongoDB database
/* const url = 'mongodb://localhost:27017/chat'; */
const url =
  'mongodb+srv://admin:130135793@main-lkpdj.azure.mongodb.net/test?retryWrites=true&w=majority';

// establish a connection from mongoose to the database
// https://mongoosejs.com/docs/connections.html
mongoose.connect(url, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});

// On successful connection
mongoose.connection.on('connected', () => {
  console.log('Connected to Mongo instance.');
});

// On error connection, we will receive an error obj
mongoose.connection.on('error', error => {
  console.error('Error to Mongo instance.', error);
});
