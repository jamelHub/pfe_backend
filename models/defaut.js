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

    nbre_produit: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('defaut', defautSchema);
