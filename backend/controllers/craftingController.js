const { getPool } = require('../utils/dbManager');

const getCraftableItems = async (req, res, dbManager) => {
  console.debug('getCraftableItems 함수 진입');
  const user_id = req.params.user_id;
  console.debug(`입력값 - user_id: ${user_id}`);

  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    const [allItems] = await pool.query('SELECT * FROM items');
    console.debug(`모든 아이템 조회 결과: ${allItems.length}개`);
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');
    console.debug(`모든 레시피 조회 결과: ${allRecipes.length}개`);
    const [userInventoryData] = await pool.query('SELECT * FROM user_inventory WHERE user_id = ?', [user_id]);
    console.debug(`사용자 인벤토리 데이터 조회 결과: ${userInventoryData.length}개`);

    const userInventory = userInventoryData
      .reduce((acc, item) => {
        acc[item.item_id] = item.quantity;
        return acc;
      }, {});
    console.debug(`사용자 인벤토리 맵: ${JSON.stringify(userInventory)}`);

    const craftableRecipes = allRecipes.filter(recipe => {
      console.debug(`레시피 필터링 중: ${recipe.recipe_name || recipe.id}`);
      if (!recipe.materials || recipe.length === 0) {
        console.debug('재료 없음 또는 레시피 길이 0, 제작 불가');
        return false;
      }
      let canCraft = true;
      const materials = JSON.parse(recipe.materials);
      console.debug(`레시피 재료: ${JSON.stringify(materials)}`);

      for (const material of materials) {
        console.debug(`재료 확인 중: ${material.material_item_id}, 필요 수량: ${material.quantity}, 현재 인벤토리: ${userInventory[material.material_item_id] || 0}`);
        if (!userInventory[material.material_item_id] || userInventory[material.material_item_id] < material.quantity) {
          canCraft = false;
          console.debug('재료 부족, 제작 불가');
          break;
        }
      }
      console.debug(`레시피 제작 가능 여부: ${canCraft}`);
      return canCraft;
    }).map(recipe => {
      console.debug(`제작 가능한 레시피 매핑 중: ${recipe.recipe_name || recipe.id}`);
      let maxCrafts = Infinity;
      const materials = JSON.parse(recipe.materials);
      const detailedMaterials = materials.map(material => {
        const materialInfo = allItems.find(item => item.id === material.material_item_id);
        const detail = {
          item_id: material.material_item_id,
          name: materialInfo ? materialInfo.name : '알 수 없는 재료',
          quantity: material.quantity,
          current_quantity_in_inventory: userInventory[material.material_item_id] || 0,
        };
        console.debug(`상세 재료: ${JSON.stringify(detail)}`);
        return detail;
      });

      for (const material of detailedMaterials) {
        const available = material.current_quantity_in_inventory;
        if (material.quantity > 0) {
          maxCrafts = Math.min(maxCrafts, Math.floor(available / material.quantity));
        }
        console.debug(`재료 ${material.name}에 대한 최대 제작 가능 횟수: ${maxCrafts}`);
      }
      
      const resultItem = allItems.find(item => item.id === recipe.output_item_id);
      const craftedItem = {
        recipe_id: recipe.id,
        recipe_name: recipe.recipe_name,
        output_item_id: recipe.output_item_id,
        output_item_name: resultItem ? resultItem.name : '알 수 없는 아이템',
        craftable_quantity: maxCrafts,
        required_facility: recipe.required_facility,
        success_rate: recipe.success_rate,
        materials: detailedMaterials,
      };
      console.debug(`최종 제작 가능 아이템 정보: ${JSON.stringify(craftedItem)}`);
      return craftedItem;
    });

    res.json(craftableRecipes);
    console.debug('getCraftableItems 함수 종료 (성공)');

  } catch (err) {
    console.error('제작 가능한 아이템 조회 오류:', err);
    console.debug('getCraftableItems 함수 종료 (오류)');
    res.status(500).json({ message: '제작 가능한 아이템을 불러오는 데 실패했습니다.' });
  }
};

