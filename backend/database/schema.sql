CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    silver_coins INT DEFAULT 0,
    silver_coins_last_recharge_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    demon_tribute INT DEFAULT 0,
    demon_tribute_last_recharge_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- 여기에 사용자 관련 추가 컬럼(예: password_hash)을 넣을 수 있습니다.
);

CREATE TABLE IF NOT EXISTS servers (
    server_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS professions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tier VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS characters (
    character_id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    user_id INT NOT NULL,
    character_name VARCHAR(255) NOT NULL,
    level INT DEFAULT 1,
    profession_id INT,
    db_name VARCHAR(255) NOT NULL UNIQUE, -- This might become obsolete with single DB
    FOREIGN KEY (server_id) REFERENCES servers(server_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (profession_id) REFERENCES professions(id),
    UNIQUE(server_id, character_name)
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(255),          -- 채집 방식 (e.g., '나무 베기', '광석 캐기')
    collection_target VARCHAR(255), -- 채집 대상 (e.g., '나무/뾰족 나무', '돌멩이')
    required_level INT,             -- 필요 생활 레벨 (e.g., 1, 5, 10)
    usage_details TEXT              -- 활용 예시 (e.g., '요리, 수플레 등')
    -- 여기에 아이템 관련 추가 컬럼을 넣을 수 있습니다.
);

CREATE TABLE IF NOT EXISTS inventory_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS character_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE(character_id, item_id)
);

CREATE TABLE IF NOT EXISTS crafting_recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_name VARCHAR(255) NOT NULL,
    output_item_id INT NOT NULL,
    materials TEXT, -- Store materials as JSON string
    -- 여기에 레시피 관련 추가 컬럼(예: required_materials)을 넣을 수 있습니다.
    FOREIGN KEY (output_item_id) REFERENCES items(id)
);

-- 일일 숙제 테이블
CREATE TABLE IF NOT EXISTS daily_quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quest_name VARCHAR(255) NOT NULL,
    quest_category VARCHAR(255),
    quest_description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    last_completed_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 주간 숙제 테이블
CREATE TABLE IF NOT EXISTS weekly_quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quest_name VARCHAR(255) NOT NULL,
    quest_category VARCHAR(255),
    quest_description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    last_completed_week DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 작업 테이블
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL UNIQUE
);

-- 캐릭터별 작업 완료 상태 테이블
CREATE TABLE IF NOT EXISTS character_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    task_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    UNIQUE(character_id, task_id)
);

-- 사용자 정의 캐릭터 작업 테이블
CREATE TABLE IF NOT EXISTS user_character_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    task_description TEXT NOT NULL,
    target_item_id INT, -- 목표 아이템 (nullable, 아이템 수집이 아닌 작업일 수 있음)
    target_quantity INT DEFAULT 0,
    current_quantity INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (target_item_id) REFERENCES items(id)
);

-- 생활스킬 테이블
CREATE TABLE IF NOT EXISTS life_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    icon_url VARCHAR(255)
);

-- 캐릭터별 생활스킬 레벨 테이블
CREATE TABLE IF NOT EXISTS character_life_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    life_skill_id INT NOT NULL,
    level INT NOT NULL DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (life_skill_id) REFERENCES life_skills(id),
    UNIQUE(character_id, life_skill_id)
);

-- 서버별 생활스킬 레벨 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS server_life_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    life_skill_id INT NOT NULL,
    level INT NOT NULL DEFAULT 0,
    FOREIGN KEY (server_id) REFERENCES servers(server_id),
    FOREIGN KEY (life_skill_id) REFERENCES life_skills(id),
    UNIQUE(server_id, life_skill_id)
);

-- 장비 등급 체계 테이블
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 일반, 고급, 레어, 엘리트, 에픽, 전설
    color_hex VARCHAR(7) -- #RRGGBB 형식의 색상 (예: #A0A0A0)
);

-- 장비 종류 테이블 (무기, 방어구, 엠블럼, 장신구)
CREATE TABLE IF NOT EXISTS equipment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 장비 착용 부위 테이블 (투구, 갑옷, 장갑, 신발, 반지, 목걸이 등)
CREATE TABLE IF NOT EXISTS equipment_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 장비 슬롯 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS equipment_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_name VARCHAR(50) NOT NULL UNIQUE, -- 예: 'Main Hand', 'Head', 'Accessory1'
    allowed_equipment_item_type_id INT, -- FK to equipment_types
    FOREIGN KEY (allowed_equipment_item_type_id) REFERENCES equipment_types(id)
);

