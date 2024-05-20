const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ofSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    departements: [
      {
        type: [Schema.Types.ObjectId],
        ref: "departement",
        required: false,
      },
    ],
  },

  
  { timestamps: true }
);

module.exports = mongoose.model('of', ofSchema);
