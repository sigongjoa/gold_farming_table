-- logger.debug('Starting main seed script.');

-- 데이터베이스 초기 설정 (생성 및 선택)

-- 사용자, 서버, 캐릭터 데이터 삽입
SOURCE backend/database/seeds/01_users_servers_characters.sql;

-- 채집 아이템 데이터 삽입
SOURCE backend/database/seeds/02_gathering_items.sql;

-- 소비 물약 및 재화 아이템 데이터 삽입
SOURCE backend/database/seeds/03_consumable_currency_items.sql;

-- 제작 레시피 데이터 삽입
SOURCE backend/database/seeds/04_crafting_recipes.sql;

-- 퀘스트 데이터 삽입 (일일 및 주간)
SOURCE backend/database/seeds/05_quests.sql;

-- 생활 기술 데이터 삽입
SOURCE backend/database/seeds/06_life_skills.sql;

-- 아르바이트 데이터 삽입
SOURCE backend/database/seeds/07_part_time_jobs.sql;

-- 인벤토리 타입 및 컬렉션 아이템 데이터 삽입
SOURCE backend/database/seeds/08_inventory_collection.sql;

-- 장비 및 제작 시설 데이터 삽입
SOURCE backend/database/seeds/09_equipment_facilities.sql;

-- 전직 데이터 삽입
SOURCE backend/database/seeds/10_professions.sql;

-- logger.debug('Main seed script complete.');