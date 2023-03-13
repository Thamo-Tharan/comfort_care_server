const mongoose = require("mongoose");
const Parentquestion = new mongoose.Schema(
  {
    Question: { type: String, required: true },
    createdDate: { type: String },
    createdby: { type: String },
    color: { type: String },
    replayarray: { type: Array}
  },
  { collection: "Parentquestion" }
);
const model = mongoose.model("Parentquestion", Parentquestion);
module.exports = model;
