-- logger.debug('Inserting crafting recipe data...');
INSERT INTO crafting_recipes (recipe_name, output_item_id, materials) VALUES
    ('간단한 목재', 5, '[{"material_item_id": 1, "quantity": 2}, {"material_item_id": 2, "quantity": 1}]');
-- logger.debug('Crafting recipe data insertion complete.'); 