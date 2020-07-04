const express = require("express");
const https = require("https");

const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");

const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const mysql = require("mysql");
const mssql = require("mssql");
const MongoClient = require("mongodb").MongoClient;

// Localhost ssl
const options = {
  key: fs.readFileSync("./etc/localhost.key"),
  cert: fs.readFileSync("./etc/localhost.crt"),
};

const configs = require("./databases");

let connection = null;
let lastConfig = null;

app.use(bodyParser.json());
// app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/connection", function (req, res) {
  res.send(JSON.stringify({ status: !!lastConfig, db: lastConfig }));
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/" + "jedm.html");
});

app.post("/setup", async function (req, res) {
  console.log(req.body);
  let { name } = req.body;
  lastConfig = name;
  switch (name) {
    case "Oracle":
      // connection = await oracledb.getConnection({
      //   user: "unitg",
      //   password: "123",
      //   host: "localhost",
      //   port: "1521",
      // });
      // console, log(connection);
      res.send(JSON.stringify({ status: false, data: null }));

      break;

    case "Mysql":
      connection = mysql.createConnection(configs[name]);
      if (connection) {
        console.log("Connected successfully to MySQL server");
        connection.connect();
        connection.query("SELECT * FROM teachers", function (err, result, fields) {
          if (err) throw err;
          console.log(result);
          res.send(JSON.stringify({ status: true, data: result }));
        });
        connection.end();
      }

      break;

    case "Mssql":
      await new mssql.ConnectionPool(configs[name])
        .connect()
        .then((pool) => {
          console.log("Connected successfully to MSSQL server");

          return pool.query`select * from [books]`;
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
        console.log("Connected successfully to Mongo server");

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

  console.log("DB app listening at https://%s:%s", host, port);
});
