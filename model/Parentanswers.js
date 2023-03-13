const mongoose = require("mongoose");
const Parentaswers = new mongoose.Schema(
  {
    parentid: { type: String, required: true },
    Answer: { type: String, required: true },
    createdDate: { type: String },
    createdby: { type: String },
    color: { type: String },
  },
  { collection: "Parentaswers" }
);
const model = mongoose.model("Parentaswers", Parentaswers);
module.exports = model;
