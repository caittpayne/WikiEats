const userQueries = require('../db/queries.users.js');
const passport = require('passport');
module.exports = {

    signup(req, res, next) {
        res.render('users/signup');
      },

    create(req, res, next) {

        let newUser = {
            email: req.body.email,
            password: req.body.password,
            passwordConfirmation: req.body.passwordConfirmation,
            name: req.body.name
        };

        userQueries.createUser(newUser, (err, user) => {
            if(err) {
                req.flash('error', err);
                res.redirect('/users/signup');
            } else {
                
                passport.authenticate('local')(req, res, () => {
                    req.flash('notice', 'Welcome to WikiEats!'); 
                    res.redirect('/')
                });
            }
        });
    },
}