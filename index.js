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
const nodemailer = require("nodemailer");
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
//forgot password email
app.post("/comfort-and-care/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await registerUserSchema.findOne({ email });
    if (!oldUser) {
      return res.status(404).json({ status: "User Not Exists!!" });
    } else {
      const secret = JWT_SCRECT + oldUser.password;
      const token = jwt.sign(
        { email: oldUser.email, id: oldUser._id },
        secret,
        {
          expiresIn: "10m",
        }
      );
      const link = `http://localhost:3000/reset-password/${oldUser._id}/${token}`;
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "thamusinfo42@gmail.com",
          pass: "tpugtypntidukqwl",
        },
      });

      var mailOptions = {
        from: "Comfort and Care <noreply.thamusinfo42@gmail.com>",
        to: oldUser.email,
        replyTo: "noreply.thamusinfo42@gmail.com",
        subject: "Password Reset",
        html: `
        <html>
<head>
<style>
#heading{
text-align:center;
font-size: 20px;
font-weight: bold;
}
button{
height: 34px;
    width: 115px;
    background: darkorange;
    color: white;
    border: 0px;
    cursor: pointer;
}
</style>
</head>
<body>
<div id="content">
<div>
Dear ${oldUser.username}
</div>
<br/>
<div>
We have received a request to reset your password.
</div>
<br/>
<div>
Click on the button below within the next 10 minutes to reset your password. If you ignore this message, your password won’t be changed.
</div>
<br/>
<div id="buttondiv">
<a href=${link}><button>Resetpassword</button></a>
</div>
</div>
</body>
</html>
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      console.log(link);
      res
        .status(200)
        .send({ message: "Link has been send to your register email id" });
    }
  } catch (error) {
    res.status(404).send({ message: "something went wrong" });
  }
});
//resetpassword page validation
app.get("/comfort-and-care/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await registerUserSchema.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SCRECT + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.status(200).send({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.status(403).send({ message: "invalid token" });
  }
});
//changing the password
app.post("/comfort-and-care/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await registerUserSchema.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SCRECT + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await registerUserSchema.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );
    res
      .status(200)
      .send({ message: "password changed sucessfully..! you may login now" });
  } catch (error) {
    console.log(error);
    res.status(403).send({ status: "Something Went Wrong" });
  }
});
//forgot username
app.post("/comfort-and-care/forgotusername", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await registerUserSchema.findOne({ email });
    if (!oldUser) {
      res.status(403).send({ message: "User not avaliable" });
    } else {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "thamusinfo42@gmail.com",
          pass: "tpugtypntidukqwl",
        },
      });
      var mailOptions = {
        from: "Comfort and Care <noreply.thamusinfo42@gmail.com>",
        to: email,
        replyTo: "noreply.thamusinfo42@gmail.com",
        subject: "Forgot username",
        html: `
        <html>
<head>
<style>
#heading{
font-size: 18px;
font-weight: bold;
}
button{
height: 34px;
    width: 115px;
    background: cadetblue;
    color: white;
    border: 0px;
    cursor: pointer;
}
</style>
</head>
<body>
<div id="content">
<div>
Dear user
</div>
<br/>
<div>
We have received a request to forgot username.
</div>
<br/>
<div>
Your username to login Comfort and Care is <span id="heading">${oldUser.username}</span>.
</div>
<br/>
</div>
</body>
</html>
        `,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res
        .status(200)
        .send({ message: "Username has been send to your register email id" });
    }
  } catch (error) {
    res.status(403).send({ message: "something went wrong" });
  }
});
//server running port
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
