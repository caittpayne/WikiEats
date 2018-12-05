const wikiQueries = require('../db/queries.wikis.js');
const Private = require('../policies/privateWiki.js');
const Public = require('../policies/application.js');

module.exports = {

    index(req, res, next) {
         wikiQueries.getAllWikis((err, wikis) => {
             if(err) {
                 res.redirect(500, '/');
             } else {
                 res.render('wikis/index', {wikis});
             }
         })
    },

    new(req, res, next) {

        const authorized = new Public(req.user).new();

        if(authorized) {
            res.render('wikis/new');
        } else {
            req.flash('notice', 'You are not authorized to do that.');
            res.redirect('/wikis');
         }   
    },

    create(req, res, next) {
        var isPrivate;
        var authorized;
        
        if(!req.body.private || req.body.private == 'false') {
            isPrivate = false;
            authorized = new Public(req.user).create();
            
        } else if(req.body.private == 'true' && req.user.role == 'standard') {
            isPrivate = false;
            authorized = new Public(req.user).create();
        }     
        else {
             isPrivate = true;
             authorized = new Private(req.user).create();
        }

        if(authorized) {

            let newWiki = {
                title: req.body.title,
                body: req.body.body,
                private: isPrivate,
                userId: req.user.id
            };
    
            wikiQueries.addWiki(newWiki, (err, wiki) => {
                if(err) {
                    res.redirect(500, '/wikis/new');
                } else {
                    res.redirect(303, `/wikis/${wiki.id}`);
                }
            });
        } else {
            req.flash('notice', 'You are not authorized to do that.');
            res.redirect(`/wikis`);
        }

    },

    show(req, res, next) {
        wikiQueries.getWiki(req.params.id, (err, wiki) => {
            if(err || wiki == null) {
              res.redirect(404, '/');
            } else if(wiki.private == true) {

                const authorized = new Private(req.user, wiki).show();

                if(authorized) {
                    res.render('wikis/show', {wiki});
                } else {
                    req.flash('notice', 'You are not authorized to view this wiki');
                    res.redirect('/wikis');
                }
            } else {
                res.render('wikis/show', {wiki});
            }
          });
    },

    
    edit(req, res, next) {
        wikiQueries.getWiki(req.params.id, (err, wiki) => {
            var authorized;
  
            if(wiki.private == true) {
              authorized = new Private(req.user).edit();
            } else {
                authorized = new Public(req.user).edit();
            }
  
            if(authorized) {
              wikiQueries.getWiki(req.params.id, (err, wiki) => {
                  console.log('wiki anme ' + wiki.name);
                  if(err || wiki == null) {
                    res.redirect(404, `/wikis`);
                  } else {
                      res.render('wikis/edit', {wiki});
                    }
              }); 
          } else {
              req.flash('notice', 'You are not authorized to do that');
              res.redirect(`/wikis/${wiki.id}`);
          }
        })
      },

    update(req, res, next) {
        wikiQueries.updateWiki(req, req.body, (err, wiki) => {
          if(err || wiki == null) {
            res.redirect(401, `/wikis/${req.params.id}/edit`);
          } else {
            res.redirect(`/wikis/${req.params.id}`);
          }
        });
      },

      destroy(req, res, next) {
        wikiQueries.deleteWiki(req, (err, wiki) => {
            if(err) {
                res.redirect(err, `/wikis/${req.params.id}`);
            } else {
                res.redirect(303, '/wikis');
            }
        });
      },
}