const express = require("express");
const app = express();
const { urlencoded } = require("express");
const cors = require("cors");
var AES = require("crypto-js/aes");
require("dotenv").config();
const mongoose = require("mongoose");
const userDB = require("./model.js")
const { fetch } = require("node-fetch");

let password = "";
let Imageid = [];


const database = () => {
  return mongoose.connect(process.env.MONGO_URI);
}

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

app.get("/", function (req, res) {
  res.send("welcome to node server");
});



app.post("/signup", async (req, res) => {
  const { id, theme, email, links } = req.body;
  // console.log("signup = ", id, theme);

  let secterKey = theme;  
  let encryptedData = "";

  for (let i = 0; i < id.length; i++) {
    encryptedData = AES.encrypt(id[i], secterKey).toString();
    // console.log(encryptedData);
    secterKey = encryptedData;
  }

  const allUser = await userDB.find();
  if (allUser.find(user => user.email === email)) {
    // console.log("user already exists");
    res.status(401).send("user already exists");
  } else {

    allLink = links.map(link => link.id);

    const user = {
      email: email,
      allId: allLink,
      password: encryptedData,
      id: id
    }

    await userDB.create(user);
    // console.log("user added successfully");
    res.status(200).send("user added successfully");
  }

});

app.post("/login", async (req, res) => {
  const { email } = req.body;
  // console.log(email);
  // res.send("got successfully");

  const user = await userDB.find({ email: email });

  // console.log(user);

  const Ids = user[0].allId;
  password = user[0].password;
  Imageid = user[0].id;

  //console.log("id and password = ", Ids, password)

  res.json({Ids})
})

app.post("/loginVerify", async (req, res) => {
  const { id, theme } = req.body;
  let total = 0;
  

  // console.log("login = ", id, theme);

  let secterKey = theme;
  let encryptedData = "";

  for (let i = 0; i < id.length; i++) {
    encryptedData = AES.encrypt(id[i], secterKey).toString();
    // console.log(encryptedData);
    secterKey = encryptedData;
  }

  for (let i = 0; i < id.length; i++){
    if (id[i] === Imageid[i]) {
      total++;
    }
  }

  if (total === id.length) {
    res.send("successfully logged in")
  }
  else {
    res.send("error");
  }




  
  // console.log(encryptedData, password);
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

