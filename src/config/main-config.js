require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('express-flash');
const logger = require('morgan');


module.exports = {
    init(app, express) {
        app.use(logger('dev'));
    }
    
}

