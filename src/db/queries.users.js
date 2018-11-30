const User = require('./models').User;
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

module.exports = {

    createUser(newUser, callback) {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(newUser.password, salt);

        return User.create({
            email: newUser.email,
            password: hashedPassword,
            name: newUser.name
        })
        .then((user) => {;

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

    getUser(id, callback) {
        return User.findById(id)
        .then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        })
    }
}
