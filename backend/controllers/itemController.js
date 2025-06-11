const { getPool } = require('../utils/dbManager');

let itemsCache = { data: null, timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getAllItems = async (req, res, dbManager) => {
  try {
    if (itemsCache.data && Date.now() - itemsCache.timestamp < CACHE_TTL) {
      return res.json(itemsCache.data);
    }
    const metaPool = dbManager.getPool();
    const [rows] = await metaPool.query('SELECT * FROM items');
    itemsCache = { data: rows, timestamp: Date.now() };
    res.json(rows);
  } catch (err) {
    console.error('모든 아이템 조회 오류:', err);
    res.status(500).json({ message: '아이템을 불러오는 데 실패했습니다.' });
  }
};

const getItemById = async (req, res, dbManager) => {
  const { item_id } = req.params;
  try {
    const metaPool = dbManager.getPool();
    const [rows] = await metaPool.query('SELECT * FROM items WHERE item_id = ?', [item_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('아이템 ID로 조회 오류:', err);
    res.status(500).json({ message: '아이템을 불러오는 데 실패했습니다.' });
  }
};

const getItemDetails = async (req, res, pool) => {
  const { item_id } = req.params;
  try {
    // items 테이블에서 기본 정보 조회
    const [itemRows] = await pool.query('SELECT * FROM items WHERE item_id = ?', [item_id]);
    if (itemRows.length === 0) {
      return res.status(404).send('아이템을 찾을 수 없습니다.');
    }
    const item = itemRows[0];

    // 아이템 타입에 따른 추가 정보 조회
    let details = { ...item };

    switch (item.item_type) {
      case '소모품':
        const [consumableRows] = await pool.query('SELECT * FROM consumables WHERE item_id = ?', [item_id]);
        if (consumableRows.length > 0) {
          details = { ...details, ...consumableRows[0] };
        }
        break;
      case '재료':
        const [materialRows] = await pool.query('SELECT * FROM materials WHERE item_id = ?', [item_id]);
        if (materialRows.length > 0) {
          details = { ...details, ...materialRows[0] };
        }
        break;
      case '무기':
      case '방어구':
      case '장신구':
        const [equipmentRows] = await pool.query('SELECT * FROM equipment WHERE item_id = ?', [item_id]);
        if (equipmentRows.length > 0) {
          details = { ...details, ...equipmentRows[0] };
          // 원소 저항 정보 추가
          const [resistances] = await pool.query('SELECT element, resistance_value FROM equipment_element_resistances WHERE equipment_id = ?', [item_id]);
          details.element_resistances = resistances.reduce((acc, curr) => {
            acc[curr.element] = curr.resistance_value;
            return acc;
          }, {});
        }
        // 장신구인 경우 특수 옵션 추가
        if (item.item_type === '장신구') {
          const [accessoryOptions] = await pool.query('SELECT option_description FROM accessory_special_options WHERE item_id = ?', [item_id]);
          if (accessoryOptions.length > 0) {
            details.special_option = accessoryOptions[0].option_description;
          }
        }
        break;
      case '설계도':
        const [blueprintRows] = await pool.query('SELECT * FROM blueprints WHERE item_id = ?', [item_id]);
        if (blueprintRows.length > 0) {
          details = { ...details, ...blueprintRows[0] };
        }
        break;
      default:
        // 기타 아이템 타입
        break;
    }

    // 강화 정보 추가 (있을 경우)
    const [enhancementRows] = await pool.query('SELECT E.current_level, E.next_level, E.success_rate, EE.effect_type, EE.effect_value FROM enhancements E LEFT JOIN enhancement_effects EE ON E.enhancement_id = EE.enhancement_id WHERE E.item_id = ?', [item_id]);
    if (enhancementRows.length > 0) {
      details.enhancements = enhancementRows.map(row => ({
        current_level: row.current_level,
        next_level: row.next_level,
        success_rate: row.success_rate,
        effect_type: row.effect_type,
        effect_value: row.effect_value
      }));
    }

    // 세트 효과 정보 추가 (있을 경우)
    const [setEffectRows] = await pool.query('SELECT SE.set_name, SE.effect_description FROM set_effects SE JOIN set_effect_items SEI ON SE.set_id = SEI.set_id WHERE SEI.item_id = ?', [item_id]);
    if (setEffectRows.length > 0) {
      details.set_effects = setEffectRows;
    }

    res.json(details);
  } catch (err) {
    console.error('아이템 상세 조회 오류:', err);
    res.status(500).send('아이템 상세 정보를 불러오는 데 실패했습니다.');
  }
};

const getUserInventory = async (req, res, dbManager) => {
  const userId = 1; // For now, we'll use a hardcoded user ID. This should be replaced with actual user authentication.
  try {
    const pool = dbManager.getPool();
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
      WHERE i.category IN ('나무 베기', '광석 캐기', '약초 채집', '양털 깎기', '호미질', '곤충 채집', '낚시 채집', '일상 채집', '곡물 추수')
      ORDER BY i.name
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('사용자 인벤토리 조회 오류:', err);
    res.status(500).json({ message: '사용자 인벤토리를 불러오는 데 실패했습니다.' });
  }
};

const updateUserItemQuantity = async (req, res, dbManager) => {
  const userId = 1; // For now, we'll use a hardcoded user ID. This should be replaced with actual user authentication.
  const { item_id, quantity } = req.body;
  try {
    const pool = dbManager.getPool();
    // Check if the item exists in the user's inventory, if not, insert it, otherwise update
    const [result] = await pool.query(
      'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)',
      [userId, item_id, quantity]
    );
    res.json({ message: '아이템 수량 업데이트 성공', changes: result.changedRows });
  } catch (err) {
    console.error('아이템 수량 업데이트 오류:', err);
    res.status(500).json({ message: '아이템 수량 업데이트에 실패했습니다.' });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  getItemDetails,
  getUserInventory,
  updateUserItemQuantity
}; 