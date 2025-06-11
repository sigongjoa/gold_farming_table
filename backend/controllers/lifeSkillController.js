const { getPool } = require('../utils/dbManager');

const getCharacterLifeSkills = async (req, res, dbManager) => {
    const { character_id } = req.params;
    try {
        const pool = dbManager.getPool();
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
        res.json(rows);
    } catch (err) {
        console.error('캐릭터 생활스킬 조회 오류:', err);
        res.status(500).json({ message: '생활스킬을 불러오는 데 실패했습니다.' });
    }
};

const updateCharacterLifeSkillLevel = async (req, res, dbManager) => {
    const { character_id, life_skill_id } = req.params;
    const { level } = req.body;

    if (level === undefined || level < 0) {
        return res.status(400).json({ message: '레벨은 0 이상이어야 합니다.' });
    }

    try {
        const pool = dbManager.getPool();
        const [result] = await pool.query(
            'INSERT INTO character_life_skills (character_id, life_skill_id, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE level = VALUES(level)',
            [character_id, life_skill_id, level]
        );
        res.json({ message: '생활스킬 레벨 업데이트 성공', changes: result.changedRows });
    } catch (err) {
        console.error('생활스킬 레벨 업데이트 오류:', err);
        res.status(500).json({ message: '생활스킬 레벨 업데이트에 실패했습니다.' });
    }
};

module.exports = {
    getCharacterLifeSkills,
    updateCharacterLifeSkillLevel
}; 