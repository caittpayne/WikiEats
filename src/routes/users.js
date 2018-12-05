const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validation = require('./validation');


router.get('/users/signup', userController.signup);
router.get('/users/signin', userController.signInForm);
router.get('/users/signout', userController.signOut);
router.get('/users/:id', userController.show);
router.post('/users', validation.validateUsers, userController.create);
router.post('/users/premiumSignup', validation.validateUsers, userController.createPremiumUser);
router.post('/users/signin', validation.validateUsers, userController.signIn);
router.post('/users/:id/upgrade', userController.upgrade);
router.post('/users/:id/downgrade', userController.downgrade);

module.exports = router;