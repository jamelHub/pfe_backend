const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departementSchema = new Schema({
  departement_id: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('departement', departementSchema);
