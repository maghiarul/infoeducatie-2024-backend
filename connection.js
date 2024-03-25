var mysql = require("mysql");

var pool = mysql.createPool({
  host: "127.123.123.123",
  user: "root",
  password: "",
  database: "infoeducatie-2024",
});

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log("Database connected successfully");
  connection.release();
});

module.exports = pool;
