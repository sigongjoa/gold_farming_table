const itemController = require('../controllers/itemController');
const mockPool = {
  query: jest.fn((sql) => {
    // 기본적으로 빈 배열과 빈 필드 배열을 반환하도록 설정
    return Promise.resolve([[], []]);
  }),
};

describe('itemController', () => {
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

  describe('getItems', () => {
    test('모든 아이템을 성공적으로 반환해야 합니다.', async () => {
      const mockItems = [{ item_id: 1, name: '아이템1' }, { item_id: 2, name: '아이템2' }];
      mockPool.query.mockResolvedValueOnce([mockItems, []]);

      await itemController.getItems(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM items');
      expect(mockRes.json).toHaveBeenCalledWith(mockItems);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('아이템 조회 중 오류가 발생하면 500 에러를 반환해야 합니다.', async () => {
      const errorMessage = 'DB 오류';
      mockPool.query.mockRejectedValueOnce(new Error(errorMessage));

      await itemController.getItems(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM items');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('아이템을 불러오는 데 실패했습니다.');
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('getItemDetails', () => {
    test('아이템 상세 정보를 성공적으로 반환해야 합니다 (기본).', async () => {
      const itemId = 1;
      const mockItem = { item_id: itemId, name: '테스트 아이템', item_type: '소모품' };
      mockReq.params = { item_id: itemId };

      mockPool.query.mockResolvedValueOnce([[mockItem], []]); // items 테이블 조회
      mockPool.query.mockResolvedValueOnce([[{ effect_duration_seconds: 60 }], []]); // consumables 테이블 조회

      await itemController.getItemDetails(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM items WHERE item_id = ?', [itemId]);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM consumables WHERE item_id = ?', [itemId]);
      expect(mockRes.json).toHaveBeenCalledWith({
        ...mockItem,
        effect_duration_seconds: 60,
      });
    });

    test('존재하지 않는 아이템 ID에 대해 404 에러를 반환해야 합니다.', async () => {
      const itemId = 999;
      mockReq.params = { item_id: itemId };

      mockPool.query.mockResolvedValueOnce([[], []]); // items 테이블 조회 결과 없음

      await itemController.getItemDetails(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM items WHERE item_id = ?', [itemId]);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('아이템을 찾을 수 없습니다.');
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('장비 아이템의 상세 정보를 성공적으로 반환해야 합니다 (원소 저항 포함).', async () => {
      const itemId = 1001;
      const mockEquipment = { item_id: itemId, name: '테스트 무기', item_type: '무기', dam_min: 10, dam_max: 20 };
      const mockResistances = [{ element: 'fire', resistance_value: 15 }, { element: 'water', resistance_value: 10 }];
      mockReq.params = { item_id: itemId };

      mockPool.query.mockResolvedValueOnce([[mockEquipment], []]); // items 테이블 조회
      mockPool.query.mockResolvedValueOnce([[mockEquipment], []]); // equipment 테이블 조회
      mockPool.query.mockResolvedValueOnce([mockResistances, []]); // equipment_element_resistances 테이블 조회

      await itemController.getItemDetails(mockReq, mockRes, mockPool);

      expect(mockRes.json).toHaveBeenCalledWith({
        ...mockEquipment,
        element_resistances: { fire: 15, water: 10 },
      });
    });

    test('장신구 아이템의 상세 정보를 성공적으로 반환해야 합니다 (특수 옵션 포함).', async () => {
      const itemId = 2001;
      const mockAccessory = { item_id: itemId, name: '테스트 장신구', item_type: '장신구' };
      const mockAccessoryOption = { option_description: '치명타 감소' };
      mockReq.params = { item_id: itemId };

      mockPool.query.mockResolvedValueOnce([[mockAccessory], []]); // items 테이블 조회
      mockPool.query.mockResolvedValueOnce([[mockAccessory], []]); // equipment 테이블 조회
      mockPool.query.mockResolvedValueOnce([[], []]); // 원소 저항 (없음)
      mockPool.query.mockResolvedValueOnce([[mockAccessoryOption], []]); // accessory_special_options 조회

      await itemController.getItemDetails(mockReq, mockRes, mockPool);

      expect(mockRes.json).toHaveBeenCalledWith({
        ...mockAccessory,
        element_resistances: {},
        special_option: '치명타 감소',
      });
    });

    test('아이템 상세 조회 중 오류가 발생하면 500 에러를 반환해야 합니다.', async () => {
      const itemId = 1;
      mockReq.params = { item_id: itemId };
      const errorMessage = 'DB 오류';
      mockPool.query.mockRejectedValueOnce(new Error(errorMessage));

      await itemController.getItemDetails(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('아이템 상세 정보를 불러오는 데 실패했습니다.');
    });

  });
}); 