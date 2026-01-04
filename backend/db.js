const mysql = require("mysql2/promise");

module.exports = mysql.createPool({
  host: "tidb",
  port: 4000,
  user: "root",
  password: "",
  database: "appdb"
});
