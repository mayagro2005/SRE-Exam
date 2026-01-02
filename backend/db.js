const mysql = require("mysql2/promise");

module.exports = mysql.createPool({
  host: "tidb",
  user: "root",
  password: "",
  database: "appdb"
});
