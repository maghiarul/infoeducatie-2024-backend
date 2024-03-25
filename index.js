const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const db = require("./connection.js");
const bcrypt = require("bcrypt");

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

//////////////////////////////////////////////
//////////////////////////////////////////////
// ADAUGA UN CONT //
//////////////////////////////////////////////
//////////////////////////////////////////////

async function addAccount(email, username, password, phone_number, country) {
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    else {
      db.query(
        "INSERT INTO utilizatori (email, username, password, country, phone_number) VALUES (?,?,?,?,?)",
        [email, username, hash, country, phone_number],
        (err, res) => {
          if (err) throw err;
        }
      );
    }
  });
}

//////////////////////////////////////////////
//////////////////////////////////////////////
// ADAUGA UN CONT //
//////////////////////////////////////////////
//////////////////////////////////////////////

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const phone_number = req.body.phone_number;
  const country = req.body.country;

  if (
    email != "" &&
    username != "" &&
    password != "" &&
    country != "" &&
    phone_number != ""
  ) {
    try {
      const emailExists = await checkEmail(email);
      const usernameExists = await checkUsername(username);
      const phoneNumberExists = await checkPhoneNumber(phone_number);

      // console.log(emailExists);
      // console.log(usernameExists);
      // console.log(phoneNumberExists);
      if (
        emailExists == false &&
        usernameExists == false &&
        phoneNumberExists == false
      ) {
        //// CONTINUE REGISTER
        addAccount(email, username, password, phone_number, country).then(
          () => {
            res.send({ message: "Utilizator inregistrat cu succes !" });
          }
        );
      } else {
        res.send({ message: "Datele introduse sunt existente deja !" });
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
