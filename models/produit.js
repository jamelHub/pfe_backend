const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const produitSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  ofs: 
    {
      type: [Schema.Types.ObjectId],
      ref: "of",
      required: false,
    },
  
});

module.exports = mongoose.model("produit", produitSchema);
