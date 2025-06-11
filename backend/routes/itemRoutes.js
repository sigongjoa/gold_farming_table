const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.get('/', itemController.getItems);
router.get('/:item_id', itemController.getItemDetails);

module.exports = router; 