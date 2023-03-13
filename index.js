const express = require("express");
const app = express();
const port = 4000;
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
mongoose.set("strictQuery", true);
const bodyparser = require("body-parser");
const registerUserSchema = require("./model/user");
//connection to mongoose
mongoose.connect("mongodb://localhost:27017/comfort-and-care", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const JWT_SCRECT = "JJd5j<vqb||]:idU|kd)h7kV?wr_lfaC";
const JWT_REFERSH = '2VW,"Dz`|G{%"jH|S@CCHH*Fi9vR8T<(';
app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
//Creating a new User
app.post("/comfort-and-care/createnewuser", async (req, res) => {
  const { username, email, mobilenumber, passworddata } = req.body;
  const password = await bcrypt.hash(passworddata, 10);
  try {
    const response = await registerUserSchema.create({
      username,
      email,
      password,
      mobilenumber,
    });
    myObjectId = response._id;
    myObjectIdString = myObjectId.toString();
    const access_token = jwt.sign(
        { id: myObjectIdString, username: response.username },
        JWT_REFERSH
      );
      const token = jwt.sign(
        {
          id: myObjectIdString,
          username: response.username,
          access_token: access_token,
        },
        JWT_SCRECT
      );
      res
        .cookie("access_token", token, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        })
        .status(200)
        .send({
          status: "200",
          message: "Success",
          userinfo: {
            id: myObjectIdString,
            username: response.username,
            access_token: access_token,
          },
        });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      res.status(404).send({
        error: "User already avaliable",
        satus: "404",
        message: "Try different username / email address",
      });
    } else {
      res.send(error);
    }
  }
});
//Validate username and password
app.post("/comfort-and-care/login", async (req, res) => {
  const { username, passworddata } = req.body;
  const user = await registerUserSchema.findOne({ username }).lean();
  console.log(user);
  if (!user) {
    res.status(404).send({ status: "404", message: "invalid username" });
  } else {
    myObjectId = user._id;
    myObjectIdString = myObjectId.toString();
    console.log(myObjectIdString);
    if (await bcrypt.compare(passworddata, user.password)) {
      const access_token = jwt.sign(
        { id: myObjectIdString, username: user.username },
        JWT_REFERSH
      );
      const token = jwt.sign(
        {
          id: myObjectIdString,
          username: user.username,
          access_token: access_token,
        },
        JWT_SCRECT
      );
      res
        .cookie("access_token", token, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        })
        .status(200)
        .send({
          status: "200",
          message: "Success",
          userinfo: {
            id: myObjectIdString,
            username: user.username,
            access_token: access_token,
          },
        });
    } else {
      res.status(404).send({ status: "404", message: "invalid Password" });
    }
  }
});
//server running port
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
