CREATE OR REPLACE VIEW v_user_items AS
SELECT
    i.id AS item_id,
    i.name,
    i.description,
    COALESCE(ui.quantity, 0) AS quantity
FROM items i
LEFT JOIN user_inventory ui
       ON ui.item_id = i.id
      AND ui.user_id = 1; 