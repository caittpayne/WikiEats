const userQueries = require('../db/queries.users.js');
const wikiQueries = require('../db/queries.wikis.js');
const collaboratorQueries = require('../db/queries.collaborators.js');
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

    createPremiumUser(req, res, next) {
        const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
        const token = req.body.stripeToken;
        const charge = stripe.charges.create({
            amount: 1500,
            currency: 'usd',
            description: `Account charge for ${req.body.name}`,
            source: token
        }, (err, charge) => {
            if(err && err.type === 'StripeCardError') {
                req.flash('notice', 'You payment could not be processed.');
                console.log('Your payment could not be processed');
            } else {
                
               let newUser = {
                email: req.body.email,
                password: req.body.password,
                passwordConfirmation: req.body.passwordConfirmation,
                name: req.body.name,
                role: 'premium'
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

            }
        });
    },

    upgrade(req, res, next) {
        const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
        const token = req.body.stripeToken;
        const chargeAmount = req.body.chargeAmount;
        const charge = stripe.charges.create({
            amount: chargeAmount,
            currency: 'usd',
            description: 'Premium account charge',
            source: token
        }, (err, charge) => {
            if(err && err.type === 'StripeCardError') {
                req.flash('notice', 'Your payment could not be processed.');
                console.log('Your payment could not be processed');
            } else {
                
                userQueries.upgradeUser(req, (err, user) => {
                    if(err || user == null) {
                      res.redirect(401, '/');
                    } else {
                        req.flash('notice', 'Your account has been upgraded! You will receive a confirmation email shortly.')
                        res.redirect(`/users/${req.params.id}`);
                    }
                  });
            }
        });
      },

      downgrade(req, res, next) {
        userQueries.downgradeUser(req, (err, user) => {
          if(err || user == null) {
              console.log(err);
            res.redirect(err, '/');
          } else {
            wikiQueries.downgradeWikis(user.id, (err, wiki) => {
                if(err) {
                    console.log(err);
                    res.redirect(401, '/');
                } else {
                   collaboratorQueries.removeCollaborators(wiki, (err, collaborator) => {
                       if(err) {
                           console.log(err);
                           res.redirect(401, '/');
                       } else {
                        req.flash('notice','Your account has been downgraded');
                        res.redirect(`/users/${req.params.id}`);
                       }
                   });
                }
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
    },

    show(req, res, next) {
        userQueries.getUser(req.params.id, (err, result) => {
  
          if(err || result.user === undefined) {
              
              req.flash('notice', 'No user found with the ID');
              res.redirect('/');
          } else {
              res.render('users/show', {...result});
          }
        });
    },
}