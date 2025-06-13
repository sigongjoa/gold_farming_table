const { getPool } = require('../utils/dbManager');

// 캐릭터 생성 또는 업데이트
const createOrUpdateCharacters = async (req, res, dbManager) => {
    console.debug('createOrUpdateCharacters 함수 진입');
    const { user_id } = req.params;
    const { server_name, characters: characterList } = req.body; // character_names 대신 characters로 변경, 객체 배열 기대
    console.debug(`입력값 - user_id: ${user_id}, server_name: ${server_name}, characters: ${JSON.stringify(characterList)}`);

    if (!server_name || !characterList || !Array.isArray(characterList)) {
        console.debug('유효성 검사 실패: 서버 이름 또는 캐릭터 목록 배열이 유효하지 않습니다.');
        return res.status(400).json({ message: '서버 이름과 캐릭터 목록 배열은 필수입니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        // 1. 서버 ID 가져오기
        const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [server_name]);
        console.debug(`서버 조회 결과: ${JSON.stringify(serverRows)}`);
        if (serverRows.length === 0) {
            console.debug(`서버를 찾을 수 없음: ${server_name}`);
            return res.status(404).json({ message: '서버를 찾을 수 없습니다.' });
        }
        const server_id = serverRows[0].server_id;
        console.debug(`서버 ID: ${server_id}`);

        // 직업명 -> 직업 ID 매핑을 위해 모든 직업 가져오기
        const [professionRows] = await pool.query('SELECT id, name FROM professions');
        const professionMap = new Map();
        professionRows.forEach(p => professionMap.set(p.name, p.id));
        console.debug(`직업 맵: ${JSON.stringify(Array.from(professionMap.entries()))}`);

        // 2. 현재 사용자의 해당 서버 캐릭터 목록 가져오기
        const [existingCharacters] = await pool.query(
            'SELECT character_id, character_name, level, profession_id FROM characters WHERE user_id = ? AND server_id = ?',
            [user_id, server_id]
        );
        console.debug(`기존 캐릭터 조회 결과: ${JSON.stringify(existingCharacters)}`);

        const existingCharacterMap = new Map();
        existingCharacters.forEach(char => existingCharacterMap.set(char.character_name, char)); // 전체 캐릭터 객체 저장
        console.debug(`기존 캐릭터 맵: ${JSON.stringify(Array.from(existingCharacterMap.entries()))}`);

        const updatedCharacterIds = [];
        const currentCharacterNames = new Set(); // 유지되어야 할 캐릭터 이름을 추적
        console.debug('캐릭터 업데이트/생성 시작');
        for (const char of characterList) {
            const trimmedName = char.character_name.trim();
            const level = char.level || 1; // 레벨 기본값 1
            const profession_name = char.profession_name;

            console.debug(`처리 중인 캐릭터: ${trimmedName}, 레벨: ${level}, 직업: ${profession_name}`);

            if (trimmedName) {
                currentCharacterNames.add(trimmedName);

                let profession_id = null;
                if (profession_name) {
                    profession_id = professionMap.get(profession_name);
                    if (!profession_id) {
                        console.debug(`유효하지 않은 직업명: ${profession_name}`);
                        return res.status(400).json({ message: `유효하지 않은 직업명: ${profession_name}` });
                    }
                }

                if (existingCharacterMap.has(trimmedName)) {
                    console.debug(`기존 캐릭터 발견, 업데이트: ${trimmedName}`);
                    const existingChar = existingCharacterMap.get(trimmedName);
                    // 레벨 또는 직업 ID가 변경되었는지 확인
                    if (existingChar.level !== level || existingChar.profession_id !== profession_id) {
                        console.debug('createOrUpdateCharacters: Updating existing character level or profession');
                        await pool.query(
                            'UPDATE characters SET level = ?, profession_id = ? WHERE character_id = ?',
                            [level, profession_id, existingChar.character_id]
                        );
                        console.debug(`캐릭터 업데이트됨: ${trimmedName}, 레벨: ${level}, 직업 ID: ${profession_id}`);
                    } else {
                        console.debug(`캐릭터 변경 없음: ${trimmedName}`);
                    }
                    updatedCharacterIds.push(existingChar.character_id);
                } else {
                    console.debug(`새로운 캐릭터 생성: ${trimmedName}`);
                    console.debug('createOrUpdateCharacters: Inserting new character');
                    const [result] = await pool.query(
                        'INSERT INTO characters (server_id, user_id, character_name, level, profession_id, db_name) VALUES (?, ?, ?, ?, ?, ?)',
                        [server_id, user_id, trimmedName, level, profession_id, 'mabinogi_item_db']
                    );
                    updatedCharacterIds.push(result.insertId);
                    console.debug(`새로운 캐릭터 ID 추가됨: ${result.insertId}`);
                }
            }
        }
        console.debug('캐릭터 업데이트/생성 완료');

        // 3. 더 이상 입력되지 않은 기존 캐릭터 삭제
        console.debug('삭제 대상 캐릭터 확인 시작');
        for (const existingChar of existingCharacters) {
            if (!currentCharacterNames.has(existingChar.character_name)) {
                console.debug(`삭제 대상 캐릭터: ${existingChar.character_name}`);
                console.debug('createOrUpdateCharacters: Deleting character related data');
                // 삭제 대상 캐릭터의 종속 데이터 먼저 삭제
                await pool.query('DELETE FROM character_life_skills WHERE character_id = ?', [existingChar.character_id]);
                console.debug(`character_life_skills 삭제 완료 (character_id: ${existingChar.character_id})`);
                await pool.query('DELETE FROM character_tasks WHERE character_id = ?', [existingChar.character_id]);
                console.debug(`character_tasks 삭제 완료 (character_id: ${existingChar.character_id})`);
                await pool.query('DELETE FROM character_equipped_items WHERE character_id = ?', [existingChar.character_id]);
                console.debug(`character_equipped_items 삭제 완료 (character_id: ${existingChar.character_id})`);
                await pool.query('DELETE FROM user_character_tasks WHERE character_id = ?', [existingChar.character_id]);
                console.debug(`user_character_tasks 삭제 완료 (character_id: ${existingChar.character_id})`);

                // 캐릭터 테이블에서 삭제
                await pool.query('DELETE FROM characters WHERE character_id = ?', [existingChar.character_id]);
                console.debug(`캐릭터 삭제 완료 (character_id: ${existingChar.character_id})`);
            }
        }
        console.debug('삭제 대상 캐릭터 확인 완료');

        res.status(200).json({ message: '캐릭터 정보가 성공적으로 저장되었습니다.', updatedCharacterIds });
        console.debug('createOrUpdateCharacters 함수 종료 (성공)');
    } catch (err) {
        console.error('캐릭터 저장/업데이트 오류:', err);
        console.debug('createOrUpdateCharacters 함수 종료 (오류)');
        res.status(500).json({ message: '캐릭터 정보를 저장하는 데 실패했습니다.' });
    }
};

// 특정 사용자의 특정 서버 캐릭터 조회
const getCharactersByServerAndUser = async (req, res, dbManager) => {
    console.debug('getCharactersByServerAndUser 함수 진입');
    const { user_id, server_name } = req.params;
    console.debug(`입력값 - user_id: ${user_id}, server_name: ${server_name}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [server_name]);
        console.debug(`서버 조회 결과: ${JSON.stringify(serverRows)}`);
        if (serverRows.length === 0) {
            console.debug(`서버를 찾을 수 없음: ${server_name}`);
            return res.status(404).json({ message: '서버를 찾을 수 없습니다.' });
        }
        const server_id = serverRows[0].server_id;
        console.debug(`서버 ID: ${server_id}`);

        const [characters] = await pool.query(
            `SELECT c.character_id, c.character_name, c.level, p.name AS profession_name
             FROM characters c
             LEFT JOIN professions p ON c.profession_id = p.id
             WHERE c.user_id = ? AND c.server_id = ?
             ORDER BY c.character_name`,
            [user_id, server_id]
        );
        console.debug(`조회된 캐릭터 목록: ${JSON.stringify(characters)}`);
        res.json(characters);
        console.debug('getCharactersByServerAndUser 함수 종료 (성공)');
    } catch (err) {
        console.error('캐릭터 조회 오류:', err);
        console.debug('getCharactersByServerAndUser 함수 종료 (오류)');
        res.status(500).json({ message: '캐릭터를 불러오는 데 실패했습니다.' });
    }
};

// 특정 사용자의 특정 캐릭터 조회
const getCharactersByUserIdAndCharacterName = async (req, res, dbManager) => {
    console.debug('getCharactersByUserIdAndCharacterName 함수 진입');
    const { user_id, character_name } = req.params;
    console.debug(`입력값 - user_id: ${user_id}, character_name: ${character_name}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [characters] = await pool.query(
            `SELECT c.character_id, c.character_name, c.level, p.name AS profession_name
             FROM characters c
             LEFT JOIN professions p ON c.profession_id = p.id
             WHERE c.user_id = ? AND c.character_name = ?`,
            [user_id, character_name]
        );
        console.debug(`조회된 캐릭터: ${JSON.stringify(characters)}`);

        if (characters.length === 0) {
            console.debug(`캐릭터를 찾을 수 없음: user_id=${user_id}, character_name=${character_name}`);
            return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
        }

        res.json(characters[0]); // 단일 캐릭터를 반환하므로 첫 번째 항목 반환
        console.debug('getCharactersByUserIdAndCharacterName 함수 종료 (성공)');
    } catch (err) {
        console.error('캐릭터 조회 오류:', err);
        console.debug('getCharactersByUserIdAndCharacterName 함수 종료 (오류)');
        res.status(500).json({ message: '캐릭터를 불러오는 데 실패했습니다.' });
    }
};

// 모든 서버 목록 가져오기
const getServers = async (req, res, dbManager) => {
    console.debug('getServers 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [servers] = await pool.query('SELECT name FROM servers ORDER BY name');
        console.debug(`조회된 서버 목록: ${JSON.stringify(servers)}`);
        res.json(servers.map(server => server.name));
        console.debug('getServers 함수 종료 (성공)');
    } catch (err) {
        console.error('서버 목록 조회 오류:', err);
        console.debug('getServers 함수 종료 (오류)');
        res.status(500).json({ message: '서버 목록을 불러오는 데 실패했습니다.' });
    }
};

module.exports = {
    createOrUpdateCharacters,
    getCharactersByServerAndUser,
    getCharactersByUserIdAndCharacterName,
    getServers
};