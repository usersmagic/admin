const express = require('express');
const router = express.Router();

const loginGetController = require('../controllers/auth/login/get');

const loginPostController = require('../controllers/auth/login/post');

router.get(
  '/login',
    loginGetController
);

router.post(
  '/login',
    loginPostController
);

module.exports = router;
