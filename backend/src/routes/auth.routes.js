const express = require('express');
const router = express.Router();
const { register, login, getUsers } = require('../controllers/auth.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users', protect, admin, getUsers);

module.exports = router;
