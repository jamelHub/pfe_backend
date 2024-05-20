const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const defautSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },

    qtDefaux: {
      type: Number,
      default: 0,
    },
    totDefaux: {
      type: Number,
      default: 0,
    },
    departement: {
      type: [Schema.Types.ObjectId],
      ref: "departement",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("defaut", defautSchema);
