const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "admin-dashbord",
  multipleStatements: true // Isse ek saath 3-4 queries chal sakti hain
});

db.connect((err) => {
  if (err) console.error("❌ DB Connection Error:", err);
  else console.log("✅ MySQL Connected");
});

module.exports = db;