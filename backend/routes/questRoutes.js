const express = require('express');
const questController = require('../controllers/questController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 일일 숙제 라우트
  router.get('/:user_id/daily', (req, res) => questController.getDailyQuests(req, res, dbManager));
  router.post('/:user_id/daily/:quest_id/complete', (req, res) => questController.completeDailyQuest(req, res, dbManager));
  router.post('/:user_id/daily/reset', (req, res) => questController.resetDailyQuests(req, res, dbManager));

  // 주간 숙제 라우트
  router.get('/:user_id/weekly', (req, res) => questController.getWeeklyQuests(req, res, dbManager));
  router.post('/:user_id/weekly/:quest_id/complete', (req, res) => questController.completeWeeklyQuest(req, res, dbManager));
  router.post('/:user_id/weekly/reset', (req, res) => questController.resetWeeklyQuests(req, res, dbManager));

  return router;
}; 