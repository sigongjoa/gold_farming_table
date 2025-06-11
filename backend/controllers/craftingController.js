const { getPool } = require('../utils/dbManager');

const getCraftableItems = async (req, res, dbManager) => {
  const user_id = req.params.user_id;

  try {
    const pool = dbManager.getPool();
    const [allItems] = await pool.query('SELECT * FROM items');
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');
    const [userInventoryData] = await pool.query('SELECT * FROM user_inventory WHERE user_id = ?', [user_id]);

    const userInventory = userInventoryData
      .reduce((acc, item) => {
        acc[item.item_id] = item.quantity;
        return acc;
      }, {});

    const craftableRecipes = allRecipes.filter(recipe => {
      if (!recipe.materials || recipe.length === 0) {
        return false;
      }
      let canCraft = true;
      const materials = JSON.parse(recipe.materials);

      for (const material of materials) {
        if (!userInventory[material.material_item_id] || userInventory[material.material_item_id] < material.quantity) {
          canCraft = false;
          break;
        }
      }
      return canCraft;
    }).map(recipe => {
      let maxCrafts = Infinity;
      const materials = JSON.parse(recipe.materials);
      const detailedMaterials = materials.map(material => {
        const materialInfo = allItems.find(item => item.id === material.material_item_id);
        return {
          item_id: material.material_item_id,
          name: materialInfo ? materialInfo.name : '알 수 없는 재료',
          quantity: material.quantity,
          current_quantity_in_inventory: userInventory[material.material_item_id] || 0,
        };
      });

      for (const material of detailedMaterials) {
        const available = material.current_quantity_in_inventory;
        if (material.quantity > 0) {
          maxCrafts = Math.min(maxCrafts, Math.floor(available / material.quantity));
        }
      }
      
      const resultItem = allItems.find(item => item.id === recipe.output_item_id);
      return {
        recipe_id: recipe.id,
        recipe_name: recipe.recipe_name,
        output_item_id: recipe.output_item_id,
        output_item_name: resultItem ? resultItem.name : '알 수 없는 아이템',
        craftable_quantity: maxCrafts,
        required_facility: recipe.required_facility,
        success_rate: recipe.success_rate,
        materials: detailedMaterials,
      };
    });

    res.json(craftableRecipes);

  } catch (err) {
    console.error('제작 가능한 아이템 조회 오류:', err);
    res.status(500).json({ message: '제작 가능한 아이템을 불러오는 데 실패했습니다.' });
  }
};

const getCraftingTree = async (req, res, dbManager) => {
  const user_id = req.params.user_id;
  const { recipe_id } = req.params;

  try {
    const pool = dbManager.getPool();
    const [allItems] = await pool.query('SELECT * FROM items');
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');

    const targetRecipe = allRecipes.find(recipe => recipe.id === Number(recipe_id));

    if (!targetRecipe) {
      return res.status(404).json({ message: '해당 레시피를 찾을 수 없습니다.' });
    }

    function getMaterialsRecursive(recipeToProcess) {
      if (!recipeToProcess.materials || recipeToProcess.materials.length === 0) {
        return { materials: [] };
      }
      const materials = JSON.parse(recipeToProcess.materials);

      const tree = { 
        output_item_id: recipeToProcess.output_item_id,
        item_name: allItems.find(item => item.id === recipeToProcess.output_item_id)?.name || '알 수 없는 아이템',
        materials: [] 
      };

      for (const material of materials) {
        const materialInfo = allItems.find(item => item.id === material.material_item_id);
        const materialName = materialInfo ? materialInfo.name : '알 수 없는 아이템';
        const materialType = materialInfo ? materialInfo.item_type : '알 수 없음';

        const subRecipesForMaterial = allRecipes.filter(r => r.output_item_id === material.material_item_id);
        let subMaterialsTree = null;
        if (subRecipesForMaterial.length > 0) {
            subMaterialsTree = getMaterialsRecursive(subRecipesForMaterial[0]);
        }

        tree.materials.push({
          item_id: material.material_item_id,
          name: materialName,
          quantity: material.quantity,
          item_type: materialType,
          sub_materials: subMaterialsTree ? subMaterialsTree.materials : [],
        });
      }
      return tree;
    }

    const craftingTree = getMaterialsRecursive(targetRecipe);

    const rootItemInfo = allItems.find(item => item.id === targetRecipe.output_item_id);
    if (rootItemInfo) {
      craftingTree.item_name = rootItemInfo.name;
    }

    res.json(craftingTree);

  } catch (err) {
    console.error('제작 트리 조회 오류:', err);
    res.status(500).json({ message: '제작 트리를 불러오는 데 실패했습니다.' });
  }
};

const getMissingMaterials = async (req, res, dbManager) => {
  const user_id = req.params.user_id;
  const { recipe_id } = req.params;

  try {
    const pool = dbManager.getPool();
    const [allItems] = await pool.query('SELECT * FROM items');
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');
    const [userInventoryData] = await pool.query('SELECT * FROM user_inventory WHERE user_id = ?', [user_id]);

    const userInventory = userInventoryData
      .reduce((acc, item) => {
        acc[item.item_id] = item.quantity;
        return acc;
      }, {});

    const targetRecipe = allRecipes.find(recipe => recipe.id === Number(recipe_id));

    if (!targetRecipe) {
      return res.status(404).json({ message: '해당 레시피를 찾을 수 없습니다.' });
    }
    if (!targetRecipe.materials || targetRecipe.materials.length === 0) {
      return res.json({ materials: [] });
    }

    const requiredMaterials = JSON.parse(targetRecipe.materials);
    const missingMaterials = [];

    for (const material of requiredMaterials) {
      const availableQuantity = userInventory[material.material_item_id] || 0;
      if (availableQuantity < material.quantity) {
        const materialInfo = allItems.find(item => item.id === material.material_item_id);
        missingMaterials.push({
          item_id: material.material_item_id,
          name: materialInfo ? materialInfo.name : '알 수 없는 재료',
          missing_quantity: material.quantity - availableQuantity,
        });
      }
    }
    res.json({ materials: missingMaterials });

  } catch (err) {
    console.error('부족 재료 조회 오류:', err);
    res.status(500).json({ message: '부족 재료를 불러오는 데 실패했습니다.' });
  }
};

module.exports = {
  getCraftableItems,
  getCraftingTree,
  getMissingMaterials,
};
