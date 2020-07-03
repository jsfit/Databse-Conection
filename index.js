const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");

const mysql = require("mysql");
const mssql = require("mssql");
const MongoClient = require("mongodb").MongoClient;

const configs = require("./databases");

let connection = null;
let lastConfig = null;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/jedm", function (req, res) {
  res.sendFile(__dirname + "/" + "jedm.html");
});

app.post("/setup", async function (req, res) {
  console.log(req.body);
  let { name } = req.body;
  lastConfig = name;
  let data = null;
  switch (name) {
    case "Mysql":
      connection = mysql.createConnection(configs[name]);
      if (connection) connection.connect();

      if (connection) connection.end();
      res.send(JSON.stringify({ status: true, data: docs }));

      break;

    case "Mssql":
      connection = new mssql.ConnectionPool(configs[name]);
      let pool = await connection.connect();
      data = pool.query`select * from user`;
      res.send(JSON.stringify({ status: true, data }));

      break;

    case "Mongodb":
      MongoClient.connect(configs[name].url, function (err, client) {
        console.log("Connected successfully to server");

        const db = client.db(configs[name].database);
        const collection = db.collection("users");
        collection.find({}).toArray(function (err, docs) {
          res.send(JSON.stringify({ status: true, data: docs }));
        });
      });
      break;
  }
});

var server = app.listen(3900, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("DB app listening at http://%s:%s", host, port);
});
