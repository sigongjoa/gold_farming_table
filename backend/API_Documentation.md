# Backend API Documentation

## Server Routes

Base URL: `/servers`

### 1. `GET /servers`

*   **Description**: 모든 서버의 목록을 조회합니다.
*   **Controller Function**: `serverController.getServers`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "server_id": 1,
                "name": "류트"
            },
            {
                "server_id": 2,
                "name": "하프"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "서버 목록을 불러오는 데 실패했습니다."
        }
        ```

### 2. `GET /servers/:serverName/characters`

*   **Description**: 특정 서버의 캐릭터 목록을 조회합니다. 선택적으로 `userId`를 통해 특정 유저의 캐릭터만 필터링할 수 있습니다.
*   **Controller Function**: `serverController.getCharacters`
*   **Request**:
    *   **URL Parameters**:
        *   `serverName` (string): 조회할 서버의 이름
    *   **Query Parameters**:
        *   `userId` (number, optional): 필터링할 사용자 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "character_id": 101,
                "character_name": "테스트캐릭터1",
                "level": 50,
                "profession_name": "석궁사수"
            },
            {
                "character_id": 102,
                "character_name": "테스트캐릭터2",
                "level": 30,
                "profession_name": "화염술사"
            }
        ]
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 서버를 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "캐릭터 목록을 불러오는 데 실패했습니다."
        }
        ```

### 3. `GET /servers/characters/all`

*   **Description**: 모든 서버의 모든 캐릭터 목록을 조회합니다.
*   **Controller Function**: `serverController.getAllCharacters`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "character_id": 101,
                "character_name": "테스트캐릭터1",
                "level": 50,
                "profession_name": "석궁사수",
                "server_name": "류트"
            },
            {
                "character_id": 201,
                "character_name": "다른캐릭터",
                "level": 30,
                "profession_name": "대검전사",
                "server_name": "하프"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "모든 캐릭터를 불러오는 데 실패했습니다."
        }
        ```

### 4. `POST /servers/:serverName/characters`

*   **Description**: 특정 서버에 새로운 캐릭터를 생성하거나 기존 캐릭터를 업데이트합니다. 캐릭터 목록을 배열로 받아 처리합니다.
*   **Controller Function**: `serverController.createOrUpdateCharacters`
*   **Request**:
    *   **URL Parameters**:
        *   `serverName` (string): 캐릭터를 생성하거나 업데이트할 서버의 이름
    *   **Body (application/json)**:
        ```json
        {
            "userId": 123,
            "characters": [
                {
                    "character_name": "새로운캐릭터이름",
                    "level": 1,
                    "profession_name": "석궁사수"
                },
                {
                    "character_name": "기존캐릭터",
                    "level": 50,
                    "profession_name": "화염술사"
                }
            ]
        }
        ```
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "message": "캐릭터 정보가 성공적으로 저장되었습니다.",
            "updatedCharacterIds": [124, 125]
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "서버 이름과 캐릭터 목록 배열은 필수입니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 서버를 찾을 수 없습니다."
        }
        ```
    *   **Error (409 Conflict)**:
        ```json
        {
            "message": "이미 존재하는 캐릭터명입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "캐릭터 정보를 저장하는 데 실패했습니다."
        }
        ```

## Crafting Routes

Base URL: `/crafting`

### 1. `POST /crafting/users/:user_id/craft`

*   **Description**: 특정 사용자의 캐릭터가 지정된 레시피를 사용하여 아이템을 제작합니다. 제작 과정에서 재료를 소모하고, 필요 시설 및 성공률 검사를 수행합니다.
*   **Controller Function**: `craftingController.craftItemById`
*   **Request**:
    *   **URL Parameters**:
        *   `user_id` (number): 아이템을 제작하는 사용자 ID
    *   **Body (application/json)**:
        ```json
        {
            "recipe_id": 101, // 제작할 레시피의 ID
            "character_id": 201 // 제작을 시도할 캐릭터의 ID
        }
        ```
