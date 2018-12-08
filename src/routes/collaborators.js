const express = require('express');
const router = express.Router();

const collaboratorController = require('../controllers/collaboratorController');
const helper = require('../auth/helpers');

router.get('/wikis/:id/collaborators/edit', collaboratorController.edit);
router.post('/wikis/:id/collaborators/create', collaboratorController.create);
router.post('/wikis/:id/collaborators/destroy', collaboratorController.destroy);

module.exports = router;