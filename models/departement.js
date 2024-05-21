const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departementSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  fichiers: 
    {
      type: [Schema.Types.ObjectId],
      ref: "fichier",
      required: false,
    },

});

module.exports = mongoose.model('departement', departementSchema);
