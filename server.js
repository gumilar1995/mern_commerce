const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const auth = require("./routes/api/authentication");
const items = require("./routes/api/items");

const app = express();

app.use(bodyParser.json());

const db = require("./config/keys").mongoURI;

mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", auth);
app.use("/api/items", items);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server Listening on PORT : ${port}`));
