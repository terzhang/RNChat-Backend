const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define a chat schema
const chatSchema = new Schema(
  {
    message: {
      type: String
    },
    sender: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// define and associate a chat model with chatSchema
mongoose.model('Chat', chatSchema);
