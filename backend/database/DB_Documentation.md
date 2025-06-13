# 데이터베이스 스키마 명세서

이 문서는 `backend/database/schema.sql` 파일에 정의된 데이터베이스 스키마를 설명합니다. 각 테이블의 구조, 컬럼 및 관계를 자세히 설명합니다.

# 데이터베이스 스키마 변경 사항 및 확장

이 문서는 캐릭터 장비 장착 시스템 구현을 위해 기존 데이터베이스 스키마에 적용된 변경 사항과 새로 추가된 테이블에 대해 설명합니다.

## 1. 기존 테이블 변경 사항

### `character_equipped_items` 테이블 변경

`character_equipped_items` 테이블의 스키마가 다음과 같이 변경되었습니다. 기존 `rune_id`와 `equipped_slot` 컬럼은 제거되고, `equipment_slots` 테이블을 참조하는 `equipment_slot_id` 컬럼이 추가되었습니다.

**변경 전 (기존 구조 예시):**
```sql
CREATE TABLE IF NOT EXISTS character_equipped_items (
    char_equip_id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    equipment_id INT NOT NULL,
    rune_id INT, -- 제거됨
    equipped_slot VARCHAR(255) NOT NULL, -- 제거됨
    enhancement_level INT DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (equipment_id) REFERENCES equipments(id)
);
```

**변경 후 (현재 구조):**
```sql
CREATE TABLE IF NOT EXISTS character_equipped_items (
    char_equip_id INT AUTO_INCREMENT PRIMARY KEY,
    character_id INT NOT NULL,
    equipment_slot_id INT NOT NULL, -- equipment_slots 테이블 참조
    equipment_id INT NOT NULL,
    enhancement_level INT DEFAULT 0,
    FOREIGN KEY (character_id) REFERENCES characters(character_id),
    FOREIGN KEY (equipment_slot_id) REFERENCES equipment_slots(id),
    FOREIGN KEY (equipment_id) REFERENCES equipments(id),
    UNIQUE(character_id, equipment_slot_id) -- 캐릭터당 한 슬롯에 하나의 장비만 장착 가능
);
```
**목적:**
캐릭터가 어떤 장비 슬롯에 어떤 장비를 장착하고 있는지에 대한 핵심 정보를 저장합니다. 기존 `rune_id`를 분리하고, 슬롯 정보를 `equipment_slots` 테이블과 연동하여 정규화 및 확장성을 높였습니다.

## 2. 새로 추가된 테이블

캐릭터 장비 시스템의 유연성과 확장성을 위해 다음 테이블들이 추가되었습니다.

### `equipment_slots` 테이블

캐릭터의 각 장비 슬롯 유형을 정의합니다.

```sql
CREATE TABLE IF NOT EXISTS equipment_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_name VARCHAR(50) NOT NULL UNIQUE, -- 예: 'HEAD', 'CHEST', 'WEAPON', 'OFF_HAND', 'NECKLACE', 'RING1', 'RING2'
    allowed_equipment_item_type_id INT, -- 해당 슬롯에 허용되는 장비 종류 (FK to equipment_types)
    FOREIGN KEY (allowed_equipment_item_type_id) REFERENCES equipment_types(id)
);
```
**목적:**
게임 캐릭터의 장비 칸에 대응하는 슬롯 종류를 정의합니다. 각 슬롯에 허용되는 장비 유형을 명시하여 백엔드에서 장비 장착 시 유효성 검사를 수행할 수 있도록 합니다.

### `equipment_types` 테이블

장비 아이템의 대분류를 정의합니다 (예: 무기, 방어구, 장신구).

```sql
CREATE TABLE IF NOT EXISTS equipment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE -- 예: '무기', '방어구', '엠블럼', '장신구', '장갑'
);
```
**목적:**
장비 아이템의 종류를 분류합니다. `equipments` 테이블의 `equipment_type_id`와 `equipment_slots` 테이블의 `allowed_equipment_item_type_id`가 이 테이블을 참조합니다.

### `equipment_parts` 테이블

장비가 착용되는 캐릭터의 특정 부위를 정의합니다 (예: 투구, 갑옷).

