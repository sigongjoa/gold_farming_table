const express = require('express');
const userCharacterTaskController = require('../controllers/userCharacterTaskController');

module.exports = (dbManager) => {
  const router = express.Router();
  const controller = userCharacterTaskController(dbManager);

  // 새로운 작업 생성
  router.post('/', controller.createTask);

  // 특정 캐릭터의 모든 작업 조회
  router.get('/:characterId', controller.getTasksByCharacterId);

  // 작업 업데이트
  router.put('/:taskId', controller.updateTask);

  // 작업 삭제
  router.delete('/:taskId', controller.deleteTask);

  return router;
}; 