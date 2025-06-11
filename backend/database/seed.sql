INSERT INTO users (username) VALUES ('test_user');

INSERT INTO servers (name) VALUES ('던컨'), ('데이안'), ('아이라'), ('알리사'), ('메이븐'), ('라사'), ('칼릭스');

INSERT INTO characters (server_id, user_id, character_name, db_name)
SELECT
    s.server_id, u.id, 'TestCharacter', 'mabinogi_item_db'
FROM
    servers s
JOIN
    users u ON u.username = 'test_user'
WHERE
    s.name = '던컨';

-- 채집 아이템 데이터 삽입
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('통나무', '기본적인 통나무', '나무 베기', '나무/뾰족 나무', 1, '제작, 가구, 강화 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('나뭇가지', '나무에서 얻는 나뭇가지', '나무 베기', '나무/뾰족 나무', 1, '제작, 가구, 강화 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('나무 진액', '나무에서 나오는 진액', '나무 베기', '나무/뾰족 나무', 1, '제작, 가구, 강화 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('황금 풍뎅이', '황금색 풍뎅이', '나무 베기', '나무/뾰족 나무', 1, '제작, 가구, 강화 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('부드러운 통나무', '부드러운 재질의 통나무', '나무 베기', '나무/뾰족 나무', 1, '의자 등 가구 제작에 사용');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('애벌레', '나무에서 발견되는 애벌레', '나무 베기', '굵은 나무', 5, '제작, 가구, 강화 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('장수풍뎅이', '단단한 장수풍뎅이', '나무 베기', '굵은 나무', 5, '제작, 가구, 강화 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('상급 통나무', '고급 통나무', '나무 베기', '쓸 만한 나무', 10, '제작, 가구, 강화 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('상급 통나무+', '최상급 통나무', '나무 베기', '갑옷 나무', 20, '제작, 가구, 강화 등');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('돌멩이', '기본적인 돌멩이', '광석 캐기', '돌멩이', 0, '무기/방어구, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('철광석', '무기 제작에 쓰이는 철광석', '광석 캐기', '돌멩이', 0, '무기/방어구, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('구리광석', '방어구 제작에 쓰이는 구리광석', '광석 캐기', '돌멩이', 0, '무기/방어구, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('석탄', '연료로 사용되는 석탄', '광석 캐기', '돌멩이', 0, '무기/방어구, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('마력 깃든 돌', '마력이 깃든 돌', '광석 캐기', '돌멩이', 0, '무기/방어구, 제작');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('네잎클로버', '행운의 네잎클로버', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('블러디 허브', '붉은 허브', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('마나 허브', '마나 회복에 쓰이는 허브', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('끈기 풀', '끈기 있는 풀', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('숨숨꽃', '숨어있는 꽃', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('깔끔 버섯', '깔끔한 버섯', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('새록 버섯', '새록새록 피어나는 버섯', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('쑥쑥 버섯', '쑥쑥 자라는 버섯', '약초 채집', '풀, 꽃, 버섯류', 1, '각종 회복/강화 물약, 요리 등');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('양털', '기본적인 양털', '양털 깎기', '양', 0, '제작, 물약');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('상급 양털', '고급 양털', '양털 깎기', '양', 0, '제작, 물약');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('상급 양털+', '최상급 양털', '양털 깎기', '양', 0, '제작, 물약');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('황금 양털', '황금색 양털', '양털 깎기', '양', 0, '제작, 물약');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('거미줄', '거미에게서 얻는 거미줄', '양털 깎기', '거미', 0, '물약, 제작 재료');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('감자', '호미질로 얻는 감자', '호미질', '감자', 1, '요리, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('양파', '호미질로 얻는 양파', '호미질', '양파', 1, '요리, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('조개', '호미질로 얻는 조개', '호미질', '조개', 1, '요리, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('점토', '호미질로 얻는 점토', '호미질', '점토', 1, '요리, 제작');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('응축된 바람', '바람을 응축한 것', '곤충 채집', '빛 무리', 1, '물약 조제, 핸디크래프트, 강화 비약 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('똑딱 반딧불이', '똑딱거리는 반딧불이', '곤충 채집', '빛 무리', 1, '물약 조제, 핸디크래프트, 강화 비약 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('흰꽃나비', '흰 꽃 같은 나비', '곤충 채집', '빛 무리', 1, '물약 조제, 핸디크래프트, 강화 비약 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('하루살이', '하루만 사는 곤충', '곤충 채집', '빛 무리', 1, '물약 조제, 핸디크래프트, 강화 비약 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('동전 무당벌레', '동전 모양 무당벌레', '곤충 채집', '빛 무리', 1, '물약 조제, 핸디크래프트, 강화 비약 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('황금 나비', '황금색 나비', '곤충 채집', '빛 무리', 1, '물약 조제, 핸디크래프트, 강화 비약 등');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('브리흐네 잉어', '브리흐네 지역 잉어', '낚시 채집', '작은 낚시터', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('은붕어', '은빛 붕어', '낚시 채집', '작은 낚시터', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('축축한 편지 뭉치', '축축해진 편지 뭉치', '낚시 채집', '작은 낚시터', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('이끼 낀 쇳조각', '이끼 낀 쇳조각', '낚시 채집', '작은 낚시터', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('무지개 송어', '무지개 빛 송어', '낚시 채집', '남쪽/동쪽 성벽', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('은어', '은빛 물고기', '낚시 채집', '남쪽/동쪽 성벽', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('황금 잉어', '황금색 잉어', '낚시 채집', '남쪽/동쪽 성벽', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('황금 연어', '황금색 연어', '낚시 채집', '남쪽/동쪽 성벽', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('참사랑어', '참사랑스러운 물고기', '낚시 채집', '남쪽/동쪽 성벽', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('훼손된 계약서', '훼손된 계약서', '낚시 채집', '남쪽/동쪽 성벽', 1, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('고등어', '고등어', '낚시 채집', '해변/옛 낚시터', 20, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('연어', '연어', '낚시 채집', '해변/옛 낚시터', 20, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('자루퍼', '자루퍼', '낚시 채집', '해변/옛 낚시터', 20, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('어둠유령고기', '어둠유령고기', '낚시 채집', '해변/옛 낚시터', 20, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('보석 빠진 반지', '보석이 빠진 반지', '낚시 채집', '해변/옛 낚시터', 20, '요리, 제작, 낚시');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('반짝이는 미끼', '낚시 효율을 증가시키는 미끼', '낚시 채집', NULL, 0, '낚시 효율 증가');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('계란', '기본적인 계란', '일상 채집', '닭', 0, '요리, 수플레 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('황금 계란', '황금색 계란', '일상 채집', '닭', 0, '요리, 수플레 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('사과', '신선한 사과', '일상 채집', '사과 나무', 0, '주스, 케이크 등');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('우유', '신선한 우유', '일상 채집', '소', 0, '감자수프, 요리');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('물이 든 병', '물이 담긴 병', '일상 채집', '샘물', 0, '염색약, 조개찜');

INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('밀', '기본적인 밀', '곡물 추수', '밀밭', 0, '요리, 제작');
INSERT INTO items (name, description, category, collection_target, required_level, usage_details) VALUES ('옥수수', '노란 옥수수', '곡물 추수', '옥수수밭', 0, '콘치즈 등 요리');

-- user_inventory에 test_user를 위한 초기 아이템 추가
INSERT INTO user_inventory (user_id, item_id, quantity) VALUES
    (1, 1, 20),
    (1, 12, 15),
    (1, 2, 30);

-- crafting_recipes에 초기 레시피 추가
INSERT INTO crafting_recipes (recipe_name, output_item_id, materials) VALUES
    ('간단한 목재', 5, '[{\"material_item_id\": 1, \"quantity\": 2}, {\"material_item_id\": 2, \"quantity\": 1}]'
);

INSERT INTO daily_quests (user_id, quest_name, quest_category, quest_description, is_completed, last_completed_date) VALUES
(1, '캐시샵 숙제', '캐시샵', '추천픽: 매일 무료 상품 1개 구입, 데카 탭: 은동전 상자 1개 구입, 골드 탭: 조각난 보석 보물 상자 10개 구입', FALSE, NULL),
(1, '검은 구멍', '던전', '하루 3회 클리어(일반/심층 구분), 인장, 엠블럼, 룬 등 획득, 인장 필요 시 일반 추천', FALSE, NULL),
(1, '소환의 결계', '던전', '하루 2~4회(3시간 간격 등장, 최대 4개 상자), 보석, 엠블럼, 룬, 미스틱 다이스 등 획득', FALSE, NULL),
(1, '망령의 탑', '던전', '하루 5회 클리어, 에픽 종료제, 전설 무기/장비 드랍, 수동 진행 권장', FALSE, NULL),
(1, '요일 던전', '던전', '하루 1회(요일별 보상 상이), 골드, 보석, 촉매제 등 획득, 일요일은 자유 선택', FALSE, NULL),
(1, '일일 미션', '미션', '미션 메뉴에서 확인, 성장 자원, 재화, 강화 재료 등 획득', FALSE, NULL),
(1, '사냥터 보스', '보스', '늑대의 숲/여신의 뜰/얼음 협곡 각 난이도별 1회씩, 엠블럼, 은동전 등 보상, 피로도 높으면 주간으로 미뤄도 무방', FALSE, NULL),
(1, '아르바이트', '기타', '매일 1~2개씩 추가, 미진행시 갱신, 골드, 재료, 성장 아이템 등 획득', FALSE, NULL),
(1, '식료품점 방문', '기타', '매일 2곳 방문, 필수 식재료 구매', FALSE, NULL);

INSERT INTO weekly_quests (user_id, quest_name, quest_category, quest_description, is_completed, last_completed_week) VALUES
(1, '필드보스', '보스', '페리, 크라브바흐, 크라마 등, 막타 작업 필수, 주간 1회 클리어 인정, 희귀 아이템, 재화 보상', FALSE, NULL),
(1, '어비스 던전', '던전', '가라앉은 유적, 무너진 제단, 파멸의 전당 등 3종, 높은 난이도, 강력한 보상', FALSE, NULL),
(1, '레이드', '던전', '먼 바다의 회색 미로 등, 장비, 재화, 성장 아이템 파밍', FALSE, NULL),
(1, '주간 목표 (모험가 길드)', '미션', '심층 던전 3회, 일반 던전 5회, 사냥터 5회, 골드, 인장, 경험치 등 보상', FALSE, NULL),
(1, '임무 게시판 채집 스크롤', '기타', '티르코네일, 던바튼, 콜헨 각 3회 반복, 재료/보상 획득', FALSE, NULL),
(1, '마물 퇴치 증표 교환', '기타', '증표로 아득한 별의 인장, 강화 재연소 촉매 등 교환', FALSE, NULL),
(1, '주간 미션', '미션', '일일/주간 미션 3회 이상 클리어 시 주간 보상 획득', FALSE, NULL);

-- 생활스킬 데이터 삽입
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