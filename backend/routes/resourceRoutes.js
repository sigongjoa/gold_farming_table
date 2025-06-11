const express = require('express');
const resourceController = require('../controllers/resourceController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 사용자 재화 조회
  router.get('/:user_id', (req, res) => resourceController.getUserResources(req, res, dbManager));

  // 사용자 재화 업데이트 (수량 변경)
  router.post('/:user_id/update', (req, res) => resourceController.updateUserResources(req, res, dbManager));

  return router;
}; 