-- 개별 장비 테이블
CREATE TABLE IF NOT EXISTS equipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    equipment_type_id INT NOT NULL, -- FK to equipment_types
    equipment_part_id INT, -- FK to equipment_parts (nullable for multi-part items like weapons)
    base_stats JSON, -- 기본 공격력/방어력 등 (JSON 형식으로 저장)
    is_unique BOOLEAN DEFAULT FALSE, -- 유니크 장비 여부
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id),
    FOREIGN KEY (equipment_part_id) REFERENCES equipment_parts(id)
);

-- 룬 테이블
CREATE TABLE IF NOT EXISTS runes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    grade_id INT NOT NULL, -- FK to grades (룬의 등급이 장비의 등급을 결정)
    bonus_options JSON, -- 룬에 따른 부가 옵션 (JSON 형식으로 저장)
    FOREIGN KEY (grade_id) REFERENCES grades(id)
);

-- 보석 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS gems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    grade_id INT NOT NULL, -- FK to grades
    bonus_options JSON,
    FOREIGN KEY (grade_id) REFERENCES grades(id)
);

-- 캐릭터 착용 아이템 테이블 (기존 테이블 변경 및 재정의)
DROP TABLE IF EXISTS character_equipped_items;
CREATE TABLE IF NOT EXISTS character_equipped_items (
    char_equip_id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    equipment_slot_id INT NOT NULL, -- FK to equipment_slots
    equipment_id INT NOT NULL, -- FK to equipments
    enhancement_level INT DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (equipment_slot_id) REFERENCES equipment_slots(id),
    FOREIGN KEY (equipment_id) REFERENCES equipments(id),
    UNIQUE(character_id, equipment_slot_id)
);

-- 장비-룬 장착 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS equipment_rune_sockets (
    char_equip_id INT NOT NULL, -- FK to character_equipped_items
    rune_id INT NOT NULL, -- FK to runes
    PRIMARY KEY (char_equip_id, rune_id),
    FOREIGN KEY (char_equip_id) REFERENCES character_equipped_items(char_equip_id),
    FOREIGN KEY (rune_id) REFERENCES runes(id)
);

-- 장비-보석 장착 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS equipment_gem_sockets (
    char_equip_id INT NOT NULL, -- FK to character_equipped_items
    gem_id INT NOT NULL,        -- FK to gems
    PRIMARY KEY (char_equip_id, gem_id),
    FOREIGN KEY (char_equip_id) REFERENCES character_equipped_items(char_equip_id),
    FOREIGN KEY (gem_id) REFERENCES gems(id)
);

-- 아르바이트 테이블
CREATE TABLE IF NOT EXISTS part_time_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region VARCHAR(255) NOT NULL, -- 지역 (예: 티르코네일, 던바튼, 전 지역)
    npc VARCHAR(255) NOT NULL,    -- NPC
    job_name VARCHAR(255) NOT NULL, -- 아르바이트 명
    requirements TEXT,             -- 요구 아이템/내용
    main_reward TEXT,              -- 주요 보상
    entry_condition VARCHAR(255),  -- 입장 조건 (요일 아르바이트용)
    notes TEXT,                    -- 비고 (스페셜 아르바이트용)
    job_type VARCHAR(50) NOT NULL  -- 아르바이트 종류 (e.g., 'normal', 'daily', 'special')
);

-- 크래프팅 시설 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS crafting_facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    required_level INT NOT NULL DEFAULT 1,
    upgrade_cost_gold INT NOT NULL DEFAULT 0,
    upgrade_cost_materials JSON, -- JSON 형식으로 재료 목록 저장
    icon_url VARCHAR(255) -- 시설 아이콘 URL (선택 사항)
);

-- 서버별 크래프팅 시설 레벨 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS server_crafting_facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    crafting_facility_id INT NOT NULL,
    level INT NOT NULL DEFAULT 0,
    FOREIGN KEY (server_id) REFERENCES servers(server_id),
    FOREIGN KEY (crafting_facility_id) REFERENCES crafting_facilities(id),
    UNIQUE(server_id, crafting_facility_id)
);

-- 크래프팅 시설 업그레이드 요구사항 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS crafting_facility_upgrades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crafting_facility_id INT NOT NULL,
    upgrade_level INT NOT NULL, -- 2 또는 3
    special_part_name VARCHAR(255), -- 2레벨/3레벨 특수 부품명
    special_part_materials TEXT, -- 특수 부품 제작 재료 (JSON or TEXT)
    shop_part_name VARCHAR(255), -- 상점(제작) 부품명
    npc_location VARCHAR(255), -- 판매 NPC (위치)
    purchase_currency VARCHAR(255), -- 구매 재화
    FOREIGN KEY (crafting_facility_id) REFERENCES crafting_facilities(id),
    UNIQUE(crafting_facility_id, upgrade_level)
);

-- 컬렉션 아이템 테이블 (새로 추가)
CREATE TABLE IF NOT EXISTS collection_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    collection_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE(item_id, collection_name)
); 