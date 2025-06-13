const express = require('express');
const itemController = require('../controllers/itemController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 소비 아이템(물약/비약/붕대 등)만 반환
  router.get('/consumables', (req, res) => itemController.getConsumableItems(req, res, dbManager));

  // 엠블럼/룬만 반환
  router.get('/emblems', (req, res) => itemController.getEmblemItems(req, res, dbManager));

  // 보석만 반환
  router.get('/gems', (req, res) => itemController.getGemItems(req, res, dbManager));

  // 재화만 반환
  router.get('/currencies', (req, res) => itemController.getCurrencyItems(req, res, dbManager));

  // 모든 아이템 조회
  router.get('/', (req, res) => itemController.getAllItems(req, res, dbManager));

  // 사용자 인벤토리 조회 (user_id 기반)
  router.get('/users/:userId/inventory', (req, res) => itemController.getUserInventory(req, res, dbManager));

  // 캐릭터 인벤토리 조회 (character_id 기반)
  router.get('/inventory/:characterId', (req, res) => itemController.getCharacterInventory(req, res, dbManager));

  // 특정 아이템 ID로 조회
  router.get('/:item_id', (req, res) => itemController.getItemById(req, res, dbManager));

  // 사용자 아이템 수량 업데이트
  router.post('/update-quantity', (req, res) => itemController.updateUserItemQuantity(req, res, dbManager));

  return router;
}; 