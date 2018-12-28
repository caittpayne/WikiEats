const Wiki = require("./models").Wiki;
const Public = require("../policies/application");
const Private = require("../policies/privateWiki");
const Collaborator = require("./models").Collaborator;
const Image = require("./models").Image;

module.exports = {
  getAllWikis(callback) {
    return Wiki.all({
      include: [
        {
          model: Collaborator,
          as: "collaborators"
        },
        {
          model: Image,
          as: "images"
        }
      ]
    })

      .then(wikis => {
        callback(null, wikis);
      })
      .catch(err => {
        callback(err);
      });
  },

  getWiki(id, callback) {
    return Wiki.findById(id, {
      include: [
        {
          model: Collaborator,
          as: "collaborators"
        },
        {
          model: Image,
          as: "images"
        }
      ]
    })
      .then(wiki => {
        callback(null, wiki);
      })
      .catch(err => {
        callback(err);
      });
  },

  addWiki(newWiki, callback) {
    return Wiki.create({
      title: newWiki.title,
      body: newWiki.body,
      private: newWiki.private,
      userId: newWiki.userId
    })
      .then(wiki => {
        callback(null, wiki);
      })
      .catch(err => {
        callback(err);
      });
  },

  deleteWiki(req, callback) {
    return Wiki.findById(req.params.id)
      .then(wiki => {
        var authorized;
        if (!req.body.private || req.body.private == "false") {
          authorized = new Public(req.user, wiki).destroy();
        } else {
          authorized = new Private(req.user, wiki).destroy();
        }

        if (authorized) {
          return wiki.destroy().then(res => {
            callback(null, wiki);
          });
        } else {
          req.flash("notice", "You are not authorized to do that.");
          callback(401);
        }
      })
      .catch(err => {
        callback(err);
      });
  },

  updateWiki(req, updatedWiki, callback) {
    return Wiki.findById(req.params.id, {
      include: [
        {
          model: Collaborator,
          as: "collaborators"
        }
      ]
    }).then(wiki => {
      if (!wiki) {
        return callback("Wiki not found");
      }

      var authorized;
      if (wiki.private == false) {
        authorized = new Public(req.user, wiki).update();
      } else {
        authorized = new Private(req.user, wiki).update();
      }

      if (authorized) {
        wiki
          .update(updatedWiki, {
            fields: Object.keys(updatedWiki)
          })
          .then(() => {
            callback(null, wiki);
          })
          .catch(err => {
            callback(err);
          });
      } else {
        req.flash("notice", "You are not authorized to do that.");
        callback("Forbidden");
      }
    });
  },

  downgradeWikis(userId, callback) {
    Wiki.findAll({
      where: {
        userId: userId,
        private: true
      }
    })
      .then(wikis => {
        if (wikis.length > 0) {
          var allWikis = 0;
          wikis.forEach(wiki => {
            wiki.private = false;
            wiki
              .save()
              .then(wiki => {
                allWikis++;

                if (allWikis === wikis.length) {
                  callback(null, wiki);
                }
              })
              .catch(err => {
                callback(err);
              });
          });
        } else {
          callback(null, null);
        }
      })
      .catch(err => {
        callback(err);
      });
  },

  getFeaturedWikis(callback) {
    return Wiki.all({
      where: {
        private: false
      },
      include: [
        {
          model: Image,
          as: "images",
          required: true
        }
      ]
    })
      .then(wikis => {
        callback(null, wikis);
      })
      .catch(err => {
        callback(err);
      });
  }
};
