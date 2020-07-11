const express = require("express");
const https = require("https");

const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");

const oracledb = require("oracledb/");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const mysql = require("mysql2");
const mssql = require("mssql/msnodesqlv8");
const MongoClient = require("mongodb").MongoClient;

// Localhost ssl
const options = {
  key: fs.readFileSync("./etc/localhost.key"),
  cert: fs.readFileSync("./etc/localhost.crt"),
};

const configs = require("./databases");
const queries = require("./queries");

let connection = null;
let lastConfig = null;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/connection", function (req, res) {
  res.send(
    JSON.stringify({
      status: !!lastConfig,
      db: lastConfig === "MssqlW" ? "Mssql Windows Auth" : lastConfig,
    })
  );
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/" + "jedm.html");
});

app.post("/setup", async function (req, res) {
  let { name, database, schema } = req.body;
  let _schema = schema || database;
  let _config = configMaker(req.body);
  switch (name) {
    case "Oracle":
      connection = await oracledb.getConnection(_config);
      console.log(connection);
      const result = await connection.execute(
        queries[name][0].replace(/%schema%/g, _schema)
      );
      const result2 = await connection.execute(
        queries[name][1].replace(/%schema%/g, _schema)
      );
      res.send(
        JSON.stringify({
          status: false,
          data: [...result.rows, ...result2.rows],
        })
      );

      break;

    case "Mysql":
      connection = mysql.createConnection(_config);
      if (connection) {
        console.log("Connected successfully to MySQL server");
        connection.connect();
        connection.query(queries[name].replace(/%schema%/g, _schema), function (
          err,
          result,
          fields
        ) {
          if (err) throw err;
          res.send(
            JSON.stringify({ status: true, data: [...result[0], ...result[1]] })
          );
        });
        connection.end();
      }

      break;

    case "Mssql":
      try {
        await new mssql.ConnectionPool(_config)
          .connect()
          .then((pool) => {
            console.log("Connected successfully to MSSQL server");

            return pool.query(queries[name].replace(/%schema%/g, _schema));
          })
          .then((result) => {
            res.send(JSON.stringify({ status: true, data: result.recordset }));
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (err) {
        console.log(err);
      }

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

const configMaker = (config) => {
  let {
    name,
    database,
    role,
    authentication,
    host,
    userName,
    password,
  } = config;
  let c = {};
  switch (name) {
    case "Oracle":
      c = {
        name: userName,
        password,
        connectString: `${host}/${database}`,
        privilege: role,
      };
      break;
    case "Mysql":
      c = {
        user: userName,
        host,
        password,
        database,
        multipleStatements: true,
      };
      break;
    case "Mongodb":
      break;
    case "Mssql":
      c = {
        server: host,
        ...(!!user && { user: userName }),
        ...(!!password && { password }),
        ...(!!database && { database }),
        ...(authentication === "Windows Authentication" && {
          driver: "msnodesqlv8",
        }),
        port: 1433,
        pool: {
          idleTimeoutMillis: 6000000,
        },
        options: {
          ...(authentication === "Windows Authentication" && {
            trustedConnection: true,
          }),
          trustServerCertificate: true,
        },
      };
      break;
  }
  return c;
};
var server = https.createServer(options, app).listen(3900, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("DB app listening at https://%s:%s", host, port);
});
