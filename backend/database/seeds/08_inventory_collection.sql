-- logger.debug('Inserting inventory types and collection items data...');
-- 인벤토리 타입 데이터 삽입
INSERT INTO inventory_types (type_name) VALUES
('일반'),
('이벤트'),
('거래불가');

-- 컬렉션 아이템 데이터 삽입 (예시)
INSERT INTO collection_items (item_id, collection_name)
SELECT id, '기본 채집 아이템' FROM items WHERE name IN ('통나무', '돌멩이', '네잎클로버');
-- logger.debug('Inventory types and collection items data insertion complete.'); 