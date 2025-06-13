const express = require('express');
const equipmentController = require('../controllers/equipmentController');

module.exports = (dbManager) => {
  const router = express.Router();

  // 장비 등급 조회
  router.get('/grades', (req, res) => equipmentController.getGrades(req, res, dbManager));

  // 장비 종류 조회
  router.get('/types', (req, res) => equipmentController.getEquipmentTypes(req, res, dbManager));

  // 장비 부위 조회
  router.get('/parts', (req, res) => equipmentController.getEquipmentParts(req, res, dbManager));

  // 모든 장비 조회
  router.get('/', (req, res) => equipmentController.getAllEquipments(req, res, dbManager));

  // 특정 장비 조회
  router.get('/:equipment_id', (req, res) => equipmentController.getEquipmentById(req, res, dbManager));

  // 모든 룬 조회
  router.get('/runes', (req, res) => equipmentController.getAllRunes(req, res, dbManager));

  // 특정 룬 조회
  router.get('/runes/:rune_id', (req, res) => equipmentController.getRuneById(req, res, dbManager));

  // 모든 보석 조회
  router.get('/gems', (req, res) => equipmentController.getAllGems(req, res, dbManager));

  // 특정 보석 조회
  router.get('/gems/:gem_id', (req, res) => equipmentController.getGemById(req, res, dbManager));

  // 모든 장비 슬롯 조회
  router.get('/slots', (req, res) => equipmentController.getEquipmentSlots(req, res, dbManager));

  // 캐릭터 장착 정보 조회
  router.get('/characters/:characterId/equipment', (req, res) => equipmentController.getCharacterEquipment(req, res, dbManager));

  // 장비 장착/변경 등록
  router.put('/characters/:characterId/equipment/:slot', (req, res) => equipmentController.equipItemInSlot(req, res, dbManager));

  // 룬 삽입
  router.post('/characters/:characterId/equipment/:slot/rune', (req, res) => equipmentController.addRuneToEquipment(req, res, dbManager));

  // 룬 제거
  router.delete('/characters/:characterId/equipment/:slot/rune/:runeId', (req, res) => equipmentController.removeRuneFromEquipment(req, res, dbManager));

  // 보석 삽입
  router.post('/characters/:characterId/equipment/:slot/gem', (req, res) => equipmentController.addGemToEquipment(req, res, dbManager));

  // 보석 제거
  router.delete('/characters/:characterId/equipment/:slot/gem/:gemId', (req, res) => equipmentController.removeGemFromEquipment(req, res, dbManager));

  return router;
}; 