const mongoose = require("mongoose");
const Createquestions = new mongoose.Schema(
  {
    Question: { type: String, required: true },
    createdDate: { type: String },
    createdby: { type: String },
    color: { type: String },
    replayenabled: { type: String, default: "No" }
  },
  { collection: "Createquestions" }
);
const model = mongoose.model("Createquestions", Createquestions);
module.exports = model;
