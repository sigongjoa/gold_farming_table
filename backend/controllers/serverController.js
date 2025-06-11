const { getPool } = require('../utils/dbManager');

const getServers = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM servers');
    res.json(rows);
  } catch (err) {
    console.error('서버 목록 조회 오류:', err);
    res.status(500).json({ message: '서버 목록을 불러오는 데 실패했습니다.' });
  }
};

const createCharacter = async (req, res) => {
  const { serverName, characterName, userId } = req.body;
  
  if (!serverName || !characterName || !userId) {
    return res.status(400).json({ message: '서버명, 캐릭터명, 사용자 ID는 필수입니다.' });
  }

  const pool = getPool();

  try {
    // 1. server_id 가져오기
    console.log('createCharacter - serverName:', serverName);
    const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [serverName]);
    if (serverRows.length === 0) {
      return res.status(404).json({ message: '해당 서버를 찾을 수 없습니다.' });
    }
    const serverId = serverRows[0].server_id;
    console.log('createCharacter - serverId:', serverId);

    // 2. characters 테이블에 캐릭터 정보 삽입
    // db_name은 단일 DB 모델에서는 더 이상 동적으로 생성되지 않으므로, 고정된 값을 사용하거나 제거합니다.
    // 여기서는 단순히 'mabinogi_item_db'로 고정합니다.
    const dbName = 'mabinogi_item_db'; 
    console.log('createCharacter - userId:', userId, 'characterName:', characterName, 'dbName:', dbName);

    const [insertResult] = await pool.query(
      'INSERT INTO characters (server_id, user_id, character_name, db_name) VALUES (?, ?, ?, ?)',
      [serverId, userId, characterName, dbName]
    );

    res.status(201).json({ 
      message: '캐릭터가 성공적으로 생성되었습니다.', 
      characterId: insertResult.insertId, 
      dbName: dbName 
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 존재하는 캐릭터명입니다.' });
    }
    console.error('캐릭터 생성 오류:', err);
    res.status(500).json({ message: '캐릭터 생성에 실패했습니다.' });
  }
};

const getCharacters = async (req, res) => {
  const { serverName } = req.params;
  
  const pool = getPool();

  try {
    console.log('getCharacters - serverName:', serverName);
    // 1. server_id 가져오기
    const [serverRows] = await pool.query('SELECT server_id FROM servers WHERE name = ?', [serverName]);
    if (serverRows.length === 0) {
      return res.status(404).json({ message: '해당 서버를 찾을 수 없습니다.' });
    }
    const serverId = serverRows[0].server_id;
    console.log('getCharacters - serverId:', serverId);

    // 2. 해당 서버의 캐릭터 목록 조회
    const [characterRows] = await pool.query(
      'SELECT character_id, character_name, db_name FROM characters WHERE server_id = ? ORDER BY character_name',
      [serverId]
    );

    res.json(characterRows);

  } catch (err) {
    console.error('캐릭터 목록 조회 오류:', err);
    res.status(500).json({ message: '캐릭터 목록을 불러오는 데 실패했습니다.' });
  }
};

const getAllCharacters = async (req, res) => {
  const pool = getPool();
  try {
    const [characterRows] = await pool.query(
      'SELECT c.character_id, c.character_name, c.db_name, s.name AS server_name FROM characters c JOIN servers s ON c.server_id = s.server_id ORDER BY s.name, c.character_name');
    res.json(characterRows);
  } catch (err) {
    console.error('모든 캐릭터 목록 조회 오류:', err);
    res.status(500).json({ message: '모든 캐릭터를 불러오는 데 실패했습니다.' });
  }
};

module.exports = {
  getServers,
  createCharacter,
  getCharacters,
  getAllCharacters
}; 