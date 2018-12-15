const collaboratorQueries = require('../db/queries.collaborators');
const userQueries = require('../db/queries.users');

module.exports = {
    validateUsers(req, res, next) {
        if(req.method === 'POST') {
          req.checkBody('email', 'must be valid').isEmail();
          req.checkBody('password', 'must be at least 6 characters in length').isLength({min: 6});
          req.checkBody('passwordConfirmation', 'must match password provided').optional().matches(req.body.password);
          req.checkBody('name', 'must be at least 2 characters in length').optional().isLength({min: 2}); 
        }
        const errors = req.validationErrors();
    
        if(errors) {
          req.flash('error', errors);
          res.redirect(req.headers.referer);
         
        } else {
            return next();
        }
      },

      validateWikis(req, res, next) {
        if(req.method === 'POST') {
          req.checkBody('title', 'must be at least 2 characters in length').isLength({min: 2});
          req.checkBody('body', 'must be at least 10 characters in length').isLength({min: 10});
        }
        const errors = req.validationErrors();
        if(errors) {
          req.flash('error', errors);
          return res.redirect(303, req.headers.referer)
        } else {
          return next();
        }
      },

      
}