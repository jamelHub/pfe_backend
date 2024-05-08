const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ofSchema = new Schema(
  {
    of_id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('of', ofSchema);
