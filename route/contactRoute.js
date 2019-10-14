// import modules
const express = require('express');
const mongoose = require('mongoose');
const reqAuth = require('../middleware/reqAuth');

const Contact = mongoose.model('Contact'); // get 'User' model from mongoose.
const router = express.Router(); // get Router from express to define data pathways

// require the user to be authenticated first before using this route
router.use(reqAuth);

// handler for '/contacts' GET endpoint
router.get('/contacts', async (req, res) => {
  const user = req.user; // get the user that the contact belongs to
  try {
    // find the contacts associated with this user's id
    const contacts = await Contact.find({ userId: user._id });
    // echo back the contacts collection
    res.send(contacts);
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.post('/contacts', async (req, res) => {
  const user = req.user; // get the user that the contact belongs to
  const { email, contactId } = req.body;

  // make sure the require info is there
  if (!email || !contactId) {
    return res.status(422).send({ error: 'You must provide an email and id' });
  }

  // save to database
  try {
    const newContact = {
      contactId,
      email,
      avatar
    };
    const filter = { _id: user.id, 'contacts.contactId': contactId };
    const options = { upsert: false };
    const callback = (error, writeOpResult) => {
      res.send(error);
    };
    // https://docs.mongodb.com/manual/reference/operator/update/
    // https://docs.mongodb.com/manual/reference/operator/update/positional/
    // https://mongoosejs.com/docs/api.html#model_Model.update
    Contact.update(
      filter,
      { $push: { contacts: newContact } },
      options,
      callback
    );

    // onSuccess, respond back to request, let them know it went through.
    res.send('Added ' + email + ' to your contacts.');
    // there could be an error saving data to database
  } catch (error) {
    // onError, send back the error.
    res.status(422).send(error);
  }
});

module.exports = router;
