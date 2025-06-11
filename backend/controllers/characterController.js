const { getPool } = require('../utils/dbManager');

// 캐릭터 생성 또는 업데이트
const createOrUpdateCharacters = async (req, res, dbManager) => {
    const { user_id } = req.params;
    const { server_name, character_names } = req.body; // character_names는 배열 ['A', 'B', 'C', ''] 형태

    if (!server_name || !character_names || !Array.isArray(character_names)) {
        return res.status(400).json({ message: '서버 이름과 캐릭터 이름 배열은 필수입니다.' });
    }

    try {
        const pool = dbManager.getPool();

        // 1. 서버 ID 가져오기
        const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [server_name]);
        if (serverRows.length === 0) {
            return res.status(404).json({ message: '서버를 찾을 수 없습니다.' });
        }
        const server_id = serverRows[0].server_id;

        // 2. 현재 사용자의 해당 서버 캐릭터 목록 가져오기
        const [existingCharacters] = await pool.query(
            'SELECT character_id, character_name FROM characters WHERE user_id = ? AND server_id = ?',
            [user_id, server_id]
        );

        const existingCharacterMap = new Map();
        existingCharacters.forEach(char => existingCharacterMap.set(char.character_name, char.character_id));

        const updatedCharacterIds = [];

        for (const name of character_names) {
            const trimmedName = name.trim();
            if (trimmedName) {
                if (existingCharacterMap.has(trimmedName)) {
                    // 이미 존재하는 캐릭터는 업데이트 (여기서는 이름만 업데이트, 실제로는 레벨 등)
                    // 캐릭터 이름은 UNIQUE이므로, 여기서는 그냥 존재한다고만 체크하고 새로 생성하거나 업데이트할 필요는 없을 수 있음.
                    // 하지만 사용자 요청에 따라 업데이트 로직 유지.
                    const character_id = existingCharacterMap.get(trimmedName);
                    updatedCharacterIds.push(character_id);
                    // 이름이 같으면 업데이트할 것이 없지만, ON DUPLICATE KEY UPDATE를 사용하지 않으므로 명시적 UPDATE 필요 시 추가.
                } else {
                    // 새로운 캐릭터 생성
                    const [result] = await pool.query(
                        'INSERT INTO characters (server_id, user_id, character_name, db_name) VALUES (?, ?, ?, ?)',
                        [server_id, user_id, trimmedName, 'mabinogi_item_db']
                    );
                    updatedCharacterIds.push(result.insertId);
                }
            }
        }

        // 3. 더 이상 입력되지 않은 기존 캐릭터 삭제
        for (const existingChar of existingCharacters) {
            if (!character_names.includes(existingChar.character_name)) {
                // 삭제 대상 캐릭터의 종속 데이터 (e.g., character_life_skills, character_tasks) 먼저 삭제
                await pool.query('DELETE FROM character_life_skills WHERE character_id = ?', [existingChar.character_id]);
                await pool.query('DELETE FROM character_tasks WHERE character_id = ?', [existingChar.character_id]);
                // 캐릭터 테이블에서 삭제
                await pool.query('DELETE FROM characters WHERE character_id = ?', [existingChar.character_id]);
            }
        }

        res.status(200).json({ message: '캐릭터 정보가 성공적으로 저장되었습니다.', updatedCharacterIds });
    } catch (err) {
        console.error('캐릭터 저장/업데이트 오류:', err);
        res.status(500).json({ message: '캐릭터 정보를 저장하는 데 실패했습니다.' });
    }
};

// 특정 사용자의 특정 서버 캐릭터 조회
const getCharactersByServerAndUser = async (req, res, dbManager) => {
    const { user_id, server_name } = req.params;
    try {
        const pool = dbManager.getPool();

        const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [server_name]);
        if (serverRows.length === 0) {
            return res.status(404).json({ message: '서버를 찾을 수 없습니다.' });
        }
        const server_id = serverRows[0].server_id;

        const [characters] = await pool.query(
            'SELECT character_id, character_name, db_name FROM characters WHERE user_id = ? AND server_id = ? ORDER BY character_name',
            [user_id, server_id]
        );
        res.json(characters);
    } catch (err) {
        console.error('캐릭터 조회 오류:', err);
        res.status(500).json({ message: '캐릭터를 불러오는 데 실패했습니다.' });
    }
};

module.exports = {
    createOrUpdateCharacters,
    getCharactersByServerAndUser
}; 