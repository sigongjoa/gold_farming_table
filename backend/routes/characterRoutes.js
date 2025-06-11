const express = require('express');
const characterController = require('../controllers/characterController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 캐릭터 생성 또는 업데이트 (저장)
  router.post('/:user_id/save', (req, res) => characterController.createOrUpdateCharacters(req, res, dbManager));

  // 특정 사용자의 특정 서버 캐릭터 조회 (기존 라우트 복원)
  router.get('/user/:user_id/server/:server_name', (req, res) => characterController.getCharactersByServerAndUser(req, res, dbManager));

  // 특정 사용자의 특정 캐릭터 조회 (새로운 라우트 유지)
  router.get('/:user_id/:character_name', (req, res) => characterController.getCharactersByUserIdAndCharacterName(req, res, dbManager));

  return router;
}; 