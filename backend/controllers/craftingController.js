const fs = require('fs');
const path = require('path');
const { pool } = require('../index'); // pool 객체를 불러옵니다.

// const itemsPath = path.join(__dirname, '../data/items.json');
// const craftingRecipesPath = path.join(__dirname, '../data/crafting_recipes.json');
// const userInventoryPath = path.join(__dirname, '../data/user_inventory.json');

// const loadJsonData = (filePath) => {
//   try {
//     const data = fs.readFileSync(filePath, 'utf8');
//     return JSON.parse(data);
//   } catch (error) {
//     console.error(`Error loading data from ${filePath}:`, error);
//     return [];
//   }
// };

const getCraftableItems = async (req, res) => {
  const { user_id } = req.params;
  try {
    const [allItems] = await pool.query('SELECT * FROM items');
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');
    const [userInventoryData] = await pool.query('SELECT * FROM user_inventory WHERE user_id = ?', [user_id]);

    const userInventory = userInventoryData
      .reduce((acc, item) => {
        acc[item.item_id] = item.quantity;
        return acc;
      }, {});

    const craftableRecipes = allRecipes.filter(recipe => {
      if (!recipe.materials || recipe.materials.length === 0) {
        return false;
      }

      let canCraft = true;
      // materials 필드는 JSON 문자열로 저장되어 있으므로 파싱해야 합니다.
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
        const materialInfo = allItems.find(item => item.item_id === material.material_item_id);
        return {
          item_id: material.material_item_id,
          name: materialInfo ? materialInfo.name : '알 수 없는 재료',
          icon_url: materialInfo ? materialInfo.icon_url : null,
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
      
      const resultItem = allItems.find(item => item.item_id === recipe.result_item_id);
      return {
        recipe_id: recipe.recipe_id,
        result_item_id: recipe.result_item_id,
        result_item_name: resultItem ? resultItem.name : '알 수 없는 아이템',
        result_item_icon_url: resultItem ? resultItem.icon_url : null,
        result_quantity: recipe.result_quantity || 1,
        craftable_quantity: maxCrafts,
        required_facility: recipe.required_facility,
        success_rate: recipe.success_rate,
        materials: detailedMaterials,
      };
    });

    res.json(craftableRecipes);

  } catch (err) {
    console.error('오류 발생:', err);
    res.status(500).json({ message: '제작 가능한 아이템을 불러오는 데 실패했습니다.' });
  }
};

const getCraftingTree = async (req, res) => {
  const { recipe_id } = req.params;
  try {
    const [allItems] = await pool.query('SELECT * FROM items');
    const [allRecipes] = await pool.query('SELECT * FROM crafting_recipes');

    const targetRecipe = allRecipes.find(recipe => recipe.recipe_id === Number(recipe_id));

    if (!targetRecipe) {
      return res.status(404).json({ message: '해당 레시피를 찾을 수 없습니다.' });
    }

    function getMaterialsRecursive(recipeToProcess) {
      // materials 필드는 JSON 문자열로 저장되어 있으므로 파싱해야 합니다.
      const materials = JSON.parse(recipeToProcess.materials);

      const tree = { 
        result_item_id: recipeToProcess.result_item_id,
        item_name: allItems.find(item => item.item_id === recipeToProcess.result_item_id)?.name || '알 수 없는 아이템',
        icon_url: allItems.find(item => item.item_id === recipeToProcess.result_item_id)?.icon_url || null,
        materials: [] 
      };

      for (const material of materials) {
        const materialInfo = allItems.find(item => item.item_id === material.material_item_id);
        const materialName = materialInfo ? materialInfo.name : '알 수 없는 아이템';
        const materialType = materialInfo ? materialInfo.item_type : '알 수 없음';
        const materialIconUrl = materialInfo ? materialInfo.icon_url : null;

        const subRecipesForMaterial = allRecipes.filter(r => r.result_item_id === material.material_item_id);
        let subMaterialsTree = null;
        if (subRecipesForMaterial.length > 0) {
            subMaterialsTree = getMaterialsRecursive(subRecipesForMaterial[0]);
        }

        tree.materials.push({
          item_id: material.material_item_id,
          name: materialName,
          quantity: material.quantity,
          item_type: materialType,
          icon_url: materialIconUrl,
          sub_materials: subMaterialsTree ? subMaterialsTree.materials : [],
        });
      }
      return tree;
    }

    const craftingTree = getMaterialsRecursive(targetRecipe);

    const rootItemInfo = allItems.find(item => item.item_id === targetRecipe.result_item_id);
    if (rootItemInfo) {
      craftingTree.item_name = rootItemInfo.name;
      craftingTree.icon_url = rootItemInfo.icon_url;
    }

    res.json(craftingTree);

  } catch (err) {
    console.error('오류 발생:', err);
    res.status(500).json({ message: '제작 트리를 불러오는 데 실패했습니다.' });
  }
};

module.exports = {
  getCraftableItems,
  getCraftingTree,
}; 