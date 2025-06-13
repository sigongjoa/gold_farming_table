const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// 새 작업 생성
router.post('/', taskController.addTask);

// 모든 작업 조회
router.get('/', taskController.getAllTasks);

// 특정 캐릭터의 작업 목록 및 완료 상태 조회
router.get('/character/:characterId', taskController.getCharacterTasks);

// 모든 캐릭터에 대한 작업 목록 및 완료 상태 조회
router.get('/all-character-status', taskController.getTasksForAllCharacters);

// 특정 캐릭터의 작업 완료 상태 업데이트 또는 삽입
router.put('/:taskId/character/:characterId', taskController.toggleTaskCompletion);

// 작업 삭제
router.delete('/:taskId', taskController.deleteTask);

module.exports = router; 