const getCraftingTree = async (req, res, dbManager) => {
  console.debug('getCraftingTree 함수 진입');
  const user_id = req.params.user_id;
  const { recipe_id } = req.params;
  console.debug(`입력값 - user_id: ${user_id}, recipe_id: ${recipe_id}`);

  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    const [allItems] = await pool.query('SELECT * FROM items');
    console.debug(`모든 아이템 조회 결과: ${allItems.length}개`);
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');
    console.debug(`모든 레시피 조회 결과: ${allRecipes.length}개`);

    const targetRecipe = allRecipes.find(recipe => recipe.id === Number(recipe_id));
    console.debug(`대상 레시피: ${JSON.stringify(targetRecipe)}`);

    if (!targetRecipe) {
      console.debug(`해당 레시피를 찾을 수 없음: recipe_id=${recipe_id}`);
      return res.status(404).json({ message: '해당 레시피를 찾을 수 없습니다.' });
    }

    function getMaterialsRecursive(recipeToProcess) {
      console.debug(`getMaterialsRecursive 호출, 레시피: ${recipeToProcess.recipe_name || recipeToProcess.id}`);
      if (!recipeToProcess.materials || recipeToProcess.materials.length === 0) {
        console.debug('재료 없음, 빈 배열 반환');
        return { materials: [] };
      }
      const materials = JSON.parse(recipeToProcess.materials);
      console.debug(`재료 파싱됨: ${JSON.stringify(materials)}`);

      const tree = { 
        output_item_id: recipeToProcess.output_item_id,
        item_name: allItems.find(item => item.id === recipeToProcess.output_item_id)?.name || '알 수 없는 아이템',
        materials: [] 
      };
      console.debug(`현재 트리 구조 초기화됨: ${JSON.stringify(tree)}`);

      for (const material of materials) {
        console.debug(`재귀적으로 재료 처리 중: ${material.material_item_id}, 수량: ${material.quantity}`);
        const materialInfo = allItems.find(item => item.id === material.material_item_id);
        const materialName = materialInfo ? materialInfo.name : '알 수 없는 아이템';
        const materialType = materialInfo ? materialInfo.item_type : '알 수 없음';
        console.debug(`재료 정보: 이름=${materialName}, 타입=${materialType}`);

        const subRecipesForMaterial = allRecipes.filter(r => r.output_item_id === material.material_item_id);
        console.debug(`재료에 대한 하위 레시피 수: ${subRecipesForMaterial.length}`);
        let subMaterialsTree = null;
        if (subRecipesForMaterial.length > 0) {
            subMaterialsTree = getMaterialsRecursive(subRecipesForMaterial[0]);
            console.debug(`하위 재료 트리 생성됨: ${JSON.stringify(subMaterialsTree)}`);
        }

        tree.materials.push({
          item_id: material.material_item_id,
          name: materialName,
          quantity: material.quantity,
          item_type: materialType,
          sub_materials: subMaterialsTree ? subMaterialsTree.materials : [],
        });
        console.debug(`트리에 재료 추가됨: ${JSON.stringify(tree.materials[tree.materials.length - 1])}`);
      }
      console.debug(`getMaterialsRecursive 종료, 최종 트리: ${JSON.stringify(tree)}`);
      return tree;
    }

    const craftingTree = getMaterialsRecursive(targetRecipe);
    console.debug(`제작 트리 최종 생성됨: ${JSON.stringify(craftingTree)}`);

    const rootItemInfo = allItems.find(item => item.id === targetRecipe.output_item_id);
    if (rootItemInfo) {
      craftingTree.item_name = rootItemInfo.name;
      console.debug(`루트 아이템 이름 업데이트됨: ${craftingTree.item_name}`);
    }

    res.json(craftingTree);
    console.debug('getCraftingTree 함수 종료 (성공)');

  } catch (err) {
    console.error('제작 트리 조회 오류:', err);
    console.debug('getCraftingTree 함수 종료 (오류)');
    res.status(500).json({ message: '제작 트리를 불러오는 데 실패했습니다.' });
  }
};

