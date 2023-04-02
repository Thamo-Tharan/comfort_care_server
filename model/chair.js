const mongoose = require("mongoose");
const Chairschema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    path: { type: String, required: true, unique: true },
    price: { type: String, required: true, unique: true },
    offer: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    rating: { type: String, required: true },
  },
  { collection: "chair" }
);
const model = mongoose.model("Chairschema", Chairschema);
module.exports = model;
