const Image = require('./models').Image;

module.exports = {

    uploadImage (req, wiki, callback) {
       return Image.create({
            type: req.file.mimetype,
            name: req.file.originalname,
            data: req.file.buffer,
            wikiId: wiki.id
        })
        .then((image) => {
            console.log('image id ' + image.wikiId);
            console.log('image name ' + image.name);
            callback(null, image);
        })
        .catch((err) => {
            callback(err);
        });
    }
}