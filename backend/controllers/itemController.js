const { getPool } = require('../utils/dbManager');
const logger = console; // 임시로 console을 logger로 사용. 실제 로깅 라이브러리 (예: winston)로 교체 필요

let itemsCache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getAllItems = async (req, res, dbManager) => {
  logger.debug('getAllItems 함수 진입');
  try {
    if (itemsCache.data && Date.now() - itemsCache.timestamp < CACHE_TTL) {
      logger.debug('캐시된 아이템 데이터 반환');
      return res.json(itemsCache.data);
    }
    logger.debug('캐시 만료 또는 없음, DB에서 아이템 조회');
    const metaPool = dbManager.getPool();
    logger.debug('DB 풀 가져오기 성공');
    const [rows] = await metaPool.query('SELECT * FROM items');
    itemsCache = { data: rows, timestamp: Date.now() };
    logger.debug(`조회된 모든 아이템: ${rows.length}개`);
    res.json(rows);
    logger.debug('getAllItems 함수 종료 (성공)');
  } catch (err) {
    logger.error('모든 아이템 조회 오류:', err);
    logger.debug('getAllItems 함수 종료 (오류)');
    res.status(500).json({ message: '아이템을 불러오는 데 실패했습니다.' });
  }
};

const getItemById = async (req, res, dbManager) => {
  logger.debug('getItemById 함수 진입');
  const { item_id } = req.params;
  logger.debug(`입력값 - item_id: ${item_id}`);
  try {
    const metaPool = dbManager.getPool();
    logger.debug('DB 풀 가져오기 성공');
    const [rows] = await metaPool.query('SELECT * FROM items WHERE item_id = ?', [item_id]);
    logger.debug(`아이템 ID로 조회 결과: ${JSON.stringify(rows)}`);
    if (rows.length === 0) {
      logger.debug(`아이템을 찾을 수 없음: item_id=${item_id}`);
      return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
    logger.debug('getItemById 함수 종료 (성공)');
  } catch (err) {
    logger.error('아이템 ID로 조회 오류:', err);
    logger.debug('getItemById 함수 종료 (오류)');
    res.status(500).json({ message: '아이템을 불러오는 데 실패했습니다.' });
  }
};

const getItemDetails = async (req, res, pool) => {
  logger.debug('getItemDetails 함수 진입');
  const { item_id } = req.params;
  logger.debug(`입력값 - item_id: ${item_id}`);
  try {
    logger.debug('DB 풀 가져오기 성공');
    // items 테이블에서 기본 정보 조회
    const [itemRows] = await pool.query('SELECT * FROM items WHERE item_id = ?', [item_id]);
    logger.debug(`기본 아이템 정보 조회 결과: ${JSON.stringify(itemRows)}`);
    if (itemRows.length === 0) {
      logger.debug(`아이템 상세 정보를 찾을 수 없음: item_id=${item_id}`);
      return res.status(404).send('아이템을 찾을 수 없습니다.');
    }
    const item = itemRows[0];
    logger.debug(`조회된 기본 아이템 정보: ${JSON.stringify(item)}`);

    // 아이템 타입에 따른 추가 정보 조회
    let details = { ...item };
    logger.debug(`아이템 타입: ${item.item_type}`);

    switch (item.item_type) {
      case '소모품':
        logger.debug('아이템 타입: 소모품, 소모품 정보 조회 시작');
        const [consumableRows] = await pool.query('SELECT * FROM consumables WHERE item_id = ?', [item_id]);
        if (consumableRows.length > 0) {
          details = { ...details, ...consumableRows[0] };
          logger.debug(`소모품 정보 추가됨: ${JSON.stringify(consumableRows[0])}`);
        }
        break;
      case '재료':
        logger.debug('아이템 타입: 재료, 재료 정보 조회 시작');
        const [materialRows] = await pool.query('SELECT * FROM materials WHERE item_id = ?', [item_id]);
        if (materialRows.length > 0) {
          details = { ...details, ...materialRows[0] };
          logger.debug(`재료 정보 추가됨: ${JSON.stringify(materialRows[0])}`);
        }
        break;
      case '무기':
      case '방어구':
      case '장신구':
        logger.debug('아이템 타입: 무기/방어구/장신구, 장비 정보 조회 시작');
        const [equipmentRows] = await pool.query('SELECT * FROM equipment WHERE item_id = ?', [item_id]);
        if (equipmentRows.length > 0) {
          details = { ...details, ...equipmentRows[0] };
          logger.debug(`장비 정보 추가됨: ${JSON.stringify(equipmentRows[0])}`);
          // 원소 저항 정보 추가
          logger.debug('원소 저항 정보 조회 시작');
          const [resistances] = await pool.query('SELECT element, resistance_value FROM equipment_element_resistances WHERE equipment_id = ?', [item_id]);
          details.element_resistances = resistances.reduce((acc, curr) => {
            acc[curr.element] = curr.resistance_value;
            return acc;
          }, {});
          logger.debug(`원소 저항 정보 추가됨: ${JSON.stringify(details.element_resistances)}`);
        }
        // 장신구인 경우 특수 옵션 추가
        if (item.item_type === '장신구') {
          logger.debug('아이템 타입: 장신구, 특수 옵션 조회 시작');
          const [accessoryOptions] = await pool.query('SELECT option_description FROM accessory_special_options WHERE item_id = ?', [item_id]);
          if (accessoryOptions.length > 0) {
            details.special_option = accessoryOptions[0].option_description;
            logger.debug(`장신구 특수 옵션 추가됨: ${details.special_option}`);
          }
        }
        break;
      case '설계도':
        logger.debug('아이템 타입: 설계도, 설계도 정보 조회 시작');
        const [blueprintRows] = await pool.query('SELECT * FROM blueprints WHERE item_id = ?', [item_id]);
        if (blueprintRows.length > 0) {
          details = { ...details, ...blueprintRows[0] };
          logger.debug(`설계도 정보 추가됨: ${JSON.stringify(blueprintRows[0])}`);
        }
        break;
      default:
        logger.debug('기타 아이템 타입');
        break;
    }

    // 강화 정보 추가 (있을 경우)
    logger.debug('강화 정보 조회 시작');
    const [enhancementRows] = await pool.query('SELECT E.current_level, E.next_level, E.success_rate, EE.effect_type, EE.effect_value FROM enhancements E LEFT JOIN enhancement_effects EE ON E.enhancement_id = EE.enhancement_id WHERE E.item_id = ?', [item_id]);
    if (enhancementRows.length > 0) {
      details.enhancements = enhancementRows.map(row => ({
        current_level: row.current_level,
        next_level: row.next_level,
        success_rate: row.success_rate,
        effect_type: row.effect_type,
        effect_value: row.effect_value
      }));
      logger.debug(`강화 정보 추가됨: ${JSON.stringify(details.enhancements)}`);
    }

    // 세트 효과 정보 추가 (있을 경우)
    logger.debug('세트 효과 정보 조회 시작');
    const [setEffectRows] = await pool.query('SELECT SE.set_name, SE.effect_description FROM set_effects SE JOIN set_effect_items SEI ON SE.set_id = SEI.set_id WHERE SEI.item_id = ?', [item_id]);
    if (setEffectRows.length > 0) {
      details.set_effects = setEffectRows;
      logger.debug(`세트 효과 정보 추가됨: ${JSON.stringify(details.set_effects)}`);
    }

    res.json(details);
    logger.debug('getItemDetails 함수 종료 (성공)');
  } catch (err) {
    logger.error('아이템 상세 조회 오류:', err);
    logger.debug('getItemDetails 함수 종료 (오류)');
    res.status(500).send('아이템 상세 정보를 불러오는 데 실패했습니다.');
  }
};

const getUserInventory = async (req, res, dbManager) => {
  logger.debug('getUserInventory 함수 진입');
  const userId = 1; // For now, we'll use a hardcoded user ID. This should be replaced with actual user authentication.
  logger.debug(`입력값 - userId: ${userId}`);
  try {
    const pool = dbManager.getPool();
    logger.debug('DB 풀 가져오기 성공');
    // 모든 아이템을 가져오고, user_inventory와 LEFT JOIN하여 수량을 가져옵니다.
    const [rows] = await pool.query(`
      SELECT 
        i.id AS item_id, 
        i.name, 
        i.description, 
        i.category, 
        i.collection_target, 
        i.required_level, 
        i.usage_details, 
        COALESCE(ui.quantity, 0) AS quantity
      FROM items i
      LEFT JOIN user_inventory ui ON i.id = ui.item_id AND ui.user_id = ?
      ORDER BY i.name
    `, [userId]);
    logger.debug(`사용자 인벤토리 조회 결과: ${JSON.stringify(rows)}`);
    res.json(rows);
    logger.debug('getUserInventory 함수 종료 (성공)');
  } catch (err) {
    logger.error('사용자 인벤토리 조회 오류:', err);
    logger.debug('getUserInventory 함수 종료 (오류)');
    res.status(500).json({ message: '사용자 인벤토리를 불러오는 데 실패했습니다.' });
  }
};

const updateUserItemQuantity = async (req, res, dbManager) => {
  logger.debug('updateUserItemQuantity 함수 진입');
  const userId = 1; // For now, we'll use a hardcoded user ID. This should be replaced with actual user authentication.
  const { item_id, quantity } = req.body;
  logger.debug(`입력값 - userId: ${userId}, item_id: ${item_id}, quantity: ${quantity}`);
  try {
    const pool = dbManager.getPool();
    logger.debug('DB 풀 가져오기 성공');
    // Check if the item exists in the user's inventory, if not, insert it, otherwise update
    const [result] = await pool.query(
      'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)',
      [userId, item_id, quantity]
    );
    logger.debug(`아이템 수량 업데이트 결과: ${JSON.stringify(result)}`);
    res.json({ message: '아이템 수량 업데이트 성공', changes: result.changedRows });
    logger.debug('updateUserItemQuantity 함수 종료 (성공)');
  } catch (err) {
    logger.error('아이템 수량 업데이트 오류:', err);
    logger.debug('updateUserItemQuantity 함수 종료 (오류)');
    res.status(500).json({ message: '아이템 수량 업데이트에 실패했습니다.' });
  }
};

// 소비 아이템(물약/비약/붕대 등)만 반환하는 API
const getConsumableItems = async (req, res, dbManager) => {
  logger.debug('getConsumableItems 함수 진입');
  try {
    const pool = dbManager.getPool();
    // '물약', '회복 아이템', '음식', '특수 아이템' 카테고리만 조회하도록 수정
    const [rows] = await pool.query("SELECT * FROM items WHERE category IN ('물약', '회복 아이템', '음식', '특수 아이템')");
    logger.debug('소비 아이템 rows:', rows);
    res.json(rows);
    logger.debug('getConsumableItems 함수 종료(성공)');
  } catch (err) {
    logger.debug('getConsumableItems 함수 종료(오류):', err);
    res.status(500).json({ error: '서버 오류' });
  }
};

// 엠블럼/룬만 반환하는 API
const getEmblemItems = async (req, res, dbManager) => {
  logger.debug('getEmblemItems 함수 진입');
  try {
    const pool = dbManager.getPool();
    // '엠블럼'과 '룬' 카테고리 모두 조회하도록 수정
    const [rows] = await pool.query("SELECT * FROM items WHERE category IN ('엠블럼', '룬')");
    logger.debug('엠블럼/룬 rows:', rows);
    res.json(rows);
    logger.debug('getEmblemItems 함수 종료(성공)');
  } catch (err) {
    logger.debug('getEmblemItems 함수 종료(오류):', err);
    res.status(500).json({ error: '서버 오류' });
  }
};

// 보석만 반환하는 API
const getGemItems = async (req, res, dbManager) => {
  logger.debug('getGemItems 함수 진입');
  try {
    const pool = dbManager.getPool();
    const [rows] = await pool.query("SELECT * FROM items WHERE category = '보석'");
    logger.debug('보석 rows:', rows);
    res.json(rows);
    logger.debug('getGemItems 함수 종료(성공)');
  } catch (err) {
    logger.debug('getGemItems 함수 종료(오류):', err);
    res.status(500).json({ error: '서버 오류' });
  }
};

// 재화만 반환하는 API
const getCurrencyItems = async (req, res, dbManager) => {
  logger.debug('getCurrencyItems 함수 진입');
  try {
    const pool = dbManager.getPool();
    const [rows] = await pool.query("SELECT * FROM items WHERE category = '재화'");
    logger.debug('재화 rows:', rows);
    res.json(rows);
    logger.debug('getCurrencyItems 함수 종료(성공)');
  } catch (err) {
    logger.debug('getCurrencyItems 함수 종료(오류):', err);
    res.status(500).json({ error: '서버 오류' });
  }
};

const getCharacterInventory = async (req, res, dbManager) => {
  logger.debug('getCharacterInventory 함수 진입');
  const { characterId } = req.params;
  logger.debug(`입력값 - characterId: ${characterId}`);
  try {
    const pool = dbManager.getPool();
    logger.debug('DB 풀 가져오기 성공');
    const [rows] = await pool.query(`
      SELECT 
        i.id AS item_id, 
        i.name, 
        i.description, 
        i.category, 
        i.collection_target, 
        i.required_level, 
        i.usage_details, 
        COALESCE(ci.quantity, 0) AS quantity
      FROM items i
      LEFT JOIN character_inventory ci ON i.id = ci.item_id AND ci.character_id = ?
      ORDER BY i.name
    `, [characterId]);
    logger.debug(`캐릭터 인벤토리 조회 결과: ${JSON.stringify(rows)}`);
    res.json(rows);
    logger.debug('getCharacterInventory 함수 종료 (성공)');
  } catch (err) {
    logger.error('캐릭터 인벤토리 조회 오류:', err);
    logger.debug('getCharacterInventory 함수 종료 (오류)');
    res.status(500).json({ message: '캐릭터 인벤토리를 불러오는 데 실패했습니다.' });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  getItemDetails,
  getUserInventory,
  updateUserItemQuantity,
  getConsumableItems,
  getEmblemItems,
  getGemItems,
  getCurrencyItems,
  getCharacterInventory
}; 