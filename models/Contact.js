const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  contactId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String
  }
});

// https://mongoosejs.com/docs/populate.html
// populated contact with userId from the 'User' model via reference.
const contactSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contacts: [profileSchema]
});

mongoose.model('Contact', contactSchema); // register to mongoose
