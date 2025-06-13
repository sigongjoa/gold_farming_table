const { getPool } = require('../utils/dbManager');

const getServers = async (req, res) => {
  console.debug('getServers 함수 진입');
  try {
    const pool = getPool();
    console.debug('DB 풀 가져오기 성공');
    const [rows] = await pool.query('SELECT * FROM servers');
    console.log(`DEBUG: serverController.js - Rows fetched from servers table: ${JSON.stringify(rows)}`);
    console.debug(`조회된 서버 목록: ${JSON.stringify(rows)}`);
    res.json(rows);
    console.debug('getServers 함수 종료 (성공)');
  } catch (err) {
    console.error('서버 목록 조회 오류:', err);
    console.debug('getServers 함수 종료 (오류)');
    res.status(500).json({ message: '서버 목록을 불러오는 데 실패했습니다.' });
  }
};

const createCharacter = async (req, res) => {
  console.debug('createCharacter 함수 진입');
  const { characterName, userId, level, profession_name } = req.body;
  const { serverName } = req.params;
  console.debug(`입력값 - serverName: ${serverName}, characterName: ${characterName}, userId: ${userId}, level: ${level}, profession_name: ${profession_name}`);
  
  if (!serverName || !characterName || !userId) {
    console.debug('유효성 검사 실패: 서버명, 캐릭터명, 사용자 ID는 필수입니다.');
    return res.status(400).json({ message: '서버명, 캐릭터명, 사용자 ID는 필수입니다.' });
  }

  const pool = getPool();
  console.debug('DB 풀 가져오기 성공');

  try {
    // 1. server_id 가져오기
    console.debug('createCharacter - serverName:', serverName);
    const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [serverName]);
    console.debug(`서버 조회 결과: ${JSON.stringify(serverRows)}`);
    if (serverRows.length === 0) {
      console.debug(`해당 서버를 찾을 수 없음: ${serverName}`);
      return res.status(404).json({ message: '해당 서버를 찾을 수 없습니다.' });
    }
    const serverId = serverRows[0].server_id;
    console.debug('createCharacter - serverId:', serverId);

    // 2. profession_id 가져오기 (profession_name이 제공된 경우)
    let professionId = null;
    if (profession_name) {
      const [professionRows] = await pool.query('SELECT id FROM professions WHERE name = ?', [profession_name]);
      if (professionRows.length > 0) {
        professionId = professionRows[0].id;
        console.debug('createCharacter - professionId:', professionId);
      }
    }

    // 3. characters 테이블에 캐릭터 정보 삽입
    const dbName = 'mabinogi_item_db'; 
    console.debug('createCharacter - userId:', userId, 'characterName:', characterName, 'dbName:', dbName, 'level:', level, 'professionId:', professionId);

    const [insertResult] = await pool.query(
      'INSERT INTO characters (server_id, user_id, character_name, level, profession_id, db_name) VALUES (?, ?, ?, ?, ?, ?)',
      [serverId, userId, characterName, level || 1, professionId, dbName]
    );
    console.debug(`캐릭터 삽입 결과: ${JSON.stringify(insertResult)}`);

    res.status(201).json({ 
      message: '캐릭터가 성공적으로 생성되었습니다.', 
      characterId: insertResult.insertId, 
      dbName: dbName 
    });
    console.debug('createCharacter 함수 종료 (성공)');

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.debug('캐릭터 생성 오류: ER_DUP_ENTRY (이미 존재하는 캐릭터명)');
      return res.status(409).json({ message: '이미 존재하는 캐릭터명입니다.' });
    }
    console.error('캐릭터 생성 오류:', err);
    console.debug('createCharacter 함수 종료 (오류)');
    res.status(500).json({ message: '캐릭터 생성에 실패했습니다.' });
  }
};

const getCharacters = async (req, res) => {
  console.debug('getCharacters 함수 진입');
  const { serverName } = req.params;
  const userId = req.query.userId;
  console.debug(`입력값 - serverName: ${serverName}, userId: ${userId}`);
  
  const pool = getPool();
  console.debug('DB 풀 가져오기 성공');

  try {
    console.debug('getCharacters - serverName:', serverName);
    // 1. server_id 가져오기
    const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [serverName]);
    console.debug(`서버 조회 결과: ${JSON.stringify(serverRows)}`);
    if (serverRows.length === 0) {
      console.debug(`해당 서버를 찾을 수 없음: ${serverName}`);
      return res.status(404).json({ message: '해당 서버를 찾을 수 없습니다.' });
    }
    const serverId = serverRows[0].server_id;
    console.debug('getCharacters - serverId:', serverId);

    let characterRows;
    if (userId) {
      // 해당 유저의 캐릭터만 반환
      [characterRows] = await pool.query(
        'SELECT c.character_id, c.character_name, c.level, p.name AS profession_name FROM characters c LEFT JOIN professions p ON c.profession_id = p.id WHERE c.server_id = ? AND c.user_id = ? ORDER BY c.character_name',
        [serverId, userId]
      );
    } else {
      // 전체 캐릭터 반환
      [characterRows] = await pool.query(
        'SELECT c.character_id, c.character_name, c.level, p.name AS profession_name FROM characters c LEFT JOIN professions p ON c.profession_id = p.id WHERE c.server_id = ? ORDER BY c.character_name',
        [serverId]
      );
    }
    console.debug(`조회된 캐릭터 목록: ${JSON.stringify(characterRows)}`);

    res.json(characterRows);
    console.debug('getCharacters 함수 종료 (성공)');

  } catch (err) {
    console.error('캐릭터 목록 조회 오류:', err);
    console.debug('getCharacters 함수 종료 (오류)');
    res.status(500).json({ message: '캐릭터 목록을 불러오는 데 실패했습니다.' });
  }
};

const getAllCharacters = async (req, res) => {
  console.debug('getAllCharacters 함수 진입');
  const pool = getPool();
  console.debug('DB 풀 가져오기 성공');
  try {
    const [characterRows] = await pool.query(
      'SELECT c.character_id, c.character_name, c.level, p.name AS profession_name, s.name AS server_name FROM characters c JOIN servers s ON c.server_id = s.server_id LEFT JOIN professions p ON c.profession_id = p.id ORDER BY s.name, c.character_name');
    console.debug(`조회된 모든 캐릭터 목록: ${JSON.stringify(characterRows)}`);
    res.json(characterRows);
    console.debug('getAllCharacters 함수 종료 (성공)');
  } catch (err) {
    console.error('모든 캐릭터 목록 조회 오류:', err);
    console.debug('getAllCharacters 함수 종료 (오류)');
    res.status(500).json({ message: '모든 캐릭터를 불러오는 데 실패했습니다.' });
  }
};

module.exports = {
  getServers,
  createCharacter,
  getCharacters,
  getAllCharacters
}; 