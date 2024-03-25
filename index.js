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

//////////////////////////////////////////////
//////////////////////////////////////////////
// VERIFICA UN CONT POSIBIL INREGISTRAT //
//////////////////////////////////////////////
//////////////////////////////////////////////

function checkEmail(email) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM utilizatori WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      }
    );
  });
}

function checkUsername(username) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM utilizatori WHERE username = ?",
      [username],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      }
    );
  });
}

function checkPhoneNumber(phoneNumber) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM utilizatori WHERE phone_number = ?",
      [phoneNumber],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      }
    );
  });
}

//////////////////////////////////////////////
//////////////////////////////////////////////
// VERIFICA UN CONT POSIBIL INREGISTRAT //
//////////////////////////////////////////////
//////////////////////////////////////////////

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const phone_number = req.body.phone_number;
  const country = req.body.country;

  if (email != "" && username != "" && password != "" && country != "" && phone_number != "") {
    try {
      const emailExists = await checkEmail(email);
      const usernameExists = await checkUsername(username);
      const phoneNumberExists = await checkPhoneNumber(phone_number);

      console.log(emailExists);
      console.log(usernameExists);
      console.log(phoneNumberExists);
      if (
        emailExists == false &&
        usernameExists == false &&
        phoneNumberExists == false
      ) {
        res.send({ message: "gud" });
        //// CONTINUE REGISTER
      } else {
        res.send({ message: "bad" });
        //// SHUT OFF
      }
    } catch (error) {
      console.error(error);
    }
  }
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
