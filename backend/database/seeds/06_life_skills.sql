-- logger.debug('Inserting life skill data...');
INSERT INTO life_skills (name, icon_url) VALUES
('일상 채집', NULL),
('나무 베기', NULL),
('광석 캐기', NULL),
('약초 채집', NULL),
('양털 깎기', NULL),
('추수', NULL),
('호미질', NULL),
('곤충 채집', NULL),
('낚시', NULL),
('대장 기술', NULL),
('목공', NULL),
('매직 크래프트', NULL),
('중갑 제작', NULL),
('경갑 제작', NULL),
('천옷 제작', NULL),
('물약 조제', NULL),
('요리', NULL),
('핸디크래프트', NULL),
('연금술', NULL),
('아르바이트', NULL);

-- 캐릭터별 생활스킬 레벨 데이터 삽입 (TestCharacter, character_id = 1)
INSERT INTO character_life_skills (character_id, life_skill_id, level)
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '일상 채집'), 13
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '나무 베기'), 18
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '광석 캐기'), 19
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '약초 채집'), 12
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '양털 깎기'), 15
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '추수'), 11
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '호미질'), 12
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '곤충 채집'), 16
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '낚시'), 1
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '대장 기술'), 8
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '목공'), 10
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '매직 크래프트'), 9
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '중갑 제작'), 10
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '경갑 제작'), 1
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '천옷 제작'), 8
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '물약 조제'), 11
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '요리'), 13
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '핸디크래프트'), 15
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '연금술'), 10
UNION ALL
SELECT
    (SELECT character_id FROM characters WHERE character_name = 'TestCharacter' AND user_id = 1),
    (SELECT id FROM life_skills WHERE name = '아르바이트'), 6;
-- logger.debug('Life skill data insertion complete.'); 