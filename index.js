var express = require("express");
var app = express();
var fs = require("fs");

var bodyParser = require("body-parser");
var mysql = require("mysql");

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

app.post("/setup", function (req, res) {
  console.log(req.body);
  res.end(JSON.stringify({ status: true }));
});

var server = app.listen(3900, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("DB app listening at http://%s:%s", host, port);
});
