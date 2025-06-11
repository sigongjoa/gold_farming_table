const express = require('express');
const router = express.Router();
const craftingController = require('../controllers/craftingController');

router.get('/tree/:result_item_id', craftingController.getCraftingTree);

module.exports = router; 