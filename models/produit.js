const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const produitSchema = new Schema({
  produit_id: {
    type: String,
    required: true,
  },
  produit_name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('produit', produitSchema);
