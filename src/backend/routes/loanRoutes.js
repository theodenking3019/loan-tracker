const express = require('express');
const loanController = require('../controllers/loanController');

const router = express.Router();

router.post('/borrow', loanController.postBorrow);
router.post('/repay', loanController.postRepay);

module.exports = router;
