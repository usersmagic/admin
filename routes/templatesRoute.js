const express = require('express');
const router = express.Router();

const isAdmin = require('../middleware/isAdmin');

const indexGetController = require('../controllers/templates/index/get');

const createPostController = require('../controllers/templates/create/post');

router.get(
  '/',
    isAdmin,
    indexGetController
);

router.post(
  '/create',
    isAdmin,
    createPostController
);

module.exports = router;
