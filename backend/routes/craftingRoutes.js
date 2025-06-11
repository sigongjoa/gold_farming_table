const express = require('express');
const craftingController = require('../controllers/craftingController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 특정 레시피에 대한 제작 트리 조회
  router.get('/:serverName/:characterName/:recipe_id/tree', (req, res) => craftingController.getCraftingTree(req, res, dbManager));

  return router;
}; 