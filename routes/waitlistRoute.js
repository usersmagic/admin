const express = require('express');
const router = express.Router();

const isAdmin = require('../middleware/isAdmin');

const indexGetController = require('../controllers/waitlist/index/get');

const removePostController = require('../controllers/waitlist/remove/post');

router.get(
  '/',
    isAdmin,
    indexGetController
)

router.post(
  '/remove',
    isAdmin,
    removePostController
);

module.exports = router;
