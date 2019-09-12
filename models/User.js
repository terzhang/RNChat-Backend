const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // make sure to also install node-gyp and windows-build-tools

// create a Schema that tells mongoose,
// how the model/structure of a collection of data inside the mongoDB database look like.
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// pre-save hook executed  (using callback function() to access to 'this')
userSchema.pre('save', function(next) {
  const user = this; // get user model instance from user schema (model instance = Mongoose document)
  if (!user.isModified('password')) {
    return next();
  } // if password is unmodified, go to next middleware

  // onSuccess, generate a salt and hash it using bcrypt
  // then, with its outputs (error, salt) as argument, call callback function.
  bcrypt.genSalt(10, (error, salt) => {
    if (error) {
      return next(error);
    } // on error, go to next middleware

    // onSuccess, hash the password and salt into (hash)
    // then, with its outputs (error, hash) as argument, call callback function.
    bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) {
        return next(error);
      } // on error, go to next middleware

      // onSuccess, replace our password in model with the (password + salt) hash
      user.password = hash;
      next(); // don't forget to go to next middleware.
    });
  });
});

// password checking by matching the requester's hash with our's (using function() to have access to 'this')
userSchema.methods.comparePassword = function(supposedPassword) {
  const user = this; // instance model (document) of user from userSchema

  // make a promise that outputs resolve, reject as argument to callback function
  return new Promise((resolve, reject) => {
    // compare the supposed password given by requester with the user's in model
    // then, with its outputs (error, isMatch) as argument, call callback function
    bcrypt.compare(supposedPassword, user.password, (error, isMatch) => {
      if (error) {
        return reject(error);
      } // reject promise with error onError
      if (!isMatch) {
        return reject(false);
      } // reject promise with falsehood onFalse

      // onSuccess, resolve the promise as true
      resolve(true);
    });
  });
};

// define the 'User' model with userSchema in Mongoose
mongoose.model('User', userSchema); // only to be executed once to associate to mongoose instance.
