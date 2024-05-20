const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departementSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  defauts: [
    {
      type: [Schema.Types.ObjectId],
      ref: "defaut",
      required: false,
    },
  ],
});

module.exports = mongoose.model('departement', departementSchema);
