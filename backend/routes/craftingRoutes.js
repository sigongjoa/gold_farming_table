const express = require('express');
const craftingController = require('../controllers/craftingController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 제작 가능한 아이템 목록 조회
  router.get('/:user_id/craftable', (req, res) => craftingController.getCraftableItems(req, res, dbManager));

  // 특정 레시피에 대한 제작 트리 조회
  router.get('/:user_id/:recipe_id/tree', (req, res) => craftingController.getCraftingTree(req, res, dbManager));

  // 부족 재료 조회
  router.get('/:user_id/:recipe_id/missing-materials', (req, res) => craftingController.getMissingMaterials(req, res, dbManager));

  // 아이템 제작
  router.post('/:user_id/craft', (req, res) => craftingController.craftItemById(req, res, dbManager));

  return router;
}; 