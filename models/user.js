const mongoose = require('mongoose');
var validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'invalid email'],
  },
  matricule: {
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
  defauts: {
    type: [Schema.Types.ObjectId],
    ref: 'defaut',
    required: false,
  },
  departements: {
    type: [Schema.Types.ObjectId],
    ref: 'departements',
    required: false,
  },
  ofs: {
    type: [Schema.Types.ObjectId],
    ref: 'of',
    required: false,
  },
  produits: {
    type: [Schema.Types.ObjectId],
    ref: 'produit',
    required: false,
  },
});

module.exports = mongoose.model('user', userSchema);
