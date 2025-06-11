const express = require('express');
const router = express.Router();
const userInventoryController = require('../controllers/userInventoryController');
const craftingController = require('../controllers/craftingController');

// 사용자 인벤토리 라우트
router.get('/:user_id/inventory', userInventoryController.getUserInventory);
router.post('/:user_id/inventory', userInventoryController.addItemToInventory);
router.put('/:user_id/inventory/:item_id', userInventoryController.updateInventoryItem);
router.delete('/:user_id/inventory/:item_id', userInventoryController.deleteInventoryItem);

// 제작 가능 아이템 라우트
router.get('/:user_id/craftable-items', craftingController.getCraftableItems);
router.get('/:user_id/missing-materials/:recipe_id', craftingController.getMissingMaterials);

module.exports = router; 
