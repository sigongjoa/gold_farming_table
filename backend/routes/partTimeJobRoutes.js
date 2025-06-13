const express = require('express');
const router = express.Router();

module.exports = (dbManager) => {
    const partTimeJobController = require('../controllers/partTimeJobController')(dbManager);

    // 모든 아르바이트 목록 조회
    router.get('/part-time-jobs', partTimeJobController.getAllPartTimeJobs);

    return router;
}; 