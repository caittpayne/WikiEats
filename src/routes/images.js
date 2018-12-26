const upload = require('../config/multer-config.js');

module.exports = {

    handleImages(req, res, next) {

        upload(req, res, (err) => {
            if(err) {
                req.flash('error', err.message);
                res.redirect('/wikis/new');
            } else {
                return next();
            }
        });
    }
}
