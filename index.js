const express = require("express");
const https = require("https");

const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");

const mysql = require("mysql");
const mssql = require("mssql");
const MongoClient = require("mongodb").MongoClient;
const options = {
  key: fs.readFileSync("./etc/localhost.key"),
  cert: fs.readFileSync("./etc/localhost.crt"),
};
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
      await new mssql.ConnectionPool(configs[name])
        .connect()
        .then((pool) => {
          return pool.query`select * from [user]`;
        })
        .then((result) => {
          res.send(JSON.stringify({ status: true, data: result.recordset }));
        })
        .catch((err) => {
          console.log(err);
        });

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

var server = https.createServer(options, app).listen(3900, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("DB app listening at http://%s:%s", host, port);
});
