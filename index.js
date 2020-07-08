const express = require("express");
const https = require("https");

const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");

const oracledb = require("oracledb/");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const mysql = require("mysql");
const mssql = require("mssql/msnodesqlv8");
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
  console.log(req.body);
  let { name } = req.body;
  lastConfig = name;
  switch (name) {
    case "Oracle":
      connection = await oracledb.getConnection({
        user: "sys",
        password: "ppp",
        connectString: "localhost/ppp",
        privilege: oracledb.SYSDBA,
      });
      console.log(connection);
      const result = await connection.execute(
        `SELECT COUNTRY_NAME, REGION_ID
        FROM HR.COUNTRIES`
      );
      console.log(result.rows);
      res.send(JSON.stringify({ status: false, data: result.rows }));

      break;

    case "Mysql":
      connection = mysql.createConnection(configs[name]);
      if (connection) {
        console.log("Connected successfully to MySQL server");
        connection.connect();
        connection.query("SELECT * FROM teachers", function (
          err,
          result,
          fields
        ) {
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

          return pool.query`SELECT t.TABLE_TYPE, 
          t.TABLE_NAME,
          c.COLUMN_NAME, 
          c.IS_NULLABLE,
          c.DATA_TYPE, 
          c.CHARACTER_MAXIMUM_LENGTH, 
          pk.CONSTRAINT_TYPE, 
          COLUMN_DEFAULT,
          COLUMNPROPERTY(OBJECT_ID(c.TABLE_SCHEMA+'.'+c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') as 'IS_IDENTITY', 
          prop.value AS 'COMMENT' 
   FROM [NorthwindDev].INFORMATION_SCHEMA.TABLES t 
   INNER JOIN [NorthwindDev].INFORMATION_SCHEMA.COLUMNS c 
       ON t.TABLE_NAME = c.TABLE_NAME AND t.TABLE_SCHEMA = c.TABLE_SCHEMA 
   LEFT JOIN (
           SELECT tc.table_schema, tc.table_name,  cu.column_name, tc.constraint_type  
           FROM [NorthwindDev].information_schema.TABLE_CONSTRAINTS tc  
           JOIN [NorthwindDev].information_schema.KEY_COLUMN_USAGE  cu  
               ON tc.table_schema=cu.table_schema 
              and tc.table_name=cu.table_name  
              and tc.constraint_name=cu.constraint_name  
              and tc.constraint_type='PRIMARY KEY') pk  
              ON pk.table_schema=c.table_schema  
              AND pk.table_name=c.table_name  
              AND pk.column_name=c.column_name  
           INNER JOIN [NorthwindDev].sys.columns AS sc 
               ON sc.object_id = object_id(t.table_schema + '.' + t.table_name) 
               AND sc.name = c.column_name 
           LEFT JOIN [NorthwindDev].sys.extended_properties prop 
               ON prop.major_id = sc.object_id 
               AND prop.minor_id = sc.column_id 
               AND prop.name = 'MS_Description' 
   --WHERE t.TABLE_TYPE = 'BASE TABLE'
   ORDER BY t.TABLE_NAME;
   
          SELECT a.ROUTINE_TYPE      AS TABLE_TYPE 
          ,a.SPECIFIC_NAME           AS TABLE_NAME
          ,b.PARAMETER_NAME          AS COLUMN_NAME
          ,b.DATA_TYPE
          ,b.CHARACTER_MAXIMUM_LENGTH
          ,b.PARAMETER_MODE   AS PARAMETER_TYPE 
      FROM NorthwindDev.INFORMATION_SCHEMA.ROUTINES a
      INNER JOIN NorthwindDev.INFORMATION_SCHEMA.PARAMETERS b
      ON a.SPECIFIC_NAME =b.SPECIFIC_NAME
      --WHERE ROUTINE_TYPE ='FUNCTION' 
      WHERE a.SPECIFIC_NAME NOT LIKE 'sp_%' AND a.SPECIFIC_NAME NOT LIKE 'fn_%'
      ORDER BY a.ROUTINE_TYPE,a.ROUTINE_NAME`;
        })
        .then((result) => {
          res.send(JSON.stringify({ status: true, data: result.recordset }));
        })
        .catch((err) => {
          console.log(err);
        });

      break;

    case "MssqlW":
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
