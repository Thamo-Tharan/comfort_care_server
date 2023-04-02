const mongoose = require("mongoose");
const Userschema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    mobilenumber: { type: String, required: true },
    gender: { type: String },
    address: { type: Array},
    whistlist: { type: Array},
  },
  { collection: "allUsers" }
);
const model = mongoose.model("Userschema", Userschema);
module.exports = model;
