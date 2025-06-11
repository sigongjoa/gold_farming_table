const craftingController = require('../controllers/craftingController');
const mockPool = {
  query: jest.fn(),
};

describe('craftingController', () => {
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

  describe('getCraftableItems', () => {
    test('사용자 인벤토리를 기반으로 제작 가능한 아이템 목록을 반환해야 합니다.', async () => {
      const userId = 1;
      mockReq.params = { user_id: userId };

      // Mocking recipes
      const mockRecipes = [
        {
          recipe_id: 1,
          result_item_id: 100,
          result_item_name: '완성품1',
          result_item_icon_url: 'url1',
          required_facility: '대장간 Lv.1',
          success_rate: 90.00,
          materials: '1:2;2:1', // item_id:quantity;item_id:quantity
        },
        {
          recipe_id: 2,
          result_item_id: 101,
          result_item_name: '완성품2',
          result_item_icon_url: 'url2',
          required_facility: '목공소 Lv.1',
          success_rate: 80.00,
          materials: '3:1;4:3',
        },
      ];

      // Mocking user inventory (enough for recipe 1, not enough for recipe 2)
      const mockInventory = [
        { item_id: 1, quantity: 5 }, // Enough for recipe 1
        { item_id: 2, quantity: 2 }, // Enough for recipe 1
        { item_id: 3, quantity: 0 }, // Not enough for recipe 2 (needs 1)
        { item_id: 4, quantity: 1 }, // Not enough for recipe 2 (needs 3)
      ];

      mockPool.query
        .mockResolvedValueOnce([mockRecipes, []]) // crafting_recipes, crafting_materials, items join
        .mockResolvedValueOnce([mockInventory, []]); // user_inventory

      await craftingController.getCraftableItems(mockReq, mockRes, mockPool);

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockRes.json).toHaveBeenCalledWith([
        {
          recipe_id: 1,
          result_item_id: 100,
          result_item_name: '완성품1',
          result_item_icon_url: 'url1',
          required_facility: '대장간 Lv.1',
          success_rate: 90.00,
        },
      ]);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('제작 가능한 아이템이 없으면 빈 배열을 반환해야 합니다.', async () => {
      const userId = 1;
      mockReq.params = { user_id: userId };

      const mockRecipes = [
        {
          recipe_id: 1,
          result_item_id: 100,
          result_item_name: '완성품1',
          result_item_icon_url: 'url1',
          required_facility: '대장간 Lv.1',
          success_rate: 90.00,
          materials: '1:2',
        },
      ];
      const mockInventory = [
        { item_id: 1, quantity: 1 }, // Not enough
      ];

      mockPool.query
        .mockResolvedValueOnce([mockRecipes, []])
        .mockResolvedValueOnce([mockInventory, []]);

      await craftingController.getCraftableItems(mockReq, mockRes, mockPool);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    test('조회 중 오류가 발생하면 500 에러를 반환해야 합니다.', async () => {
      const userId = 1;
      const errorMessage = 'DB 오류';
      mockReq.params = { user_id: userId };
      mockPool.query.mockRejectedValueOnce(new Error(errorMessage));

      await craftingController.getCraftableItems(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('제작 가능한 아이템을 불러오는 데 실패했습니다.');
    });
  });

  describe('getCraftingTree', () => {
    test('아이템 제작 트리를 재귀적으로 반환해야 합니다.', async () => {
      const resultItemId = 100;
      mockReq.params = { result_item_id: resultItemId };

      // Mocking database queries for the crafting tree
      mockPool.query
        .mockResolvedValueOnce([[{ recipe_id: 1, result_item_id: 100, materials_concat: '1:2;2:1' }], []]) // Recipe for item 100
        .mockResolvedValueOnce([[{ name: '재료1', item_type: '재료' }], []]) // Info for material 1
        .mockResolvedValueOnce([[], []]) // No recipe for material 1 (base material)
        .mockResolvedValueOnce([[{ name: '재료2', item_type: '재료' }], []]) // Info for material 2
        .mockResolvedValueOnce([[], []]); // No recipe for material 2 (base material)

      await craftingController.getCraftingTree(mockReq, mockRes, mockPool);

      expect(mockRes.json).toHaveBeenCalledWith({
        result_item_id: 100,
        materials: [
          { item_id: 1, name: '재료1', quantity: 2, item_type: '재료', sub_materials: [] },
          { item_id: 2, name: '재료2', quantity: 1, item_type: '재료', sub_materials: [] },
        ],
      });
    });

    test('다단계 아이템 제작 트리를 재귀적으로 반환해야 합니다.', async () => {
      const resultItemId = 100;
      mockReq.params = { result_item_id: resultItemId };

      // Mocking database queries for multi-level crafting tree
      mockPool.query
        .mockResolvedValueOnce([[{ recipe_id: 1, result_item_id: 100, materials_concat: '1:2' }], []]) // Recipe for item 100
        .mockResolvedValueOnce([[{ name: '중간재료', item_type: '재료' }], []]) // Info for material 1
        .mockResolvedValueOnce([[{ recipe_id: 2, result_item_id: 1, materials_concat: '3:5' }], []]) // Recipe for material 1
        .mockResolvedValueOnce([[{ name: '기본재료', item_type: '재료' }], []]) // Info for material 3
        .mockResolvedValueOnce([[], []]); // No recipe for material 3

      await craftingController.getCraftingTree(mockReq, mockRes, mockPool);

      expect(mockRes.json).toHaveBeenCalledWith({
        result_item_id: 100,
        materials: [
          {
            item_id: 1,
            name: '중간재료',
            quantity: 2,
            item_type: '재료',
            sub_materials: [
              { item_id: 3, name: '기본재료', quantity: 5, item_type: '재료', sub_materials: [] },
            ],
          },
        ],
      });
    });

    test('조합법이 없는 아이템 ID에 대해 404 에러를 반환해야 합니다.', async () => {
      const resultItemId = 999;
      mockReq.params = { result_item_id: resultItemId };

      mockPool.query.mockResolvedValueOnce([[], []]); // No recipe found

      await craftingController.getCraftingTree(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('해당 아이템에 대한 조합법을 찾을 수 없습니다.');
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('조회 중 오류가 발생하면 500 에러를 반환해야 합니다.', async () => {
      const resultItemId = 100;
      mockReq.params = { result_item_id: resultItemId };
      const errorMessage = 'DB 오류';
      mockPool.query.mockRejectedValueOnce(new Error(errorMessage));

      await craftingController.getCraftingTree(mockReq, mockRes, mockPool);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('제작 트리를 불러오는 데 실패했습니다.');
    });
  });
}); 