//Lidhja me DB per mySQL met veq edhe me i lidh me serverin ne server.js, per me bo CRUDA-t ne routes.js
const mysql = require("mysql2");

const db = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "root123",
    database : "event_management"
});

db.connect(err => {
    if (err) throw err;
    console.log("DB connected");
});

module.exports = db;