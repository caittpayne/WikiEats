const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validation = require('./validation');


router.get('/users/signup', userController.signup);
router.get('/users/signin', userController.signInForm);
router.get('/users/signout', userController.signOut);
router.post('/users', validation.validateUsers, userController.create);
router.post('/users/signin', validation.validateUsers, userController.signIn);

module.exports = router;