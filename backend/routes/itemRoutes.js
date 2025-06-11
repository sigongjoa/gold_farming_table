const express = require('express');
const itemController = require('../controllers/itemController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 모든 아이템 조회
  router.get('/', (req, res) => itemController.getAllItems(req, res, dbManager));

  // 사용자 인벤토리 조회
  router.get('/user-inventory/:userId', (req, res) => itemController.getUserInventory(req, res, dbManager));

  // 특정 아이템 ID로 조회
  router.get('/:item_id', (req, res) => itemController.getItemById(req, res, dbManager));

  // 사용자 아이템 수량 업데이트
  router.post('/update-quantity', (req, res) => itemController.updateUserItemQuantity(req, res, dbManager));

  return router;
}; 