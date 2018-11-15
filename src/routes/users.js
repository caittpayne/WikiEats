const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validation = require('./validation');

router.get('/users/signup', userController.signup);