```sql
CREATE TABLE IF NOT EXISTS equipment_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE -- 예: '투구', '갑옷', '장갑', '신발', '반지', '목걸이'
);
```
**목적:**
장비가 캐릭터의 어느 부위에 착용되는지를 명시합니다. `equipments` 테이블의 `equipment_part_id`가 이 테이블을 참조합니다.

### `equipments` 테이블

개별 장비 아이템의 상세 정보를 저장합니다.

```sql
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
```
**목적:**
게임 내 모든 장비 아이템의 속성을 관리합니다.

### `runes` 테이블

룬 아이템의 상세 정보를 저장합니다.

```sql
CREATE TABLE IF NOT EXISTS runes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    grade_id INT NOT NULL, -- FK to grades (룬의 등급이 장비의 등급을 결정)
    bonus_options JSON, -- 룬에 따른 부가 옵션 (JSON 형식으로 저장)
    FOREIGN KEY (grade_id) REFERENCES grades(id)
);
```
**목적:**
장비에 삽입될 수 있는 룬의 종류와 효과를 정의합니다.

### `gems` 테이블

보석 아이템의 상세 정보를 저장합니다.

```sql
CREATE TABLE IF NOT EXISTS gems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    grade_id INT NOT NULL, -- FK to grades
    bonus_options JSON,
    FOREIGN KEY (grade_id) REFERENCES grades(id)
);
```
**목적:**
장비에 삽입될 수 있는 보석의 종류와 효과를 정의합니다. `rune` 테이블과 유사한 구조로 분리하여 관리합니다.

### `equipment_rune_sockets` 테이블

캐릭터가 장착한 장비에 룬을 삽입한 정보를 저장합니다.

```sql
CREATE TABLE IF NOT EXISTS equipment_rune_sockets (
    char_equip_id INT NOT NULL, -- FK to character_equipped_items
    rune_id INT NOT NULL, -- FK to runes
    PRIMARY KEY (char_equip_id, rune_id), -- 복합 기본 키
    FOREIGN KEY (char_equip_id) REFERENCES character_equipped_items(char_equip_id),
    FOREIGN KEY (rune_id) REFERENCES runes(id)
);
```
**목적:**
`character_equipped_items`와 `runes` 테이블 간의 다대다 관계를 관리합니다. 한 장비에 여러 룬을 장착할 수 있는 확장성을 제공합니다.

### `equipment_gem_sockets` 테이블

캐릭터가 장착한 장비에 보석을 삽입한 정보를 저장합니다.

```sql
CREATE TABLE IF NOT EXISTS equipment_gem_sockets (
    char_equip_id INT NOT NULL, -- FK to character_equipped_items
    gem_id INT NOT NULL,        -- FK to gems
    PRIMARY KEY (char_equip_id, gem_id), -- 복합 기본 키
    FOREIGN KEY (char_equip_id) REFERENCES character_equipped_items(char_equip_id),
    FOREIGN KEY (gem_id) REFERENCES gems(id)
);
```
**목적:**
`character_equipped_items`와 `gems` 테이블 간의 다대다 관계를 관리합니다. 한 장비에 여러 보석을 장착할 수 있는 확장성을 제공합니다.

---

## 테이블 목록