const getMissingMaterials = async (req, res, dbManager) => {
  console.debug('getMissingMaterials 함수 진입');
  const user_id = req.params.user_id;
  const { recipe_id } = req.params;
  console.debug(`입력값 - user_id: ${user_id}, recipe_id: ${recipe_id}`);

  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    const [allItems] = await pool.query('SELECT * FROM items');
    console.debug(`모든 아이템 조회 결과: ${allItems.length}개`);
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');
    console.debug(`모든 레시피 조회 결과: ${allRecipes.length}개`);
    const [userInventoryData] = await pool.query('SELECT * FROM user_inventory WHERE user_id = ?', [user_id]);
    console.debug(`사용자 인벤토리 데이터 조회 결과: ${userInventoryData.length}개`);

    const userInventory = userInventoryData
      .reduce((acc, item) => {
        acc[item.item_id] = item.quantity;
        return acc;
      }, {});
    console.debug(`사용자 인벤토리 맵: ${JSON.stringify(userInventory)}`);

    const targetRecipe = allRecipes.find(recipe => recipe.id === Number(recipe_id));
    console.debug(`대상 레시피: ${JSON.stringify(targetRecipe)}`);

    if (!targetRecipe) {
      console.debug(`해당 레시피를 찾을 수 없음: recipe_id=${recipe_id}`);
      return res.status(404).json({ message: '해당 레시피를 찾을 수 없습니다.' });
    }
    if (!targetRecipe.materials || targetRecipe.materials.length === 0) {
      console.debug('재료 없음, 빈 배열 반환');
      return res.json({ materials: [] });
    }

    const requiredMaterials = JSON.parse(targetRecipe.materials);
    console.debug(`필요한 재료: ${JSON.stringify(requiredMaterials)}`);
    const missingMaterials = [];

    for (const material of requiredMaterials) {
      const availableQuantity = userInventory[material.material_item_id] || 0;
      console.debug(`재료 ${material.material_item_id}: 필요=${material.quantity}, 현재=${availableQuantity}`);
      if (availableQuantity < material.quantity) {
        const materialInfo = allItems.find(item => item.id === material.material_item_id);
        const missing = {
          item_id: material.material_item_id,
          name: materialInfo ? materialInfo.name : '알 수 없는 재료',
          missing_quantity: material.quantity - availableQuantity,
        };
        missingMaterials.push(missing);
        console.debug(`부족한 재료 추가됨: ${JSON.stringify(missing)}`);
      }
    }
    res.json({ materials: missingMaterials });
    console.debug('getMissingMaterials 함수 종료 (성공)');

  } catch (err) {
    console.error('부족 재료 조회 오류:', err);
    console.debug('getMissingMaterials 함수 종료 (오류)');
    res.status(500).json({ message: '부족 재료를 불러오는 데 실패했습니다.' });
  }
};

