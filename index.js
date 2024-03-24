const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const db = require("./connection.js");

const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  db.query("SELECT * FROM news", (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
