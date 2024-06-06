const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  tokenExpiration: {
    type: Number,
    required: true,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
});

module.exports = mongoose.model('session', sessionSchema);
