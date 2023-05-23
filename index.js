const express = require("express");
const app = express();
const { urlencoded } = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const userDB = require("./model.js");
const { fetch } = require("node-fetch");

let password = "";

const database = () => {
  return mongoose.connect(process.env.MONGO_URI);
};

global.fetch = fetch;

// app.use(express.static("../GraphicalPasswordFrontEnd/build"))

app.use(express.json({ limit: "50mb" }));
app.use(urlencoded({ extended: false, limit: "50mb" }));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.post("/signup", async (req, res) => {
  const { theme, email, links, id } = req.body;
  const allUser = await userDB.find();
  if (allUser.find((user) => user.email === email)) {
    res.status(401).send("EMAIL EXISTS");
  } else {
    let encryptedData = global.Buffer.from(theme).toString("base64");
    for (let i = 0; i < id.length; i++) {
      encryptedData += global.Buffer.from(id[i]).toString("base64");
    }
    allLink = links.map((link) => link.id);
    const user = {
      email: email,
      allId: allLink,
      password: encryptedData,
    };
    await userDB.create(user);
    res.status(200).send("user added successfully");
  }
});

app.post("/login", async (req, res) => {
  const { email } = req.body;
  const user = await userDB.find({ email: email });
  const Ids = user[0].allId;
  password = user[0].password;
  res.json({ Ids }).status(200);
});

app.post("/loginVerify", async (req, res) => {
  const { id, theme } = req.body;
  let encryptedData = global.Buffer.from(theme).toString("base64");
  for (let i = 0; i < id.length; i++) {
    encryptedData += global.Buffer.from(id[i]).toString("base64");
  }
  if (encryptedData === password) {
    res.send("successfully logged in").status(200);
  } else {
    res.send("ERROR").status(401);
  }
});

const port = process.env.PORT || 5000;

const connectDatabase = async () => {
  try {
    await database();
    app.listen(port, () => {
      console.log(`server listening to port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

connectDatabase();
