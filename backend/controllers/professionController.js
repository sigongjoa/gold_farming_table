const { getPool } = require('../utils/dbManager');

const getProfessions = async (req, res, dbManager) => {
    console.debug('getProfessions 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [professions] = await pool.query('SELECT id, tier, name, description FROM professions ORDER BY tier, name');
        console.debug(`조회된 직업 목록: ${JSON.stringify(professions)}`);
        res.json(professions);
        console.debug('getProfessions 함수 종료 (성공)');
    } catch (err) {
        console.error('직업 목록 조회 오류:', err);
        console.debug('getProfessions 함수 종료 (오류)');
        res.status(500).json({ message: '직업 목록을 불러오는 데 실패했습니다.' });
    }
};

module.exports = {
    getProfessions
}; 