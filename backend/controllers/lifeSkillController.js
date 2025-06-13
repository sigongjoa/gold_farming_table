const { getPool } = require('../utils/dbManager');

const getCharacterLifeSkills = async (req, res, dbManager) => {
    console.debug('getCharacterLifeSkills 함수 진입');
    const { character_id } = req.params;
    console.debug(`입력값 - character_id: ${character_id}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query(
            `SELECT 
                ls.id AS life_skill_id, 
                ls.name AS life_skill_name, 
                ls.icon_url, 
                COALESCE(cls.level, 0) AS level
             FROM life_skills ls
             LEFT JOIN character_life_skills cls ON ls.id = cls.life_skill_id AND cls.character_id = ?
             ORDER BY ls.name`,
            [character_id]
        );
        console.debug(`조회된 캐릭터 생활스킬: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getCharacterLifeSkills 함수 종료 (성공)');
    } catch (err) {
        console.error('캐릭터 생활스킬 조회 오류:', err);
        console.debug('getCharacterLifeSkills 함수 종료 (오류)');
        res.status(500).json({ message: '생활스킬을 불러오는 데 실패했습니다.' });
    }
};

const updateCharacterLifeSkillLevel = async (req, res, dbManager) => {
    console.debug('updateCharacterLifeSkillLevel 함수 진입');
    const { character_id, life_skill_id } = req.params;
    const { level } = req.body;
    console.debug(`입력값 - character_id: ${character_id}, life_skill_id: ${life_skill_id}, level: ${level}`);

    if (level === undefined || level < 0) {
        console.debug(`유효성 검사 실패: 레벨이 유효하지 않습니다. level: ${level}`);
        return res.status(400).json({ message: '레벨은 0 이상이어야 합니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [result] = await pool.query(
            'INSERT INTO character_life_skills (character_id, life_skill_id, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE level = VALUES(level)',
            [character_id, life_skill_id, level]
        );
        console.debug(`생활스킬 레벨 업데이트 결과: ${JSON.stringify(result)}`);
        res.json({ message: '생활스킬 레벨 업데이트 성공', changes: result.changedRows });
        console.debug('updateCharacterLifeSkillLevel 함수 종료 (성공)');
    } catch (err) {
        console.error('생활스킬 레벨 업데이트 오류:', err);
        console.debug('updateCharacterLifeSkillLevel 함수 종료 (오류)');
        res.status(500).json({ message: '생활스킬 레벨 업데이트에 실패했습니다.' });
    }
};

// 서버 생활스킬 조회
const getServerLifeSkills = async (req, res, dbManager) => {
    console.debug('getServerLifeSkills 함수 진입');
    const { server_name } = req.params;
    console.debug(`입력값 - server_name: ${server_name}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        // 서버 ID 가져오기
        const [serverRows] = await pool.query(
            'SELECT server_id FROM servers WHERE name = ?',
            [server_name]
        );
        console.debug(`서버 조회 결과: ${JSON.stringify(serverRows)}`);

        if (serverRows.length === 0) {
            console.debug(`서버를 찾을 수 없음: ${server_name}`);
            return res.status(404).json({ message: '서버를 찾을 수 없습니다.' });
        }

        const server_id = serverRows[0].server_id;
        console.debug(`서버 ID: ${server_id}`);

        // server_life_skills 테이블에서 데이터 가져오기
        const [rows] = await pool.query(
            `SELECT 
                ls.id AS life_skill_id, 
                ls.name AS life_skill_name, 
                ls.icon_url, 
                COALESCE(sls.level, 0) AS level
             FROM life_skills ls
             LEFT JOIN server_life_skills sls ON ls.id = sls.life_skill_id AND sls.server_id = ?
             ORDER BY ls.name`,
            [server_id]
        );
        console.debug(`조회된 서버 생활스킬: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getServerLifeSkills 함수 종료 (성공)');
    } catch (err) {
        console.error('서버 생활스킬 조회 오류:', err);
        console.debug('getServerLifeSkills 함수 종료 (오류)');
        res.status(500).json({ message: '서버 생활스킬을 불러오는 데 실패했습니다.' });
    }
};

// 서버 생활스킬 레벨 업데이트
const updateServerLifeSkillLevel = async (req, res, dbManager) => {
    console.debug('updateServerLifeSkillLevel 함수 진입');
    const { server_name, life_skill_id } = req.params;
    const { level } = req.body;
    console.debug(`입력값 - server_name: ${server_name}, life_skill_id: ${life_skill_id}, level: ${level}`);

    if (level === undefined || level < 0) {
        console.debug(`유효성 검사 실패: 레벨이 유효하지 않습니다. level: ${level}`);
        return res.status(400).json({ message: '레벨은 0 이상이어야 합니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        // 서버 ID 가져오기
        const [serverRows] = await pool.query(
            'SELECT server_id FROM servers WHERE name = ?',
            [server_name]
        );
        console.debug(`서버 조회 결과: ${JSON.stringify(serverRows)}`);

        if (serverRows.length === 0) {
            console.debug(`서버를 찾을 수 없음: ${server_name}`);
            return res.status(404).json({ message: '서버를 찾을 수 없습니다.' });
        }

        const server_id = serverRows[0].server_id;
        console.debug(`서버 ID: ${server_id}`);

        // server_life_skills 테이블에 업데이트
        const [result] = await pool.query(
            'INSERT INTO server_life_skills (server_id, life_skill_id, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE level = VALUES(level)',
            [server_id, life_skill_id, level]
        );
        console.debug(`서버 생활스킬 레벨 업데이트 결과: ${JSON.stringify(result)}`);
        res.json({ message: '서버 생활스킬 레벨 업데이트 성공', changes: result.changedRows });
        console.debug('updateServerLifeSkillLevel 함수 종료 (성공)');
    } catch (err) {
        console.error('서버 생활스킬 레벨 업데이트 오류:', err);
        console.debug('updateServerLifeSkillLevel 함수 종료 (오류)');
        res.status(500).json({ message: '서버 생활스킬 레벨 업데이트에 실패했습니다.' });
    }
};

module.exports = {
    getCharacterLifeSkills,
    updateCharacterLifeSkillLevel,
    getServerLifeSkills,
    updateServerLifeSkillLevel
}; 