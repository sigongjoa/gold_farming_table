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

CREATE TABLE IF NOT EXISTS characters (
    character_id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    user_id INT NOT NULL,
    character_name VARCHAR(255) NOT NULL,
    db_name VARCHAR(255) NOT NULL UNIQUE, -- This might become obsolete with single DB
    FOREIGN KEY (server_id) REFERENCES servers(server_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
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

CREATE TABLE IF NOT EXISTS user_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE(user_id, item_id)
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