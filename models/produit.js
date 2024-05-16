const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const produitSchema = new Schema({
  produit_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model('produit', produitSchema);
