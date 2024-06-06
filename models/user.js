const mongoose = require('mongoose');
var validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'invalid email'],
    unique: true,
  },
  matricule: {
    type: String,
    required: true,
    unique: true,
  },
  rfid: {
    type: String,
    required: false,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  administrator: {
    type: Boolean,
    default: false,
  },
  responsable: {
    type: Boolean,
    default: false,
  },
  departement: {
    type: String,
    default: false,
  },

  ////////////// relations ////////////
  produits: {
    type: [Schema.Types.ObjectId],
    ref: 'produit',
    required: false,
  },
});

module.exports = mongoose.model('user', userSchema);
