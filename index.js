//--------------------------Modules-required----------------
var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var cors = require("cors");
var natalityStatsAPIv2 = require("./src/back/natality-statsAPI/v2");

//--------------------------Server-variables------------------
var app = express();

var port = process.env.PORT || 10000;


//--------------------------Server-usages----------------------
app.use(cors());
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.json());

//--------------------------Server-API----------------------
natalityStatsAPIv2.register(app);


//------------------------------------Server-status------------------------
app.listen(port, () => {
  console.log("server ready listening on port " + port);
});
