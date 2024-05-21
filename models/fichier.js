const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fichierSchema = new Schema(
  {
    defauts: 
      {
        type: [Schema.Types.ObjectId],
        ref: "defaut",
        required: false,
      },
    
    user: {
      type: [Schema.Types.ObjectId],
      ref: "user",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("fichier", fichierSchema);