* [users](#users)
* [servers](#servers)
* [professions](#professions)
* [characters](#characters)
* [items](#items)
* [inventory_types](#inventory_types)
* [user_inventory](#user_inventory)
* [crafting_recipes](#crafting_recipes)
* [daily_quests](#daily_quests)
* [weekly_quests](#weekly_quests)
* [tasks](#tasks)
* [character_tasks](#character_tasks)
* [user_character_tasks](#user_character_tasks)
* [life_skills](#life_skills)
* [character_life_skills](#character_life_skills)
* [server_life_skills](#server_life_skills)
* [grades](#grades)
* [equipment_types](#equipment_types)
* [equipment_parts](#equipment_parts)
* [equipment_slots](#equipment_slots)
* [equipments](#equipments)
* [runes](#runes)
* [character_equipped_items](#character_equipped_items)
* [part_time_jobs](#part_time_jobs)
* [crafting_facilities](#crafting_facilities)
* [server_crafting_facilities](#server_crafting_facilities)
* [crafting_facility_upgrades](#crafting_facility_upgrades)
* [collection_items](#collection_items)


---

## users

사용자 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 사용자 고유 ID |
| `username` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 사용자 이름 (로그인 ID) |
| `silver_coins` | INT | `DEFAULT 0` | 보유 실버 코인 |
| `silver_coins_last_recharge_at` | DATETIME | `DEFAULT CURRENT_TIMESTAMP` | 실버 코인 마지막 충전 시간 |
| `demon_tribute` | INT | `DEFAULT 0` | 보유 데몬 공물 |
| `demon_tribute_last_recharge_at` | DATETIME | `DEFAULT CURRENT_TIMESTAMP` | 데몬 공물 마지막 충전 시간 |

---

## servers

게임 서버 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `server_id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 서버 고유 ID |
| `name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 서버 이름 |

---

## professions

직업 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 직업 고유 ID |
| `tier` | VARCHAR(50) | `NOT NULL` | 직업 등급 (예: '초급', '중급', '상급') |
| `name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 직업 이름 |
| `description` | TEXT | | 직업 설명 |

---

## characters

사용자가 생성한 캐릭터 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `character_id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 캐릭터 고유 ID |
| `server_id` | INT | `NOT NULL`, `FOREIGN KEY` | 캐릭터가 속한 서버 ID |
| `user_id` | INT | `NOT NULL`, `FOREIGN KEY` | 캐릭터를 소유한 사용자 ID |
| `character_name` | VARCHAR(255) | `NOT NULL` | 캐릭터 이름 |
| `level` | INT | `DEFAULT 1` | 캐릭터 레벨 |
| `profession_id` | INT | `FOREIGN KEY` | 캐릭터의 직업 ID |
| `db_name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | (단일 DB 사용 시 불필요할 수 있음) |

**관계:**
* `server_id`는 `servers` 테이블의 `server_id`를 참조합니다.
* `user_id`는 `users` 테이블의 `id`를 참조합니다.
* `profession_id`는 `professions` 테이블의 `id`를 참조합니다.
* `(server_id, character_name)` 조합은 고유해야 합니다.

---

## items

게임 내 모든 아이템 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 아이템 고유 ID |
| `name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 아이템 이름 |
| `description` | TEXT | | 아이템 설명 |
| `category` | VARCHAR(255) | | 채집 방식 (예: '나무 베기', '광석 캐기') |
| `collection_target` | VARCHAR(255) | | 채집 대상 (예: '나무/뾰족 나무', '돌멩이') |
| `required_level` | INT | | 필요 생활 레벨 |
| `usage_details` | TEXT | | 활용 예시 (예: '요리, 수플레 등') |

---

## inventory_types

인벤토리 유형을 정의하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 인벤토리 유형 고유 ID |
| `type_name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 인벤토리 유형 이름 (예: '기본', '이벤트') |

---

## user_inventory

사용자별 인벤토리 아이템 수량을 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 인벤토리 항목 고유 ID |
| `user_id` | INT | `NOT NULL`, `FOREIGN KEY` | 사용자 ID |
| `item_id` | INT | `NOT NULL`, `FOREIGN KEY` | 아이템 ID |
| `quantity` | INT | `NOT NULL`, `DEFAULT 0` | 보유 수량 |

**관계:**
* `user_id`는 `users` 테이블의 `id`를 참조합니다.
* `item_id`는 `items` 테이블의 `id`를 참조합니다.
* `(user_id, item_id)` 조합은 고유해야 합니다.

---

## crafting_recipes

제작 레시피 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 레시피 고유 ID |
| `recipe_name` | VARCHAR(255) | `NOT NULL` | 레시피 이름 |
| `output_item_id` | INT | `NOT NULL`, `FOREIGN KEY` | 제작 결과 아이템 ID |
| `materials` | TEXT | | 재료 목록 (JSON 문자열 형식) |
| `required_facility` | VARCHAR(255) | `NULLABLE` | 제작에 필요한 시설 이름 (예: '모루', '화덕', 시설이 필요 없으면 NULL) |
| `success_rate` | DECIMAL(5,2) | `NOT NULL`, `DEFAULT 1.00` | 제작 성공률 (0.00 ~ 1.00 사이의 값) |

**관계:**
* `output_item_id`는 `items` 테이블의 `id`를 참조합니다.
* `required_facility`는 `crafting_facilities` 테이블의 `name` 컬럼을 참조합니다.

---

## daily_quests

일일 퀘스트 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 퀘스트 고유 ID |
| `user_id` | INT | `NOT NULL`, `FOREIGN KEY` | 사용자 ID |
| `quest_name` | VARCHAR(255) | `NOT NULL` | 퀘스트 이름 |
| `quest_category` | VARCHAR(255) | | 퀘스트 카테고리 |
| `quest_description` | TEXT | | 퀘스트 설명 |
| `is_completed` | BOOLEAN | `DEFAULT FALSE` | 완료 여부 |
| `last_completed_date` | DATE | | 마지막 완료 날짜 |

**관계:**
* `user_id`는 `users` 테이블의 `id`를 참조합니다.

---

## weekly_quests

주간 퀘스트 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 퀘스트 고유 ID |
| `user_id` | INT | `NOT NULL`, `FOREIGN KEY` | 사용자 ID |
| `quest_name` | VARCHAR(255) | `NOT NULL` | 퀘스트 이름 |
| `quest_category` | VARCHAR(255) | | 퀘스트 카테고리 |
| `quest_description` | TEXT | | 퀘스트 설명 |
| `is_completed` | BOOLEAN | `DEFAULT FALSE` | 완료 여부 |
| `last_completed_week` | DATE | | 마지막 완료 주 (해당 주 시작일) |

**관계:**
* `user_id`는 `users` 테이블의 `id`를 참조합니다.

---

## tasks

작업(숙제) 목록을 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 작업 고유 ID |
| `task_name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 작업 이름 |

---

## character_tasks

캐릭터별 작업(숙제) 완료 상태를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 항목 고유 ID |
| `character_id` | INT | `NOT NULL`, `FOREIGN KEY` | 캐릭터 ID |
| `task_id` | INT | `NOT NULL`, `FOREIGN KEY` | 작업 ID |
| `is_completed` | BOOLEAN | `DEFAULT FALSE` | 완료 여부 |
| `completed_date` | DATE | | 완료 날짜 |

**관계:**
* `character_id`는 `characters` 테이블의 `character_id`를 참조합니다.
* `task_id`는 `tasks` 테이블의 `id`를 참조합니다.
* `(character_id, task_id)` 조합은 고유해야 합니다.

---

## user_character_tasks

사용자 정의 캐릭터 작업(숙제) 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 작업 고유 ID |
| `character_id` | INT | `NOT NULL`, `FOREIGN KEY` | 캐릭터 ID |
| `task_description` | TEXT | `NOT NULL` | 작업 상세 설명 |
| `target_item_id` | INT | `FOREIGN KEY`, `NULLABLE` | 목표 아이템 ID (아이템 수집이 아닌 작업일 수 있음) |
| `target_quantity` | INT | `DEFAULT 0` | 목표 수량 |
| `current_quantity` | INT | `DEFAULT 0` | 현재 달성 수량 |
| `is_completed` | BOOLEAN | `DEFAULT FALSE` | 완료 여부 |
| `created_at` | TIMESTAMP | `DEFAULT CURRENT_TIMESTAMP` | 생성 일시 |
| `updated_at` | TIMESTAMP | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 마지막 업데이트 일시 |

**관계:**
* `character_id`는 `characters` 테이블의 `character_id`를 참조합니다.
* `target_item_id`는 `items` 테이블의 `id`를 참조합니다.

---

## life_skills

생활 스킬 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 생활 스킬 고유 ID |
| `name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 생활 스킬 이름 |
| `icon_url` | VARCHAR(255) | | 생활 스킬 아이콘 URL |

---

## character_life_skills

캐릭터별 생활스킬 레벨 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 항목 고유 ID |
| `character_id` | INT | `NOT NULL`, `FOREIGN KEY` | 캐릭터 ID |
| `life_skill_id` | INT | `NOT NULL` | 생활 스킬 ID |
| `level` | INT | `NOT NULL`, `DEFAULT 0` | 생활 스킬 레벨 |

**관계:**
* `character_id`는 `characters` 테이블의 `character_id`를 참조합니다.
* `life_skill_id`는 `life_skills` 테이블의 `id`를 참조합니다.
* `(character_id, life_skill_id)` 조합은 고유해야 합니다.

---

## server_life_skills

서버별 생활스킬 레벨 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 항목 고유 ID |
| `server_id` | INT | `NOT NULL`, `FOREIGN KEY` | 서버 ID |
| `life_skill_id` | INT | `NOT NULL` | 생활 스킬 ID |
| `level` | INT | `NOT NULL`, `DEFAULT 0` | 생활 스킬 레벨 |

**관계:**
* `server_id`는 `servers` 테이블의 `server_id`를 참조합니다.
* `life_skill_id`는 `life_skills` 테이블의 `id`를 참조합니다.
* `(server_id, life_skill_id)` 조합은 고유해야 합니다.

---

## grades

장비 등급 체계를 정의하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 등급 고유 ID |
| `name` | VARCHAR(50) | `NOT NULL`, `UNIQUE` | 등급 이름 (예: '일반', '고급', '레어', '엘리트', '에픽', '전설') |
| `color_hex` | VARCHAR(7) | | 등급을 나타내는 HEX 색상 코드 (예: #A0A0A0) |

---

## equipment_types

장비 종류를 정의하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 장비 종류 고유 ID |
| `name` | VARCHAR(50) | `NOT NULL`, `UNIQUE` | 장비 종류 이름 (예: '무기', '방어구', '엠블럼', '장신구') |

---

## equipment_parts

장비 착용 부위를 정의하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 착용 부위 고유 ID |
| `name` | VARCHAR(50) | `NOT NULL`, `UNIQUE` | 착용 부위 이름 (예: '투구', '갑옷', '장갑', '신발', '반지', '목걸이') |

---

## equipment_slots

장비 슬롯 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 슬롯 고유 ID |
| `slot_name` | VARCHAR(50) | `NOT NULL`, `UNIQUE` | 슬롯 이름 (예: 'Main Hand', 'Head', 'Accessory1') |

---

## equipments

개별 장비 아이템 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 장비 고유 ID |
| `name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 장비 이름 |
| `description` | TEXT | | 장비 설명 |
| `equipment_type_id` | INT | `NOT NULL`, `FOREIGN KEY` | 장비 종류 ID |
| `equipment_part_id` | INT | `FOREIGN KEY`, `NULLABLE` | 장비 착용 부위 ID (무기처럼 여러 부위에 걸칠 수 있는 경우 NULL) |
| `base_stats` | JSON | | 기본 공격력/방어력 등 (JSON 형식으로 저장) |
| `is_unique` | BOOLEAN | `DEFAULT FALSE` | 유니크 장비 여부 |

**관계:**
* `equipment_type_id`는 `equipment_types` 테이블의 `id`를 참조합니다.
* `equipment_part_id`는 `equipment_parts` 테이블의 `id`를 참조합니다.

---

## runes

룬 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 룬 고유 ID |
| `name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 룬 이름 |
| `grade_id` | INT | `NOT NULL`, `FOREIGN KEY` | 룬의 등급 ID (장비 등급을 결정) |
| `bonus_options` | JSON | | 룬에 따른 부가 옵션 (JSON 형식으로 저장) |

**관계:**
* `grade_id`는 `grades` 테이블의 `id`를 참조합니다.

---

## character_equipped_items

캐릭터가 착용한 아이템 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 착용 아이템 고유 ID |
| `character_id` | INT | `NOT NULL`, `FOREIGN KEY` | 캐릭터 ID |
| `equipment_slot_id` | INT | `NOT NULL`, `FOREIGN KEY` | 장비 슬롯 ID |
| `equipment_id` | INT | `NOT NULL`, `FOREIGN KEY` | 장비 아이템 ID |
| `enhancement_level` | INT | `DEFAULT 0` | 강화 레벨 (룬에 적용되는 강화) |

**관계:**
* `character_id`는 `characters` 테이블의 `character_id`를 참조합니다.
* `equipment_slot_id`는 `equipment_slots` 테이블의 `id`를 참조합니다.
* `equipment_id`는 `equipments` 테이블의 `id`를 참조합니다.
* `(character_id, equipment_slot_id)` 조합은 각 캐릭터의 특정 슬롯에 하나의 아이템만 착용 가능하도록 고유해야 합니다.

---

## part_time_jobs

아르바이트 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 아르바이트 고유 ID |
| `region` | VARCHAR(255) | `NOT NULL` | 지역 (예: 티르코네일, 던바튼, 전 지역) |
| `npc` | VARCHAR(255) | `NOT NULL` | NPC |
| `job_name` | VARCHAR(255) | `NOT NULL` | 아르바이트 명 |
| `requirements` | TEXT | | 요구 아이템/내용 |
| `main_reward` | TEXT | | 주요 보상 |
| `entry_condition` | VARCHAR(255) | | 입장 조건 (요일 아르바이트용) |
| `notes` | TEXT | | 비고 (스페셜 아르바이트용) |
| `job_type` | VARCHAR(50) | `NOT NULL` | 아르바이트 종류 (e.g., 'normal', 'daily', 'special') |

---

## crafting_facilities

크래프팅 시설 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 시설 고유 ID |
| `name` | VARCHAR(255) | `NOT NULL`, `UNIQUE` | 시설 이름 (예: '모루', '화덕') |
| `description` | TEXT | | 시설 설명 |
| `required_level` | INT | `NOT NULL`, `DEFAULT 1` | 시설 사용을 위한 필요 레벨 |
| `upgrade_cost_gold` | INT | `NOT NULL`, `DEFAULT 0` | 시설 업그레이드에 필요한 골드 비용 |
| `upgrade_cost_materials` | JSON | | 시설 업그레이드에 필요한 재료 목록 (JSON 형식) |
| `icon_url` | VARCHAR(255) | | 시설 아이콘 URL (선택 사항) |

---

## server_crafting_facilities

서버별 크래프팅 시설 레벨을 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 항목 고유 ID |
| `server_id` | INT | `NOT NULL`, `FOREIGN KEY` | 서버 ID |
| `crafting_facility_id` | INT | `NOT NULL`, `FOREIGN KEY` | 크래프팅 시설 ID |
| `level` | INT | `NOT NULL`, `DEFAULT 0` | 시설 레벨 |

**관계:**
* `server_id`는 `servers` 테이블의 `server_id`를 참조합니다.
* `crafting_facility_id`는 `crafting_facilities` 테이블의 `id`를 참조합니다.
* `(server_id, crafting_facility_id)` 조합은 고유해야 합니다.

---

## crafting_facility_upgrades

크래프팅 시설 업그레이드 요구사항 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 업그레이드 고유 ID |
| `crafting_facility_id` | INT | `NOT NULL`, `FOREIGN KEY` | 크래프팅 시설 ID |
| `upgrade_level` | INT | `NOT NULL` | 업그레이드 레벨 (2 또는 3) |
| `special_part_name` | VARCHAR(255) | | 2레벨/3레벨 특수 부품명 |
| `special_part_materials` | TEXT | | 특수 부품 제작 재료 (JSON 또는 TEXT) |
| `shop_part_name` | VARCHAR(255) | | 상점(제작) 부품명 |
| `npc_location` | VARCHAR(255) | | 판매 NPC (위치) |
| `purchase_currency` | VARCHAR(255) | | 구매 재화 |

**관계:**
* `crafting_facility_id`는 `crafting_facilities` 테이블의 `id`를 참조합니다.
* `(crafting_facility_id, upgrade_level)` 조합은 고유해야 합니다.

---

## collection_items

컬렉션 아이템 정보를 저장하는 테이블입니다.

| 컬럼 이름 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | `AUTO_INCREMENT`, `PRIMARY KEY` | 컬렉션 아이템 고유 ID |
| `item_id` | INT | `NOT NULL`, `FOREIGN KEY` | 아이템 ID |
| `collection_name` | VARCHAR(255) | `NOT NULL` | 컬렉션 이름 |

**관계:**
* `item_id`는 `items` 테이블의 `id`를 참조합니다.
* `(item_id, collection_name)` 조합은 고유해야 합니다.

</rewritten_file>