*   **Response**:
    *   **Success (200 OK - 제작 성공)**:
        ```json
        {
            "message": "아이템 제작 성공",
            "crafted_item_id": 1001, // 제작된 아이템의 ID
            "success": true
        }
        ```
    *   **Success (200 OK - 제작 실패)**:
        ```json
        {
            "message": "아이템 제작 실패",
            "success": false
        }
        ```
    *   **Error (400 Bad Request - 유효성 검사 실패)**:
        ```json
        {
            "message": "제작할 레시피 ID와 캐릭터 ID가 필요합니다."
        }
        ```
    *   **Error (400 Bad Request - 재료 부족)**:
        ```json
        {
            "message": "재료가 부족합니다."
        }
        ```
    *   **Error (400 Bad Request - 필요한 제작 시설 없음)**:
        ```json
        {
            "message": "필요한 제작 시설 (모루)이(가) 없습니다."
        }
        ```
    *   **Error (404 Not Found - 레시피/캐릭터 없음)**:
        ```json
        {
            "message": "해당 레시피를 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "아이템 제작에 실패했습니다."
        }
        ```

## Crafting Facilities Routes

Base URL: `/crafting-facilities`

### 1. `GET /crafting-facilities/servers/:serverId`

*   **Description**: 특정 서버의 모든 크래프팅 시설과 해당 레벨을 조회합니다.
*   **Controller Function**: `craftingFacilityController.getCraftingFacilitiesByServer`
*   **Request**:
    *   **URL Parameters**:
        *   `serverId` (number): 조회할 서버의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "name": "모루",
                "description": "금속 아이템을 제작하는 데 사용됩니다.",
                "required_level": 1,
                "level": 5
            }
        ]
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 서버를 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "크래프팅 시설 목록을 불러오는 데 실패했습니다."
        }
        ```

## Task Routes

Base URL: `/tasks`

### 1. `POST /tasks`

*   **Description**: 새로운 작업을 생성하거나 기존 작업을 업데이트합니다.
*   **Controller Function**: `taskController.addTask` (실제 함수명은 `createTask`)
*   **Request**:
    *   **Body (application/json)**:
        ```json
        {
            "taskName": "새로운 작업 이름"
        }
        ```
*   **Response**:
    *   **Success (201 Created)**:
        ```json
        {
            "message": "작업이 성공적으로 추가되거나 업데이트되었습니다.",
            "taskId": 1
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "작업 이름은 필수입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "작업 추가에 실패했습니다."
        }
        ```

### 2. `GET /tasks`

*   **Description**: 모든 작업 목록을 조회합니다.
*   **Controller Function**: `taskController.getAllTasks`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "task_name": "나무캐기"
            },
            {
                "id": 2,
                "task_name": "요리하기"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "작업을 불러오는 데 실패했습니다."
        }
        ```

### 3. `GET /tasks/character/:characterId`

*   **Description**: 특정 캐릭터의 모든 작업 목록과 완료 상태를 조회합니다.
*   **Controller Function**: `taskController.getCharacterTasks`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 조회할 캐릭터의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "task_id": 1,
                "task_name": "나무캐기",
                "is_completed": true,
                "completed_date": "2023-10-26"
            },
            {
                "task_id": 2,
                "task_name": "요리하기",
                "is_completed": null,
                "completed_date": null
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "캐릭터 작업을 불러오는 데 실패했습니다."
        }
        ```

### 4. `GET /tasks/all-character-status`

*   **Description**: 지정된 캐릭터 ID들에 대한 모든 작업 목록과 각 캐릭터의 완료 상태를 조회합니다.
*   **Controller Function**: `taskController.getTasksForAllCharacters`
*   **Request**:
    *   **Query Parameters**:
        *   `characterIds` (string): 쉼표로 구분된 캐릭터 ID 목록 (예: `1,2,3`)
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "task_id": 1,
                "task_name": "나무캐기",
                "character_statuses": [
                    {
                        "character_id": 101,
                        "is_completed": true,
                        "completed_date": "2023-10-26"
                    },
                    {
                        "character_id": 102,
                        "is_completed": false,
                        "completed_date": null
                    }
                ]
            },
            {
                "task_id": 2,
                "task_name": "요리하기",
                "character_statuses": []
            }
        ]
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "characterIds는 필수입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "모든 캐릭터에 대한 작업을 불러오는 데 실패했습니다."
        }
        ```

### 5. `PUT /tasks/:taskId/character/:characterId`

