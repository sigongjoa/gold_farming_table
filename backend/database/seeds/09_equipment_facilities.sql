-- logger.debug('Inserting equipment and crafting facility data...');
-- 장비 슬롯 데이터 삽입
INSERT INTO equipment_slots (slot_name) VALUES
('머리'),
('몸'),
('손'),
('발'),
('무기'),
('보조 무기'),
('악세사리1'),
('악세사리2');

-- 장비 종류 데이터 삽입
INSERT INTO equipment_types (name) VALUES
('무기'),
('방어구'),
('엠블럼'),
('장신구'),
('장갑');

-- 장비 착용 부위 데이터 삽입
INSERT INTO equipment_parts (name) VALUES
('투구'),
('갑옷'),
('장갑'),
('신발'),
('반지'),
('목걸이');

-- 장비 아이템 데이터 추가 (equipments 테이블에 삽입)
INSERT INTO equipments (name, description, equipment_type_id, equipment_part_id, base_stats, is_unique) VALUES
('견습 모험가 장갑', '견습 모험가를 위한 장갑',
 (SELECT id FROM equipment_types WHERE name = '장갑'),
 (SELECT id FROM equipment_parts WHERE name = '장갑'),
 '{"defense": 5}', FALSE
);

-- 사용자 캐릭터 장비 데이터 (캐릭터가 장비하는 아이템)
INSERT INTO character_equipped_items (character_id, equipment_slot_id, equipment_id, enhancement_level) VALUES
    ((SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
     (SELECT id FROM equipment_slots WHERE slot_name = '손'),
     (SELECT id FROM equipments WHERE name = '견습 모험가 장갑'),
     0 -- enhancement_level (초기값은 0)
    );

-- 제작 시설 데이터
INSERT INTO crafting_facilities (name, description, required_level, upgrade_cost_gold, upgrade_cost_materials) VALUES
('화덕', '요리에 사용되는 기본적인 화덕', 1, 100, '[{"item_name": "돌멩이", "quantity": 10}]'),
('모루', '대장 기술에 사용되는 모루', 1, 150, '[{"item_name": "철광석", "quantity": 15}]');
-- logger.debug('Equipment and crafting facility data insertion complete.'); 