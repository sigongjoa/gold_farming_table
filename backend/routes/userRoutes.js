const express = require('express');
const userInventoryController = require('../controllers/userInventoryController');
const craftingController = require('../controllers/craftingController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 사용자 인벤토리 라우트
  router.get('/:user_id/inventory', (req, res) => userInventoryController.getUserInventory(req, res, dbManager));
  router.post('/:user_id/inventory', (req, res) => userInventoryController.addItemToInventory(req, res, dbManager));
  router.put('/:user_id/inventory/:item_id', (req, res) => userInventoryController.updateInventoryItem(req, res, dbManager));
  router.delete('/:user_id/inventory/:item_id', (req, res) => userInventoryController.deleteInventoryItem(req, res, dbManager));

  // 제작 가능 아이템 라우트
  router.get('/:user_id/craftable-items', (req, res) => craftingController.getCraftableItems(req, res, dbManager));
  router.get('/:user_id/missing-materials/:recipe_id', (req, res) => craftingController.getMissingMaterials(req, res, dbManager));

  return router;
}; 