*   **Description**: 특정 캐릭터의 특정 작업 완료 상태를 업데이트하거나 삽입합니다.
*   **Controller Function**: `taskController.toggleTaskCompletion` (실제 함수명은 `updateCharacterTaskCompletion`)
*   **Request**:
    *   **URL Parameters**:
        *   `taskId` (number): 작업 ID
        *   `characterId` (number): 캐릭터 ID
    *   **Body (application/json)**:
        ```json
        {
            "isCompleted": true
        }
        ```
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "message": "캐릭터 작업 상태가 성공적으로 업데이트되었습니다.",
            "changes": 1
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "isCompleted 값은 필수입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "캐릭터 작업 상태 업데이트에 실패했습니다."
        }
        ```

### 6. `DELETE /tasks/:taskId`

*   **Description**: 특정 작업을 삭제합니다.
*   **Controller Function**: `taskController.deleteTask`
*   **Request**:
    *   **URL Parameters**:
        *   `taskId` (number): 삭제할 작업 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "message": "작업이 성공적으로 삭제되었습니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "작업을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "작업 삭제에 실패했습니다."
        }
        ```

## Equipment Routes

Base URL: `/equipment`

### 1. `GET /equipment/grades`

*   **Description**: 모든 장비 등급의 목록을 조회합니다.
*   **Controller Function**: `equipmentController.getGrades`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "name": "일반",
                "color_hex": "#A0A0A0"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "장비 등급을 불러오는 데 실패했습니다."
        }
        ```

### 2. `GET /equipment/types`

*   **Description**: 모든 장비 종류의 목록을 조회합니다.
*   **Controller Function**: `equipmentController.getEquipmentTypes`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "name": "무기"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "장비 종류를 불러오는 데 실패했습니다."
        }
        ```

### 3. `GET /equipment/parts`

*   **Description**: 모든 장비 부위의 목록을 조회합니다.
*   **Controller Function**: `equipmentController.getEquipmentParts`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "name": "투구"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "장비 부위를 불러오는 데 실패했습니다."
        }
        ```

### 4. `GET /equipment`

*   **Description**: 모든 장비 아이템의 목록을 조회합니다.
*   **Controller Function**: `equipmentController.getAllEquipments`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1001,
                "name": "강철 투구",
                "description": "강철로 만들어진 투구입니다.",
                "equipment_type_id": 1,
                "equipment_type_name": "방어구",
                "equipment_part_id": 1,
                "equipment_part_name": "머리",
                "base_stats": { "defense": 10 },
                "is_unique": false
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "모든 장비를 불러오는 데 실패했습니다."
        }
        ```

### 5. `GET /equipment/:equipment_id`

*   **Description**: 특정 장비 아이템의 상세 정보를 조회합니다.
*   **Controller Function**: `equipmentController.getEquipmentById`
*   **Request**:
    *   **URL Parameters**:
        *   `equipment_id` (number): 조회할 장비의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "id": 1001,
            "name": "강철 투구",
            "description": "강철로 만들어진 투구입니다.",
            "equipment_type_id": 1,
            "equipment_type_name": "방어구",
            "equipment_part_id": 1,
            "equipment_part_name": "머리",
            "base_stats": { "defense": 10 },
            "is_unique": false
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "장비를 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "장비를 불러오는 데 실패했습니다."
        }
        ```

### 6. `GET /equipment/runes`

*   **Description**: 모든 룬의 목록을 조회합니다.
*   **Controller Function**: `equipmentController.getAllRunes`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 3001,
                "name": "힘의 룬",
                "grade_id": 1,
                "grade_name": "일반",
                "color_hex": "#A0A0A0",
                "bonus_options": { "strength": 5 }
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "모든 룬을 불러오는 데 실패했습니다."
        }
        ```

### 7. `GET /equipment/runes/:rune_id`

*   **Description**: 특정 룬의 상세 정보를 조회합니다.
*   **Controller Function**: `equipmentController.getRuneById`
*   **Request**:
    *   **URL Parameters**:
        *   `rune_id` (number): 조회할 룬의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "id": 3001,
            "name": "힘의 룬",
            "grade_id": 1,
            "grade_name": "일반",
            "color_hex": "#A0A0A0",
            "bonus_options": { "strength": 5 }
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "룬을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "룬을 불러오는 데 실패했습니다."
        }
        ```

### 8. `GET /equipment/gems`

*   **Description**: 모든 보석의 목록을 조회합니다.
*   **Controller Function**: `equipmentController.getAllGems`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 4001,
                "name": "붉은 홍옥",
                "description": "붉은 빛을 띠는 보석입니다.",
                "grade_id": 1,
                "grade_name": "일반",
                "color_hex": "#A0A0A0",
                "bonus_options": { "crit_rate": 1 }
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "모든 보석을 불러오는 데 실패했습니다."
        }
        ```

