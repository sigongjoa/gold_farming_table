-- item_db.sql

-- 1. 아이템 기본 정보 테이블
CREATE TABLE items (
  item_id INT PRIMARY KEY, -- 아이템 ID 체계: 타입(2자리)+서브타입(2자리)+고유번호(4자리) 권장
  name VARCHAR(255) NOT NULL,
  item_type ENUM('소모품', '재료', '무기', '방어구', '장신구', '설계도') NOT NULL,
  source_type ENUM('CRAFT', 'GATHER', 'MONSTER', 'SHOP', 'EVENT', 'QUEST', 'ETC'), -- 아이템 획득처 종류
  source_info TEXT, -- 아이템 획득처 상세 정보 (예: '실리엔 2-1', '대장장이 판매', 'XX 이벤트 보상')
  description TEXT,
  icon_url VARCHAR(255),
  stackable BOOLEAN DEFAULT FALSE,
  max_stack INT DEFAULT 1
);

-- 2. 소모품 속성 테이블
CREATE TABLE consumables (
  item_id INT PRIMARY KEY,
  effect_duration_seconds INT,
  recovery_amount INT,
  usage_level_limit INT,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 3. 재료 속성 테이블
CREATE TABLE materials (
  item_id INT PRIMARY KEY,
  -- 조합 가능 상위 아이템은 crafting_recipes 테이블에서 역참조
  -- NPC 교환 비율은 npc_exchange 테이블에서 역참조
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 4. 장비 (무기, 방어구, 장신구) 기본 속성 테이블
CREATE TABLE equipment (
  item_id INT PRIMARY KEY,
  equip_type ENUM('무기', '방어구', '장신구') NOT NULL,
  attack_type ENUM('근접', '원거리', '마법', '없음') DEFAULT '없음',
  dam_min INT,
  dam_max INT,
  defense INT,
  critical_rate DECIMAL(5,2),
  upgrade_level INT DEFAULT 0,
  max_upgrade INT,
  required_level INT,
  required_strength INT, -- 예시: 추가 요구 능력치
  required_dexterity INT, -- 예시: 추가 요구 능력치
  required_intelligence INT, -- 예시: 추가 요구 능력치
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 5. 장비 원소 저항 테이블 (정규화)
CREATE TABLE equipment_element_resistances (
  equipment_id INT,
  element ENUM('fire', 'water', 'earth', 'wind', 'lightning', 'ice', 'dark', 'holy') NOT NULL,
  resistance_value INT NOT NULL,
  PRIMARY KEY (equipment_id, element),
  FOREIGN KEY (equipment_id) REFERENCES equipment(item_id) ON DELETE CASCADE
);

-- 6. 장신구 특수 옵션 테이블 (정규화)
CREATE TABLE accessory_special_options (
  item_id INT PRIMARY KEY,
  option_description TEXT, -- 예: 치명타 감소, 이동속도 증가
  FOREIGN KEY (item_id) REFERENCES equipment(item_id) ON DELETE CASCADE
);

-- 7. 설계도 속성 테이블
CREATE TABLE blueprints (
  item_id INT PRIMARY KEY,
  required_facility VARCHAR(255), -- 예: '대장간 Lv.3'
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 8. 조합/제작 시스템 테이블
CREATE TABLE crafting_recipes (
  recipe_id INT PRIMARY KEY AUTO_INCREMENT,
  result_item_id INT NOT NULL,
  required_facility VARCHAR(255),
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  FOREIGN KEY (result_item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

CREATE TABLE crafting_materials (
  recipe_id INT,
  material_item_id INT,
  quantity INT NOT NULL,
  PRIMARY KEY (recipe_id, material_item_id),
  FOREIGN KEY (recipe_id) REFERENCES crafting_recipes(recipe_id) ON DELETE CASCADE,
  FOREIGN KEY (material_item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 9. NPC 교환 시스템 테이블
CREATE TABLE npc_exchanges (
  exchange_id INT PRIMARY KEY AUTO_INCREMENT,
  npc_id INT NOT NULL, -- 추후 npcs 테이블과 FK 연결
  daily_limit INT,
  quest_requirement INT -- 추후 quests 테이블과 FK 연결
);

CREATE TABLE npc_exchange_inputs (
  exchange_id INT,
  item_id INT,
  quantity INT NOT NULL,
  PRIMARY KEY (exchange_id, item_id),
  FOREIGN KEY (exchange_id) REFERENCES npc_exchanges(exchange_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

CREATE TABLE npc_exchange_outputs (
  exchange_id INT,
  item_id INT,
  quantity INT NOT NULL,
  PRIMARY KEY (exchange_id, item_id),
  FOREIGN KEY (exchange_id) REFERENCES npc_exchanges(exchange_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 10. 강화/인챈트 시스템 테이블
CREATE TABLE enhancements (
  enhancement_id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  current_level INT NOT NULL,
  next_level INT NOT NULL,
  success_rate DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

CREATE TABLE enhancement_materials (
  enhancement_id INT,
  material_item_id INT,
  quantity INT NOT NULL,
  PRIMARY KEY (enhancement_id, material_item_id),
  FOREIGN KEY (enhancement_id) REFERENCES enhancements(enhancement_id) ON DELETE CASCADE,
  FOREIGN KEY (material_item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 강화 효과는 정규화된 테이블로 분리하거나, 간단한 경우는 JSON을 사용할 수 있습니다. 여기서는 정규화를 우선합니다.
CREATE TABLE enhancement_effects (
  enhancement_id INT,
  effect_type VARCHAR(50) NOT NULL, -- 예: 'attack', 'critical', 'defense'
  effect_value VARCHAR(50) NOT NULL, -- 예: '+5%', '+2'
  PRIMARY KEY (enhancement_id, effect_type),
  FOREIGN KEY (enhancement_id) REFERENCES enhancements(enhancement_id) ON DELETE CASCADE
);

-- 11. 세트 효과 테이블
CREATE TABLE set_effects (
  set_id INT PRIMARY KEY AUTO_INCREMENT,
  set_name VARCHAR(255) NOT NULL,
  required_item_count INT NOT NULL, -- 세트 효과 발동에 필요한 아이템 수
  effect_description TEXT
);

CREATE TABLE set_effect_items (
  set_id INT,
  item_id INT,
  PRIMARY KEY (set_id, item_id),
  FOREIGN KEY (set_id) REFERENCES set_effects(set_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 12. 시장 데이터 테이블
CREATE TABLE market_data (
  item_id INT PRIMARY KEY,
  avg_price DECIMAL(12,2),
  trade_volume INT,
  last_updated DATETIME,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 13. 패치 히스토리 테이블
CREATE TABLE item_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  changed_field VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  patch_date DATE,
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 사용자 인벤토리 테이블
CREATE TABLE user_inventory (
  user_id INT NOT NULL, -- 사용자 ID (향후 users 테이블과 FK 연결)
  item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 인덱스 전략
CREATE INDEX idx_item_type ON items(item_type);
CREATE INDEX idx_equip_level ON equipment(required_level);
CREATE INDEX idx_crafting_result_item ON crafting_recipes(result_item_id);
CREATE INDEX idx_npc_exchange_npc_id ON npc_exchanges(npc_id);
CREATE INDEX idx_enhancement_item_id ON enhancements(item_id);
CREATE INDEX idx_market_data_last_updated ON market_data(last_updated);

-- Sample Data
-- Items
INSERT INTO items (item_id, name, item_type, source_type, source_info, description, icon_url, stackable, max_stack) VALUES
(1001, '철광석', '재료', 'GATHER', '채광', '철을 제련하기 위한 광석', NULL, TRUE, 999),
(1002, '나무판', '재료', 'GATHER', '벌목', '다양한 제작에 사용되는 나무 재료', NULL, TRUE, 999),
(1003, '몬스터의 가죽', '재료', 'MONSTER', '약한 몬스터 드랍', '몬스터에게서 얻은 가죽', NULL, TRUE, 999),
(2001, '철괴', '재료', 'CRAFT', '철광석 5개로 제작', '철광석을 제련하여 만든 철괴', NULL, TRUE, 999),
(2002, '견고한 끈', '재료', 'CRAFT', '몬스터의 가죽 3개로 제작', '단단하게 꼬아 만든 끈', NULL, TRUE, 999),
(3001, '롱소드', '무기', 'CRAFT', '철괴 3개, 나무판 2개로 제작', '초보 모험가에게 적합한 검', NULL, FALSE, 1),
(4001, '가죽 갑옷', '방어구', 'CRAFT', '견고한 끈 2개, 나무판 1개로 제작', '가볍고 유연한 가죽 갑옷', NULL, FALSE, 1);

-- Crafting Recipes
INSERT INTO crafting_recipes (recipe_id, result_item_id, required_facility, success_rate) VALUES
(1, 2001, '대장간', 90.00),
(2, 3001, '대장간', 70.00),
(3, 2002, '재봉틀', 85.00),
(4, 4001, '재봉틀', 65.00);

-- Crafting Materials
INSERT INTO crafting_materials (recipe_id, material_item_id, quantity) VALUES
(1, 1001, 5),    -- 철괴 (ID 2001) <- 철광석 (ID 1001) 5개
(2, 2001, 3),    -- 롱소드 (ID 3001) <- 철괴 (ID 2001) 3개
(2, 1002, 2),    -- 롱소드 (ID 3001) <- 나무판 (ID 1002) 2개
(3, 1003, 3),    -- 견고한 끈 (ID 2002) <- 몬스터의 가죽 (ID 1003) 3개
(4, 2002, 2),    -- 가죽 갑옷 (ID 4001) <- 견고한 끈 (ID 2002) 2개
(4, 1002, 1);    -- 가죽 갑옷 (ID 4001) <- 나무판 (ID 1002) 1개

-- User Inventory (for initial testing of existing UI)
-- User 1 has some basic materials
INSERT INTO user_inventory (user_id, item_id, quantity) VALUES
(1, 1001, 20), -- 철광석 20개
(1, 1002, 10), -- 나무판 10개
(1, 1003, 15); -- 몬스터의 가죽 15개 