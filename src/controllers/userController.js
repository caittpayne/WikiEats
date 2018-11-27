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
                req.flash('email', 'That email address is already in use.');
                res.redirect('/users/signup');
            } else {
                
                passport.authenticate('local')(req, res, () => {
                    req.flash('notice', "Welcome to WikiEats! Start by creating a new Wiki.");
                    res.redirect('/');
                });
            }
        });
    },

    signInForm(req, res, next) {
        res.render('users/signin');
    },

    signIn(req, res, next) {
        passport.authenticate('local')(req, res, function() {
            if(!req.user) {
                req.flash('notice', 'Sign in failed. Please try again.')
                res.redirect('/users/signin');
            } else {
                req.flash('notice', "You've successfully signed in!");
                res.redirect('/');
            }
        });
    },

    signOut(req, res, next) {
        req.logout();
        req.flash('notice', "You've successfully signed out");
        res.redirect('/');
    }
}