### 9. `GET /equipment/gems/:gem_id`

*   **Description**: 특정 보석의 상세 정보를 조회합니다.
*   **Controller Function**: `equipmentController.getGemById`
*   **Request**:
    *   **URL Parameters**:
        *   `gem_id` (number): 조회할 보석의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "id": 4001,
            "name": "붉은 홍옥",
            "description": "붉은 빛을 띠는 보석입니다.",
            "grade_id": 1,
            "grade_name": "일반",
            "color_hex": "#A0A0A0",
            "bonus_options": { "crit_rate": 1 }
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "보석을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "보석을 불러오는 데 실패했습니다."
        }
        ```

### 10. `GET /equipment/slots`

*   **Description**: 모든 장비 슬롯의 목록을 조회합니다.
*   **Controller Function**: `equipmentController.getEquipmentSlots`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "slot_name": "HEAD",
                "allowed_equipment_item_type_name": "방어구"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "장비 슬롯을 불러오는 데 실패했습니다."
        }
        ```

### 11. `GET /equipment/characters/:characterId/equipment`

*   **Description**: 주어진 캐릭터ID에 대한 현재 장착 중인 모든 장비와 부가 장착물 정보를 조회합니다.
*   **Controller Function**: `equipmentController.getCharacterEquipment`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 조회할 캐릭터의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "characterId": 42,
          "characterName": "기사단장 테오",
          "equipment": [
            {
              "slot": "HEAD",
              "slotName": "머리",
              "equipment": {
                "id": 1001,
                "name": "강철 투구",
                "type": "armor"
              },
              "runes": [],
              "gems": []
            },
            {
              "slot": "WEAPON",
              "slotName": "무기",
              "equipment": {
                "id": 1003,
                "name": "불타는 검",
                "type": "weapon"
              },
              "runes": [
                { "id": 3002, "name": "불의 룬" }
              ],
              "gems": [
                { "id": 4001, "name": "붉은 홍옥" }
              ]
            },
            {
              "slot": "RING2",
              "slotName": "반지 2",
              "equipment": null,
              "runes": [],
              "gems": []
            }
          ]
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "캐릭터 장착 정보를 불러오는 데 실패했습니다."
        }
        ```

### 12. `PUT /equipment/characters/:characterId/equipment/:slot`

*   **Description**: 특정 캐릭터의 특정 슬롯에 장비를 장착하거나 교체합니다. `equipmentId`를 `null` 또는 `0`으로 보낼 경우 장비를 해제합니다.
*   **Controller Function**: `equipmentController.equipItemInSlot`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 캐릭터 ID
        *   `slot` (string): 장비 슬롯 이름 (예: HEAD, WEAPON)
    *   **Body (application/json)**:
        ```json
        { "equipmentId": 1050 }
        ```
        또는 장비 해제 시:
        ```json
        { "equipmentId": null }
        ```
*   **Response**:
    *   **Success (200 OK - 장착/변경)**:
        ```json
        {
          "message": "장비 장착/변경 성공",
          "slot": "WEAPON",
          "slotName": "무기",
          "equipment": {
            "id": 1050,
            "name": "절망의 대검",
            "type": "weapon"
          },
          "runes": [],
          "gems": []
        }
        ```
    *   **Success (200 OK - 해제)**:
        ```json
        {
            "message": "장비 해제 성공",
            "slot": "WEAPON",
            "equipment": null,
            "runes": [],
            "gems": []
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "캐릭터 ID와 슬롯은 필수입니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "슬롯을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "장비 장착/변경에 실패했습니다."
        }
        ```

### 13. `POST /equipment/characters/:characterId/equipment/:slot/rune`

*   **Description**: 장착된 장비에 룬을 삽입합니다.
*   **Controller Function**: `equipmentController.addRuneToEquipment`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 캐릭터 ID
        *   `slot` (string): 장비 슬롯 이름
    *   **Body (application/json)**:
        ```json
        { "runeId": 3010 }
        ```
*   **Response**:
    *   **Success (201 Created)**:
        ```json
        {
            "message": "룬이 성공적으로 삽입되었습니다."
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "캐릭터 ID, 슬롯, 룬 ID는 필수입니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "슬롯을 찾을 수 없습니다."
        }
        ```
    *   **Error (409 Conflict)**:
        ```json
        {
            "message": "이미 해당 장비에 삽입된 룬입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "룬 삽입에 실패했습니다."
        }
        ```

### 14. `DELETE /equipment/characters/:characterId/equipment/:slot/rune/:runeId`

*   **Description**: 장착된 장비에서 룬을 제거합니다.
*   **Controller Function**: `equipmentController.removeRuneFromEquipment`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 캐릭터 ID
        *   `slot` (string): 장비 슬롯 이름
        *   `runeId` (number): 제거할 룬의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "message": "룬이 성공적으로 제거되었습니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 장비에서 룬을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "룬 제거에 실패했습니다."
        }
        ```

