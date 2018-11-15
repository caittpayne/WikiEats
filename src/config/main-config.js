require('dotenv').config();
const path = require('path');
const viewsFolder = path.join(__dirname, '..', 'views');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('express-flash');
const logger = require('morgan');


module.exports = {
    init(app, express) {
        app.set('views', viewsFolder);
        app.set('view engine', 'ejs');
        app.use(express.static(path.join(__dirname, '..', 'assets')));
        app.use(logger('dev'));
    }
    
}

