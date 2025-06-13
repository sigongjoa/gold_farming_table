const express = require('express');
const professionController = require('../controllers/professionController');
const dbManager = require('../utils/dbManager');

const router = express.Router();

router.get('/', (req, res) => professionController.getProfessions(req, res, dbManager));

module.exports = router; 