### 15. `POST /equipment/characters/:characterId/equipment/:slot/gem`

*   **Description**: 장착된 장비에 보석을 삽입합니다.
*   **Controller Function**: `equipmentController.addGemToEquipment`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 캐릭터 ID
        *   `slot` (string): 장비 슬롯 이름
    *   **Body (application/json)**:
        ```json
        { "gemId": 4010 }
        ```
*   **Response**:
    *   **Success (201 Created)**:
        ```json
        {
            "message": "보석이 성공적으로 삽입되었습니다."
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "캐릭터 ID, 슬롯, 보석 ID는 필수입니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "슬롯을 찾을 수 없습니다."
        }
        ```
    *   **Error (409 Conflict)**:
        ```json
        {
            "message": "이미 해당 장비에 삽입된 보석입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "보석 삽입에 실패했습니다."
        }
        ```

### 16. `DELETE /equipment/characters/:characterId/equipment/:slot/gem/:gemId`

*   **Description**: 장착된 장비에서 보석을 제거합니다.
*   **Controller Function**: `equipmentController.removeGemFromEquipment`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 캐릭터 ID
        *   `slot` (string): 장비 슬롯 이름
        *   `gemId` (number): 제거할 보석의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "message": "보석이 성공적으로 제거되었습니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 장비에서 보석을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "보석 제거에 실패했습니다."
        }
        ```

## Part Time Job Routes

Base URL: `/part-time-jobs`

### 1. `GET /part-time-jobs`

*   **Description**: 모든 아르바이트 목록을 조회합니다.
*   **Controller Function**: `partTimeJobController.getAllPartTimeJobs`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "region": "티르코네일",
                "npc": "던컨",
                "job_name": "밀 수확",
                "requirements": "밀 10개",
                "main_reward": "골드 500",
                "entry_condition": "월요일",
                "notes": "쉬운 아르바이트",
                "job_type": "normal"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "아르바이트 목록을 불러오는 데 실패했습니다."
        }
        ```

## User Character Task Routes

Base URL: `/user-character-tasks`

### 1. `POST /user-character-tasks`

*   **Description**: 새로운 사용자 정의 캐릭터 작업을 생성합니다.
*   **Controller Function**: `userCharacterTaskController.createTask`
*   **Request**:
    *   **Body (application/json)**:
        ```json
        {
            "character_id": 101,
            "task_description": "물약 100개 모으기",
            "target_item_id": 1001,
            "target_quantity": 100
        }
        ```
*   **Response**:
    *   **Success (201 Created)**:
        ```json
        {
            "message": "작업이 성공적으로 생성되었습니다.",
            "task_id": 123
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "필수 필드가 누락되었거나 유효하지 않습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "작업 생성에 실패했습니다."
        }
        ```

### 2. `GET /user-character-tasks/:characterId`

