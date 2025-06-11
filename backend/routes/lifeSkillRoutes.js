const express = require('express');
const lifeSkillController = require('../controllers/lifeSkillController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 캐릭터 생활스킬 조회
  router.get('/:character_id', (req, res) => lifeSkillController.getCharacterLifeSkills(req, res, dbManager));

  // 캐릭터 생활스킬 레벨 업데이트
  router.post('/:character_id/:life_skill_id/update', (req, res) => lifeSkillController.updateCharacterLifeSkillLevel(req, res, dbManager));

  return router;
}; 