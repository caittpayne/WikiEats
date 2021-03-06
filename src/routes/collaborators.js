const express = require('express');
const router = express.Router();

const collaboratorController = require('../controllers/collaboratorController');


router.post('/wikis/:id/collaborators/create', collaboratorController.create);
router.post('/wikis/:id/collaborators/:id/destroy', collaboratorController.destroy);

module.exports = router;