*   **Description**: 특정 캐릭터의 모든 사용자 정의 작업을 조회합니다.
*   **Controller Function**: `userCharacterTaskController.getTasksByCharacterId`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 작업을 조회할 캐릭터의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 123,
                "character_id": 101,
                "task_description": "물약 100개 모으기",
                "target_item_id": 1001,
                "target_quantity": 100,
                "current_quantity": 50,
                "is_completed": false,
                "created_at": "2023-01-01T10:00:00Z",
                "updated_at": "2023-01-01T11:00:00Z"
            }
        ]
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 캐릭터를 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "작업 목록을 불러오는 데 실패했습니다."
        }
        ```

### 3. `PUT /user-character-tasks/:taskId`

*   **Description**: 특정 사용자 정의 작업을 업데이트합니다.
*   **Controller Function**: `userCharacterTaskController.updateTask`
*   **Request**:
    *   **URL Parameters**:
        *   `taskId` (number): 업데이트할 작업의 ID
    *   **Body (application/json)**:
        ```json
        {
            "current_quantity": 75,
            "is_completed": false
        }
        ```
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "message": "작업이 성공적으로 업데이트되었습니다."
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "업데이트할 필드가 누락되었거나 유효하지 않습니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 작업을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "작업 업데이트에 실패했습니다."
        }
        ```

### 4. `DELETE /user-character-tasks/:taskId`

*   **Description**: 특정 사용자 정의 작업을 삭제합니다.
*   **Controller Function**: `userCharacterTaskController.deleteTask`
*   **Request**:
    *   **URL Parameters**:
        *   `taskId` (number): 삭제할 작업의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
            "message": "작업이 성공적으로 삭제되었습니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 작업을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "작업 삭제에 실패했습니다."
        }
        ```

## Profession Routes

Base URL: `/professions`

### 1. `GET /professions`

*   **Description**: 모든 직업(전직)의 목록을 조회합니다.
*   **Controller Function**: `professionController.getProfessions`
*   **Request**:
    *   **Parameters**: 없음
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        [
            {
                "id": 1,
                "tier": "OP",
                "name": "석궁사수",
                "description": "원거리 딜러, 현 메타 최상위 화력, 레이드·보스전에서 강세"
            },
            {
                "id": 2,
                "tier": "1티어",
                "name": "화염술사",
                "description": "원거리 극딜, 강력한 광역기와 단일기, 화려한 스킬, 상위권 딜러"
            }
        ]
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "직업 목록을 불러오는 데 실패했습니다."
        }
        ```

## Character Equipment Routes

Base URL: `/api/characters/:characterId/equipment`

### 1. `GET /api/characters/:characterId/equipment`

*   **Description**: 주어진 캐릭터 ID에 대한 현재 장착 중인 모든 장비와 부가 장착물(룬, 보석) 정보를 조회합니다.
*   **Controller Function**: `equipmentController.getCharacterEquipment`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 조회할 캐릭터의 고유 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "characterId": 42,
          "characterName": "기사단장 테오",
          "equipment": [
            {
              "slot": "HEAD",
              "slotName": "머리",
              "equipment": {
                "id": 1001,
                "name": "강철 투구",
                "type": "armor"
              },
              "runes": [],
              "gems": []
            },
            {
              "slot": "WEAPON",
              "slotName": "무기",
              "equipment": {
                "id": 1003,
                "name": "불타는 검",
                "type": "weapon"
              },
              "runes": [
                { "id": 3002, "name": "불의 룬" }
              ],
              "gems": [
                { "id": 4001, "name": "붉은 홍옥" }
              ]
            },
            {
              "slot": "RING2",
              "slotName": "반지 2",
              "equipment": null,
              "runes": [],
              "gems": []
            }
          ]
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "캐릭터를 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "캐릭터 장착 정보를 불러오는 데 실패했습니다."
        }
        ```

### 2. `PUT /api/characters/:characterId/equipment/:slot`

*   **Description**: 특정 캐릭터의 특정 슬롯에 장비를 장착하거나 교체합니다. `equipmentId`를 `null` 또는 `0`으로 전송하면 해당 슬롯의 장비를 해제합니다.
*   **Controller Function**: `equipmentController.equipItemInSlot`
*   **Request**:
    *   **URL Parameters**:
        *   `characterId` (number): 대상 캐릭터의 ID
        *   `slot` (string): 장비를 장착/해제할 슬롯의 코드 (예: `HEAD`, `WEAPON`)
    *   **Body (application/json)**:
        ```json
        {
          "equipmentId": 1050
        } 
        // 또는 장비 해제 시
        {
          "equipmentId": null 
        }
        ```
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "message": "장비 장착/변경 성공",
          "slot": "WEAPON",
          "slotName": "무기",
          "equipment": {
            "id": 1050,
            "name": "절망의 대검",
            "type": "weapon"
          },
          "runes": [], 
          "gems": []   
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "캐릭터 ID와 슬롯은 필수입니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "슬롯을 찾을 수 없습니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "장비 장착/변경에 실패했습니다."
        }
        ```

