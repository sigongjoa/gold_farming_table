const express = require('express');
const serverController = require('../controllers/serverController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 서버 목록 조회
  router.get('/', serverController.getServers);

  // 특정 서버의 캐릭터 목록 조회
  router.get('/:serverName/characters', serverController.getCharacters);

  // 모든 캐릭터 목록 조회
  router.get('/characters/all', serverController.getAllCharacters);

  // 캐릭터 생성
  router.post('/:serverName/characters', serverController.createCharacter);

  return router;
}; 