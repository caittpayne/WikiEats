const imageQueries = require('../db/queries.images.js');
    
module.exports = {

    upload(req, wiki) {
        if(req.file) {
            imageQueries.uploadImage(req, wiki, (err, image) => {
                if(err) {
                    console.log(err);
                    res.redirect(500, '/wikis/new');
                } else {
                    res.redirect(303, `wikis/${wiki.id}`);
                }
            })
        } else {
            res.redirect(303, `wikis/${wiki.id}`);
        }
    }
} 
    