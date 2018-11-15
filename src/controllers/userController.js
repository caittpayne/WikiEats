const { Console } = require('console');

module.exports = {

    signup(req, res, next) {
        res.render('users/sign_up');
      }
}