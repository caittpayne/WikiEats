const multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage }).single("image");

module.exports = upload;
