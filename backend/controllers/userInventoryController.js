const { getPool } = require('../utils/dbManager');

const getUserInventory = async (req, res, dbManager) => {
  const user_id = req.params.user_id;

  try {
    const pool = dbManager.getPool();
    const [rows] = await pool.query(
      `SELECT ui.item_id, ui.quantity, i.name AS item_name, i.description
       FROM user_inventory ui
       JOIN items i ON ui.item_id = i.id
       WHERE ui.user_id = ?`, [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('사용자 인벤토리 조회 오류:', err);
    res.status(500).json({ message: '인벤토리를 불러오는 데 실패했습니다.' });
  }
};

const addItemToInventory = async (req, res, dbManager) => {
  const user_id = req.params.user_id;
  const { item_id, quantity } = req.body;

  if (!item_id || quantity === undefined) {
    return res.status(400).json({ message: '아이템 ID와 수량은 필수입니다.' });
  }

  try {
    const pool = dbManager.getPool();
    const [result] = await pool.query(
      'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
      [user_id, item_id, quantity]
    );
    res.status(201).json({ message: '아이템이 인벤토리에 추가되었습니다.', result: result });
  } catch (err) {
    console.error('인벤토리 아이템 추가 오류:', err);
    res.status(500).json({ message: '아이템을 인벤토리에 추가하는 데 실패했습니다.' });
  }
};

const updateInventoryItem = async (req, res, dbManager) => {
  const user_id = req.params.user_id;
  const { item_id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: '수량은 0 이상이어야 합니다.' });
  }

  try {
    const pool = dbManager.getPool();
    const [result] = await pool.query(
      'UPDATE user_inventory SET quantity = ? WHERE user_id = ? AND item_id = ?',
      [quantity, user_id, item_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '해당 아이템을 인벤토리에서 찾을 수 없습니다.' });
    }

    res.json({ message: '아이템 수량이 업데이트되었습니다.' });
  } catch (err) {
    console.error('인벤토리 아이템 업데이트 오류:', err);
    res.status(500).json({ message: '아이템 수량 업데이트에 실패했습니다.' });
  }
};

const deleteInventoryItem = async (req, res, dbManager) => {
  const user_id = req.params.user_id;
  const { item_id } = req.params;

  try {
    const pool = dbManager.getPool();
    const [result] = await pool.query(
      'DELETE FROM user_inventory WHERE user_id = ? AND item_id = ?',
      [user_id, item_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '해당 아이템을 인벤토리에서 찾을 수 없습니다.' });
    }

    res.json({ message: '아이템이 인벤토리에서 삭제되었습니다.' });
  } catch (err) {
    console.error('인벤토리 아이템 삭제 오류:', err);
    res.status(500).json({ message: '아이템 삭제에 실패했습니다.' });
  }
};

module.exports = {
  getUserInventory,
  addItemToInventory,
  updateInventoryItem,
  deleteInventoryItem,
}; 