const craftItemById = async (req, res, dbManager) => {
  console.debug('craftItemById 함수 진입');
  const user_id = req.params.user_id;
  const { recipe_id } = req.body; // 제작할 레시피 ID
  console.debug(`입력값 - user_id: ${user_id}, recipe_id: ${recipe_id}`);

  if (!recipe_id) {
    console.debug('유효성 검사 실패: 제작할 레시피 ID가 필요합니다.');
    return res.status(400).json({ message: '제작할 레시피 ID가 필요합니다.' });
  }

  let connection;
  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    connection = await pool.getConnection();
    await connection.beginTransaction(); // 트랜잭션 시작
    console.debug('트랜잭션 시작');

    // 1. 레시피 정보 가져오기
    const [recipeRows] = await connection.query('SELECT * FROM crafting_recipes WHERE id = ?', [recipe_id]);
    console.debug(`레시피 정보 조회 결과: ${JSON.stringify(recipeRows)}`);
    if (recipeRows.length === 0) {
      await connection.rollback();
      console.debug('레시피를 찾을 수 없음, 롤백');
      return res.status(404).json({ message: '해당 레시피를 찾을 수 없습니다.' });
    }
    const recipe = recipeRows[0];
    console.debug(`조회된 레시피: ${JSON.stringify(recipe)}`);

    if (!recipe.materials || recipe.materials.length === 0) {
      await connection.rollback();
      console.debug('재료가 정의되지 않은 레시피, 롤백');
      return res.status(400).json({ message: '재료가 정의되지 않은 레시피입니다.' });
    }
    const requiredMaterials = JSON.parse(recipe.materials);
    console.debug(`필요한 재료: ${JSON.stringify(requiredMaterials)}`);

    // 2. 현재 사용자 인벤토리 확인
    const [userInventoryData] = await connection.query('SELECT item_id, quantity FROM user_inventory WHERE user_id = ?', [user_id]);
    const userInventory = userInventoryData.reduce((acc, item) => {
      acc[item.item_id] = item.quantity;
      return acc;
    }, {});
    console.debug(`사용자 인벤토리 (초기): ${JSON.stringify(userInventory)}`);

    // 3. 재료가 충분한지 확인
    console.debug('재료 충분 여부 확인 시작');
    for (const material of requiredMaterials) {
      console.debug(`재료 ${material.material_item_id}: 필요=${material.quantity}, 현재=${userInventory[material.material_item_id] || 0}`);
      if (!userInventory[material.material_item_id] || userInventory[material.material_item_id] < material.quantity) {
        await connection.rollback();
        console.debug('재료 부족, 롤백');
        return res.status(400).json({ message: '재료가 부족합니다.' });
      }
    }
    console.debug('재료 충분 여부 확인 완료');

    // 4. 인벤토리에서 재료 소모 및 제작된 아이템 추가
    console.debug('재료 소모 및 아이템 추가 시작');
    for (const material of requiredMaterials) {
      const newQuantity = userInventory[material.material_item_id] - material.quantity;
      await connection.query(
        'UPDATE user_inventory SET quantity = ? WHERE user_id = ? AND item_id = ?',
        [newQuantity, user_id, material.material_item_id]
      );
      console.debug(`인벤토리 업데이트: item_id=${material.material_item_id}, 새 수량=${newQuantity}`);
    }

    // 제작된 아이템을 인벤토리에 추가 또는 수량 업데이트
    const [existingOutputItem] = await connection.query(
      'SELECT quantity FROM user_inventory WHERE user_id = ? AND item_id = ?',
      [user_id, recipe.output_item_id]
    );
    console.debug(`기존 출력 아이템 조회 결과: ${JSON.stringify(existingOutputItem)}`);

    if (existingOutputItem.length > 0) {
      const newOutputQuantity = existingOutputItem[0].quantity + 1;
      await connection.query(
        'UPDATE user_inventory SET quantity = ? WHERE user_id = ? AND item_id = ?',
        [newOutputQuantity, user_id, recipe.output_item_id]
      );
      console.debug(`기존 출력 아이템 수량 업데이트: item_id=${recipe.output_item_id}, 새 수량=${newOutputQuantity}`);
    } else {
      await connection.query(
        'INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, ?)',
        [user_id, recipe.output_item_id, 1]
      );
      console.debug(`새 출력 아이템 삽입: item_id=${recipe.output_item_id}, 수량=1`);
    }

    await connection.commit(); // 트랜잭션 커밋
    console.debug('트랜잭션 커밋됨');
    res.json({ message: '아이템 제작 성공', crafted_item_id: recipe.output_item_id });
    console.debug('craftItemById 함수 종료 (성공)');

  } catch (err) {
    if (connection) {
      await connection.rollback();
      console.debug('오류 발생, 트랜잭션 롤백됨');
    }
    console.error('아이템 제작 오류:', err);
    console.debug('craftItemById 함수 종료 (오류)');
    res.status(500).json({ message: '아이템 제작에 실패했습니다.' });
  } finally {
    if (connection) {
      connection.release();
      console.debug('DB 연결 해제됨');
    }
  }
};

module.exports = {
  getCraftableItems,
  getCraftingTree,
  getMissingMaterials,
  craftItemById,
};
