const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../data/items.json');
const userInventoryPath = path.join(__dirname, '../data/user_inventory.json');

const loadJsonData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
};

const saveJsonData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
};

const getUserInventory = async (req, res) => {
  const { user_id } = req.params;
  try {
    const userInventoryData = loadJsonData(userInventoryPath);
    const allItems = loadJsonData(itemsPath); // Load all items

    const inventoryWithDetails = userInventoryData
      .filter(item => item.user_id === Number(user_id))
      .map(inventoryItem => {
        const itemDetail = allItems.find(item => item.item_id === inventoryItem.item_id);
        return {
          ...inventoryItem,
          item_name: itemDetail ? itemDetail.name : '알 수 없는 아이템',
          icon_url: itemDetail ? itemDetail.icon_url : null,
        };
      });

    res.json(inventoryWithDetails);

  } catch (err) {
    console.error('오류 발생:', err);
    res.status(500).json({ message: '인벤토리를 불러오는 데 실패했습니다.' });
  }
};

const addItemToInventory = async (req, res) => {
  const { user_id } = req.params;
  const { item_id, quantity } = req.body;

  if (!item_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: '아이템 ID와 유효한 수량을 제공해야 합니다.' });
  }

  try {
    const allItems = loadJsonData(itemsPath);
    const userInventoryData = loadJsonData(userInventoryPath);

    const itemExists = allItems.some(item => item.item_id === Number(item_id));
    if (!itemExists) {
      return res.status(404).json({ message: '존재하지 않는 아이템입니다.' });
    }

    let itemUpdated = false;
    const updatedInventory = userInventoryData.map(item => {
      if (item.user_id === Number(user_id) && item.item_id === Number(item_id)) {
        itemUpdated = true;
        return { ...item, quantity: item.quantity + quantity };
      }
      return item;
    });

    if (!itemUpdated) {
      updatedInventory.push({
        user_id: Number(user_id),
        item_id: Number(item_id),
        quantity: quantity,
      });
    }

    saveJsonData(userInventoryPath, updatedInventory);

    res.status(200).json({ message: '아이템이 인벤토리에 추가/업데이트 되었습니다.' });
  } catch (err) {
    console.error('오류 발생:', err);
    res.status(500).json({ message: '아이템 추가/업데이트에 실패했습니다.' });
  }
};

const updateInventoryItem = async (req, res) => {
  const { user_id, item_id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: '유효한 수량을 제공해야 합니다.' });
  }

  try {
    const userInventoryData = loadJsonData(userInventoryPath);

    let itemFound = false;
    const updatedInventory = userInventoryData.map(item => {
      if (item.user_id === Number(user_id) && item.item_id === Number(item_id)) {
        itemFound = true;
        return { ...item, quantity: quantity };
      }
      return item;
    });

    if (!itemFound) {
      return res.status(404).json({ message: '인벤토리에서 아이템을 찾을 수 없습니다.' });
    }

    saveJsonData(userInventoryPath, updatedInventory);

    res.status(200).json({ message: '아이템 수량이 업데이트 되었습니다.' });
  } catch (err) {
    console.error('오류 발생:', err);
    res.status(500).json({ message: '아이템 수량 업데이트에 실패했습니다.' });
  }
};

const deleteInventoryItem = async (req, res) => {
  const { user_id, item_id } = req.params;

  try {
    const userInventoryData = loadJsonData(userInventoryPath);

    const initialLength = userInventoryData.length;
    const updatedInventory = userInventoryData.filter(item => 
      !(item.user_id === Number(user_id) && item.item_id === Number(item_id))
    );

    if (updatedInventory.length === initialLength) {
      return res.status(404).json({ message: '인벤토리에서 아이템을 찾을 수 없습니다.' });
    }

    saveJsonData(userInventoryPath, updatedInventory);

    res.status(200).json({ message: '아이템이 인벤토리에서 삭제되었습니다.' });
  } catch (err) {
    console.error('오류 발생:', err);
    res.status(500).json({ message: '아이템 삭제에 실패했습니다.' });
  }
};

module.exports = {
  getUserInventory,
  addItemToInventory,
  updateInventoryItem,
  deleteInventoryItem,
}; 