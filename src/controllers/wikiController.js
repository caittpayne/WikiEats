const wikiQueries = require('../db/queries.wikis.js');

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
        res.render('wikis/new');
    },

    create(req, res, next) {
        var isPrivate;
        
        if(!req.body.private || req.body.private == 'false') {
            isPrivate = false;
        } else {
             isPrivate = true;
        }

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
    },

    show(req, res, next) {
        wikiQueries.getWiki(req.params.id, (err, wiki) => {
            if(err || wiki == null) {
              res.redirect(404, '/');
            } else {
              res.render('wikis/show', {wiki});
            }
          });
    },

    
  edit(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
        if(err || wiki == null) {
          res.redirect(404, `/wikis`);
        } else {
            res.render('wikis/edit', {wiki});
          }
        });  
    },

    update(req, res, next) {
        wikiQueries.updateWiki(req, req.body, (err, wiki) => {
          if(err || wiki == null) {
              console.log('error' + err);
            res.redirect(404, `/wikis/${req.params.id}/edit`);
          } else {
            res.redirect(`/wikis/${req.params.id}`);
          }
        });
      },

      destroy(req, res, next) {
          console.log(req);
        wikiQueries.deleteWiki(req, (err, wiki) => {
          if(err) {
              console.log('error' + err);
            req.flash('notice', 'You are not authorized to do that.')
            res.redirect(`/wikis/${req.params.id}`)
          } else {
            res.redirect(303, `/wikis`)
          }
        });
      },
}