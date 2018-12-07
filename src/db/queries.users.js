const User = require('./models').User;
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const Wiki = require('./models').Wiki;

module.exports = {

    createUser(newUser, callback) {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    
        return User.create({
            email: newUser.email,
            password: hashedPassword,
            name: newUser.name,
            role: (newUser.role === 'premium') ? 'premium' : 'standard'
        })
        .then((user) => {

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg = {
                to: newUser.email,
                from: 'noreply@wikieats.com',
                subject: 'Welcome to WikiEats!',
                text: "We're happy you're on board! Start creating, collaborating, and sharing your stories.",
                html: '<strong>Please confirm your email</strong>',
              };
              
              sgMail.send(msg);

              callback(null, user)
        })
        .catch((err) => {
            callback(err);
        })
    },

    upgradeUser(req, callback) {
       return User.findById(req.params.id)
          .then((user) => {
    
            if(!user) {
              return callback('User not found');
            } else {

                  user.role = 'premium';
                  user.save()
                  .then(() => {
                    callback(null, user);
                  })
                  .catch((err) => {
                    callback(err);
                  });
            }
            
        });
    },


    downgradeUser(req, callback) {
        User.findById(req.params.id)
        .then((user) => {
            if(!user) {
                callback('User not found');
            } else {
                user.role = 'standard';
                user.save()
                .then((user) => {
                    callback(null, user);
                })
                .catch((err) => {
                    callback(err);
                })
            }
        })
        .catch((err) => {
            callback(err);
        })
    },

    getUser(id, callback) {
        let result = [];
        User.findById(id)
        .then((user) => {
            if(!user) {
                callback(404);
            } else {
                result['user'] = user;
    
                Wiki.scope({method: ['lastFiveFor', id]}).all()
                .then((wikis) => {
                    result['wikis'] = wikis;

                    callback(null, result);
                })
            }
        });
      },
}
