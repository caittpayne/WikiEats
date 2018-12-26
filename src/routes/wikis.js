const express = require('express');
const router = express.Router();
const wikiController = require('../controllers/wikiController');
const validation = require('./validation');
const helper = require('../auth/helpers');
const imageHandler = require('./images');


router.get('/wikis', wikiController.index);
router.get('/wikis/new', wikiController.new);
router.get('/wikis/:id', wikiController.show);
router.get('/wikis/:id/edit', wikiController.edit);
router.post('/wikis/create',
    imageHandler.handleImages,
    validation.validateWikis,
    helper.ensureAuthenticated,
    wikiController.create
)
router.post('/wikis/:id/update', wikiController.update);
router.post('/wikis/:id/destroy', wikiController.destroy);

module.exports = router;
