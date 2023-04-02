const mongoose = require("mongoose");
const Sofaschema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    path: { type: String, required: true, unique: true },
    price: { type: String, required: true, unique: true },
    offer: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    rating: { type: String, required: true },
  },
  { collection: "Sofa" }
);
const model = mongoose.model("Sofaschema", Sofaschema);
module.exports = model;
