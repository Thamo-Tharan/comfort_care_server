const mongoose = require("mongoose");
const DressingTableschema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    path: { type: String, required: true, unique: true },
    price: { type: String, required: true, unique: true },
    offer: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    rating: { type: String, required: true },
  },
  { collection: "dressingTable" }
);
const model = mongoose.model("DressingTableschema", DressingTableschema);
module.exports = model;
