const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.getRoot);
router.get('/register', authController.getRegister);
router.get('/login', authController.getLogin);
router.get('/logout', authController.getLogout);
router.get('/account', authController.getAccount);
router.get('/account-data', authController.getAccountData);

router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);

// ... other auth related routes can be added here, e.g. /login, /logout

module.exports = router;
