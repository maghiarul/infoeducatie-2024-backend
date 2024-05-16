const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const db = require("./connection.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const PORT = 4000;

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/////////
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

function login(emailORusername, password) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM utilizatori WHERE (email = ? OR username = ?)",
      [emailORusername, emailORusername, password],
      async (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            // resolve(true);
            const hashedPassword = results[0].password;
            const id = results[0].id;
            try {
              const match = await bcrypt.compare(password, hashedPassword);

              if (match) {
                const token = jwt.sign({ userId: id }, "012398u1jiodasdp';", {
                  expiresIn: "1h",
                });
                if (token) {
                  db.query(
                    "UPDATE utilizatori SET token = ? WHERE (email = ? OR username = ?)",
                    [token, emailORusername, emailORusername],
                    (err, res) => {
                      if (err) throw err;
                    }
                  );
                  resolve(token);
                }
              } else {
                // INCORRECT PASSWORD
                resolve(false);
              }
            } catch (error) {
              resolve(null);
            }
          } else {
            resolve(false);
          }
        }
      }
    );
  });
}

//////////////////////////////////////////////
//////////////////////////////////////////////
// ADAUGA UN CONT //
//////////////////////////////////////////////
//////////////////////////////////////////////

app.post("/register", async (req, res) => {
  const { email, username, password, phone_number, country } = req.body;

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
            res.send({
              message: "Utilizator inregistrat cu succes !",
              success: true,
            });
          }
        );
      } else if (emailExists) {
        res.send({ message: "Email-ul este deja folosit  !", success: false });
      } else if (usernameExists) {
        res.send({
          message: "Username-ul este deja folosit  !",
          success: false,
        });
      } else if (phoneNumberExists) {
        res.send({
          message: "Numarul de telefon este deja folosit  !",
          success: false,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email != "" && password != "") {
    try {
      // LOGIN
      login(email, password).then((token) => {
        if (token) {
          res.send({ token: `${token}`, success: true });
        } else {
          res.send({
            message: "Eroare ! Datele introduse sunt incorecte !",
            success: false,
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
});

app.post("/getDisplay", (req, res) => {
  const token = req.body.token;
  try {
    db.query(
      "SELECT email FROM utilizatori where token = ?",
      [token],
      (err, result) => {
        res.send(result[0]);
      }
    );
  } catch (error) {
    throw error;
  }
});

app.post("/logout", (req, res) => {
  const token = req.body.token;
  try {
    db.query(
      "UPDATE utilizatori SET token = DEFAULT  where token = ?",
      [token],
      (err, result) => {
        res.send({ message: "Success !" });
      }
    );
  } catch (error) {
    throw error;
  }
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "panaite.cristian99@gmail.com",
    pass: "ywta qseb yvzn qrhl",
  },
});

app.post("/send-mail", (req, res) => {
  const { name, email, topic, text } = req.body;

  const mailOptions = {
    from: `${email}`,
    to: "panaite.cristian99@gmail.com",
    subject: `${name} - ${topic}`,
    text: `${text}`,
  };
  if (name != "" && email != "" && topic != "" && text != "") {
    transporter.sendMail(mailOptions, (err, result) => {
      if (err) {
        console.error("Eroare incercand sa trimit mail: ", err);
        res.status(500).send("Eroare incercand sa trimit mail !");
      } else {
        console.log("Email trimis: ", result.response);
        res.status(200).send("Email trimis cu succes !");
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
