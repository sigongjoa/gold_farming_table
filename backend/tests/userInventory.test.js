const userInventoryController = require('../controllers/userInventoryController');
const mockPool = {
  query: jest.fn(),
};

describe('userInventoryController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockPool.query.mockClear();
  });

  describe('getUserInventory', () => {
    test('특정 사용자의 인벤토리를 성공적으로 반환해야 합니다.', async () => {
      const userId = 1;
      const mockInventory = [
        { item_id: 1, name: '아이템1', item_type: '재료', quantity: 5 },
        { item_id: 2, name: '아이템2', item_type: '소모품', quantity: 2 },
      ];
      mockReq.params = { user_id: userId };
      mockPool.query.mockResolvedValueOnce([mockInventory, []]);

      await userInventoryController.getUserInventory(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT ui.item_id, i.name, i.item_type, ui.quantity FROM user_inventory ui JOIN items i ON ui.item_id = i.item_id WHERE ui.user_id = ?',
        [userId]
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockInventory);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('인벤토리 조회 중 오류가 발생하면 500 에러를 반환해야 합니다.', async () => {
      const userId = 1;
      const errorMessage = 'DB 오류';
      mockReq.params = { user_id: userId };
      mockPool.query.mockRejectedValueOnce(new Error(errorMessage));

      await userInventoryController.getUserInventory(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [userId]);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('사용자 인벤토리를 불러오는 데 실패했습니다.');
    });
  });

  describe('addItemToInventory', () => {
    test('새 아이템을 인벤토리에 성공적으로 추가해야 합니다.', async () => {
      const userId = 1;
      const itemId = 101;
      const quantity = 3;
      mockReq.params = { user_id: userId };
      mockReq.body = { item_id: itemId, quantity: quantity };

      mockPool.query.mockResolvedValueOnce([[{ item_id: itemId }], []]); // 아이템 존재 확인
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }], []); // INSERT 성공

      await userInventoryController.addItemToInventory(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT item_id FROM items WHERE item_id = ?', [itemId]);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [userId, itemId, quantity]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '아이템이 인벤토리에 추가/업데이트 되었습니다.',
        affectedRows: 1,
      });
    });

    test('이미 존재하는 아이템의 수량을 성공적으로 업데이트해야 합니다.', async () => {
      const userId = 1;
      const itemId = 101;
      const quantity = 3;
      mockReq.params = { user_id: userId };
      mockReq.body = { item_id: itemId, quantity: quantity };

      mockPool.query.mockResolvedValueOnce([[{ item_id: itemId }], []]); // 아이템 존재 확인
      mockPool.query.mockResolvedValueOnce([{ affectedRows: 2 }], []); // UPDATE 성공

      await userInventoryController.addItemToInventory(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [userId, itemId, quantity]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '아이템이 인벤토리에 추가/업데이트 되었습니다.',
        affectedRows: 2,
      });
    });

    test('필수 필드가 없으면 400 에러를 반환해야 합니다.', async () => {
      const userId = 1;
      mockReq.params = { user_id: userId };
      mockReq.body = { item_id: 101 }; // quantity 누락

      await userInventoryController.addItemToInventory(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('아이템 ID와 유효한 수량을 제공해야 합니다.');
    });

    test('존재하지 않는 아이템 ID를 추가하려 하면 404 에러를 반환해야 합니다.', async () => {
      const userId = 1;
      const itemId = 999;
      const quantity = 1;
      mockReq.params = { user_id: userId };
      mockReq.body = { item_id: itemId, quantity: quantity };

      mockPool.query.mockResolvedValueOnce([[], []]); // 아이템 존재하지 않음

      await userInventoryController.addItemToInventory(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('존재하지 않는 아이템입니다.');
    });
  });

  describe('updateInventoryItem', () => {
    test('인벤토리 아이템의 수량을 성공적으로 업데이트해야 합니다.', async () => {
      const userId = 1;
      const itemId = 101;
      const quantity = 10;
      mockReq.params = { user_id: userId, item_id: itemId };
      mockReq.body = { quantity: quantity };

      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }], []);

      await userInventoryController.updateInventoryItem(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE user_inventory SET quantity = ? WHERE user_id = ? AND item_id = ?',
        [quantity, userId, itemId]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '아이템 수량이 업데이트 되었습니다.',
        affectedRows: 1,
      });
    });

    test('유효하지 않은 수량이 제공되면 400 에러를 반환해야 합니다.', async () => {
      const userId = 1;
      const itemId = 101;
      mockReq.params = { user_id: userId, item_id: itemId };
      mockReq.body = { quantity: -5 }; // 유효하지 않은 수량

      await userInventoryController.updateInventoryItem(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('유효한 수량을 제공해야 합니다.');
    });

    test('인벤토리에서 아이템을 찾을 수 없으면 404 에러를 반환해야 합니다.', async () => {
      const userId = 1;
      const itemId = 999;
      const quantity = 10;
      mockReq.params = { user_id: userId, item_id: itemId };
      mockReq.body = { quantity: quantity };

      mockPool.query.mockResolvedValueOnce([{ affectedRows: 0 }], []);

      await userInventoryController.updateInventoryItem(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('인벤토리에서 아이템을 찾을 수 없습니다.');
    });
  });

  describe('deleteInventoryItem', () => {
    test('인벤토리에서 아이템을 성공적으로 삭제해야 합니다.', async () => {
      const userId = 1;
      const itemId = 101;
      mockReq.params = { user_id: userId, item_id: itemId };

      mockPool.query.mockResolvedValueOnce([{ affectedRows: 1 }], []);

      await userInventoryController.deleteInventoryItem(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM user_inventory WHERE user_id = ? AND item_id = ?',
        [userId, itemId]
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '아이템이 인벤토리에서 삭제되었습니다.',
        affectedRows: 1,
      });
    });

    test('인벤토리에서 아이템을 찾을 수 없으면 404 에러를 반환해야 합니다.', async () => {
      const userId = 1;
      const itemId = 999;
      mockReq.params = { user_id: userId, item_id: itemId };

      mockPool.query.mockResolvedValueOnce([{ affectedRows: 0 }], []);

      await userInventoryController.deleteInventoryItem(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('인벤토리에서 아이템을 찾을 수 없습니다.');
    });
  });
}); 