### 3. 룬 삽입/제거

장착된 장비에 룬을 추가하거나 제거합니다.

*   **경로:**
    *   **삽입 (Add):** `POST /api/characters/:characterId/equipment/:slot/rune`
    *   **제거 (Remove):** `DELETE /api/characters/:characterId/equipment/:slot/rune/:runeId`
*   **Controller Functions**: `equipmentController.addRuneToEquipment`, `equipmentController.removeRuneFromEquipment`
*   **Request (삽입)**:
    *   **URL Parameters**:
        *   `characterId` (number): 대상 캐릭터의 ID
        *   `slot` (string): 룬을 삽입할 장비가 장착된 슬롯의 코드
    *   **Body (application/json)**:
        ```json
        {
          "runeId": 3010
        }
        ```
*   **Request (제거)**:
    *   **URL Parameters**:
        *   `characterId` (number): 대상 캐릭터의 ID
        *   `slot` (string): 룬을 제거할 장비가 장착된 슬롯의 코드
        *   `runeId` (number): 제거할 룬의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "message": "룬 장착 성공", // 또는 "룬 제거 성공"
          "slot": "WEAPON",
          "slotName": "무기",
          "equipment": { "id": 1003, "name": "불타는 검", "type": "weapon" },
          "runes": [ { "id": 3010, "name": "새로운 룬" } ], 
          "gems": []
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "캐릭터 ID, 슬롯, 룬 ID는 필수입니다."
        }
        // 또는
        {
            "message": "이 장비에는 더 이상 룬을 장착할 수 없습니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 슬롯에 장착된 아이템이 없습니다."
        }
        // 또는
        {
            "message": "룬을 찾을 수 없습니다."
        }
        ```
    *   **Error (409 Conflict)**:
        ```json
        {
            "message": "이미 장착된 룬입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "룬 삽입에 실패했습니다."
        }
        ```

### 4. 보석 삽입/제거

장착된 장비에 보석을 추가하거나 제거합니다.

*   **경로:**
    *   **삽입 (Add):** `POST /api/characters/:characterId/equipment/:slot/gem`
    *   **제거 (Remove):** `DELETE /api/characters/:characterId/equipment/:slot/gem/:gemId`
*   **Controller Functions**: `equipmentController.addGemToEquipment`, `equipmentController.removeGemFromEquipment`
*   **Request (삽입)**:
    *   **URL Parameters**:
        *   `characterId` (number): 대상 캐릭터의 ID
        *   `slot` (string): 보석을 삽입할 장비가 장착된 슬롯의 코드
    *   **Body (application/json)**:
        ```json
        {
          "gemId": 4010
        }
        ```
*   **Request (제거)**:
    *   **URL Parameters**:
        *   `characterId` (number): 대상 캐릭터의 ID
        *   `slot` (string): 보석을 제거할 장비가 장착된 슬롯의 코드
        *   `gemId` (number): 제거할 보석의 ID
*   **Response**:
    *   **Success (200 OK)**:
        ```json
        {
          "message": "보석 장착 성공", // 또는 "보석 제거 성공"
          "slot": "WEAPON",
          "slotName": "무기",
          "equipment": { "id": 1003, "name": "불타는 검", "type": "weapon" },
          "runes": [],
          "gems": [ { "id": 4010, "name": "새로운 보석" } ]
        }
        ```
    *   **Error (400 Bad Request)**:
        ```json
        {
            "message": "캐릭터 ID, 슬롯, 보석 ID는 필수입니다."
        }
        // 또는
        {
            "message": "이 장비에는 더 이상 보석을 장착할 수 없습니다."
        }
        ```
    *   **Error (404 Not Found)**:
        ```json
        {
            "message": "해당 슬롯에 장착된 아이템이 없습니다."
        }
        // 또는
        {
            "message": "보석을 찾을 수 없습니다."
        }
        ```
    *   **Error (409 Conflict)**:
        ```json
        {
            "message": "이미 장착된 보석입니다."
        }
        ```
    *   **Error (500 Internal Server Error)**:
        ```json
        {
            "message": "보석 삽입에 실패했습니다."
        }
        ```