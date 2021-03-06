var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");
var mongoose = require("mongoose");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/ScoopScraperDB";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

module.exports = function(app) {
  // Scrape data from one site and place it into the mongodb db
  app.get("/scrape", function(req, res) {
    // Make a request via axios for the news section of `Daily Wire`
    axios.get("https://www.dailywire.com/").then(function(response) {
      var $ = cheerio.load(response.data);

      $("article").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element

        var title = $(element)
          .find("h3")
          .text();
        var link =
          "https://www.dailywire.com" +
          $(element)
            .find("a")
            .attr("href");

        // If this found element had both a title and a link
        if (title && link) {
          // Insert the data in the Article db
          db.Article.create(
            {
              title: title,
              link: link
            },

            function(err, inserted) {
              if (err) {
                // Log the error if one is encountered during the query
                console.log(err);
              } else {
                // Otherwise, log the inserted data
              }
            }
          );
        }
      });
      res.redirect("/");
    });
  });

  app.get("/", function(req, res) {
    db.Article.find({}).then(function(results) {
      var hbObj = {
        articles: results
      };
      res.render("index", hbObj);
    });
  });

  app.get("/savedarticles", function(req, res) {
    db.SavedArticle.find({}).then(function(results) {
      var hbObj2 = {
        articles: results
      };
      res.render("index", hbObj2);
    });
  });

  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.post("/savearticle", function(req, res) {
    db.Article.findOne({ _id: req.body.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
        // save article here
        db.SavedArticle.create({
          title: req.body.title,
          link: req.body.link
        });
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { note: dbNote._id },
          { new: true }
        );
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};

// Did not have time to complete the note-adding functionality. The structure for it is already there, starting on line 124, I just didn't have time to make it work.
