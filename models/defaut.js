const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const defautSchema = new Schema(
  {
    defaut_id: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },

    qtDefaux: {
      type: Number,
      default: 0,
    },
    totDefaux: {
      type: Number,
      default: 0,
    },
    departements: {
      type: [Schema.Types.ObjectId],
      ref: "departements",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('defaut', defautSchema);
