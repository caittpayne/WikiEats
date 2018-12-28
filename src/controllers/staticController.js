const wikiQueries = require("../db/queries.wikis.js");

module.exports = {
  index(req, res, next) {
    wikiQueries.getFeaturedWikis((err, wikis) => {
      if (err) {
        res.redirect(500, "/");
      } else {
        res.render("static/index", {
          wikis,
          title: "Welcome to WikiEats",
          Buffer
        });
      }
    });
  }
};
