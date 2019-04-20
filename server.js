var express = require("express");
var PORT = process.env.PORT || 3000;
var app = express();
var Handlebars = require("handlebars");
var mongoose = require("mongoose");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//var routes = require("./controllers/scraper_controller.js");
// Import routes and give the server access to them.
//require("./controllers/scraper_controller.js")(app);
require("./controllers/scraper_controller")(app);
app.listen(PORT, function() {
  console.log("Server listening on http://localhost:" + PORT);
});
