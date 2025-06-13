const { getPool } = require('../utils/dbManager');

// Helper for Korean slot names
const SLOT_NAME_MAP = {
    'HEAD': '머리',
    'CHEST': '몸통',
    'WEAPON': '무기',
    'OFF_HAND': '보조 무기',
    'NECKLACE': '목걸이',
    'RING1': '반지 1',
    'RING2': '반지 2',
    // Add other mappings as needed
};

// 장비 등급 조회
const getGrades = async (req, res, dbManager) => {
    console.debug('getGrades 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query('SELECT * FROM grades');
        console.debug(`조회된 등급: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getGrades 함수 종료 (성공)');
    } catch (err) {
        console.error('장비 등급 조회 오류:', err);
        console.debug('getGrades 함수 종료 (오류)');
        res.status(500).json({ message: '장비 등급을 불러오는 데 실패했습니다.' });
    }
};

// 장비 종류 조회
const getEquipmentTypes = async (req, res, dbManager) => {
    console.debug('getEquipmentTypes 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query('SELECT * FROM equipment_types');
        console.debug(`조회된 장비 종류: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getEquipmentTypes 함수 종료 (성공)');
    } catch (err) {
        console.error('장비 종류 조회 오류:', err);
        console.debug('getEquipmentTypes 함수 종료 (오류)');
        res.status(500).json({ message: '장비 종류를 불러오는 데 실패했습니다.' });
    }
};

// 장비 부위 조회
const getEquipmentParts = async (req, res, dbManager) => {
    console.debug('getEquipmentParts 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query('SELECT * FROM equipment_parts');
        console.debug(`조회된 장비 부위: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getEquipmentParts 함수 종료 (성공)');
    } catch (err) {
        console.error('장비 부위 조회 오류:', err);
        console.debug('getEquipmentParts 함수 종료 (오류)');
        res.status(500).json({ message: '장비 부위를 불러오는 데 실패했습니다.' });
    }
};

// 모든 장비 조회
const getAllEquipments = async (req, res, dbManager) => {
    console.debug('getAllEquipments 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query(
            `SELECT e.*, et.name as equipment_type_name, ep.name as equipment_part_name
             FROM equipments e
             JOIN equipment_types et ON e.equipment_type_id = et.id
             LEFT JOIN equipment_parts ep ON e.equipment_part_id = ep.id`
        );
        console.debug(`조회된 모든 장비: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getAllEquipments 함수 종료 (성공)');
    } catch (err) {
        console.error('모든 장비 조회 오류:', err);
        console.debug('getAllEquipments 함수 종료 (오류)');
        res.status(500).json({ message: '모든 장비를 불러오는 데 실패했습니다.' });
    }
};

// 특정 장비 조회
const getEquipmentById = async (req, res, dbManager) => {
    console.debug('getEquipmentById 함수 진입');
    const { equipment_id } = req.params;
    console.debug(`입력값 - equipment_id: ${equipment_id}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query(
            `SELECT e.*, et.name as equipment_type_name, ep.name as equipment_part_name
             FROM equipments e
             JOIN equipment_types et ON e.equipment_type_id = et.id
             LEFT JOIN equipment_parts ep ON e.equipment_part_id = ep.id
             WHERE e.id = ?`,
            [equipment_id]
        );
        console.debug(`조회된 특정 장비: ${JSON.stringify(rows)}`);
        if (rows.length === 0) {
            console.debug(`장비를 찾을 수 없음: equipment_id=${equipment_id}`);
            return res.status(404).json({ message: '장비를 찾을 수 없습니다.' });
        }
        res.json(rows[0]);
        console.debug('getEquipmentById 함수 종료 (성공)');
    } catch (err) {
        console.error('특정 장비 조회 오류:', err);
        console.debug('getEquipmentById 함수 종료 (오류)');
        res.status(500).json({ message: '장비를 불러오는 데 실패했습니다.' });
    }
};

// 모든 룬 조회
const getAllRunes = async (req, res, dbManager) => {
    console.debug('getAllRunes 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query(
            `SELECT r.*, g.name as grade_name, g.color_hex
             FROM runes r
             JOIN grades g ON r.grade_id = g.id`
        );
        console.debug(`조회된 모든 룬: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getAllRunes 함수 종료 (성공)');
    } catch (err) {
        console.error('모든 룬 조회 오류:', err);
        console.debug('getAllRunes 함수 종료 (오류)');
        res.status(500).json({ message: '모든 룬을 불러오는 데 실패했습니다.' });
    }
};

// 특정 룬 조회
const getRuneById = async (req, res, dbManager) => {
    console.debug('getRuneById 함수 진입');
    const { rune_id } = req.params;
    console.debug(`입력값 - rune_id: ${rune_id}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query(
            `SELECT r.*, g.name as grade_name, g.color_hex
             FROM runes r
             JOIN grades g ON r.grade_id = g.id
             WHERE r.id = ?`,
            [rune_id]
        );
        console.debug(`조회된 특정 룬: ${JSON.stringify(rows)}`);
        if (rows.length === 0) {
            console.debug(`룬을 찾을 수 없음: rune_id=${rune_id}`);
            return res.status(404).json({ message: '룬을 찾을 수 없습니다.' });
        }
        res.json(rows[0]);
        console.debug('getRuneById 함수 종료 (성공)');
    } catch (err) {
        console.error('특정 룬 조회 오류:', err);
        console.debug('getRuneById 함수 종료 (오류)');
        res.status(500).json({ message: '룬을 불러오는 데 실패했습니다.' });
    }
};

// 모든 보석 조회 (새로 추가)
const getAllGems = async (req, res, dbManager) => {
    console.debug('getAllGems 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query(
            `SELECT g.*, gr.name as grade_name, gr.color_hex
             FROM gems g
             JOIN grades gr ON g.grade_id = gr.id`
        );
        console.debug(`조회된 모든 보석: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getAllGems 함수 종료 (성공)');
    } catch (err) {
        console.error('모든 보석 조회 오류:', err);
        console.debug('getAllGems 함수 종료 (오류)');
        res.status(500).json({ message: '모든 보석을 불러오는 데 실패했습니다.' });
    }
};

// 특정 보석 조회 (새로 추가)
const getGemById = async (req, res, dbManager) => {
    console.debug('getGemById 함수 진입');
    const { gem_id } = req.params;
    console.debug(`입력값 - gem_id: ${gem_id}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query(
            `SELECT g.*, gr.name as grade_name, gr.color_hex
             FROM gems g
             JOIN grades gr ON g.grade_id = gr.id
             WHERE g.id = ?`,
            [gem_id]
        );
        console.debug(`조회된 특정 보석: ${JSON.stringify(rows)}`);
        if (rows.length === 0) {
            console.debug(`보석을 찾을 수 없음: gem_id=${gem_id}`);
            return res.status(404).json({ message: '보석을 찾을 수 없습니다.' });
        }
        res.json(rows[0]);
        console.debug('getGemById 함수 종료 (성공)');
    } catch (err) {
        console.error('특정 보석 조회 오류:', err);
        console.debug('getGemById 함수 종료 (오류)');
        res.status(500).json({ message: '보석을 불러오는 데 실패했습니다.' });
    }
};

// 모든 장비 슬롯 조회 (새로 추가)
const getEquipmentSlots = async (req, res, dbManager) => {
    console.debug('getEquipmentSlots 함수 진입');
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [rows] = await pool.query('SELECT es.id, es.slot_name, eet.name as allowed_equipment_item_type_name FROM equipment_slots es LEFT JOIN equipment_types eet ON es.allowed_equipment_item_type_id = eet.id');
        console.debug(`조회된 모든 장비 슬롯: ${JSON.stringify(rows)}`);
        res.json(rows);
        console.debug('getEquipmentSlots 함수 종료 (성공)');
    } catch (err) {
        console.error('장비 슬롯 조회 오류:', err);
        console.debug('getEquipmentSlots 함수 종료 (오류)');
        res.status(500).json({ message: '장비 슬롯을 불러오는 데 실패했습니다.' });
    }
};

// 캐릭터 장착 정보 조회 (기존 함수 수정)
const getCharacterEquipment = async (req, res, dbManager) => {
    console.debug('getCharacterEquipment 함수 진입');
    const { characterId } = req.params;
    console.debug(`입력값 - characterId: ${characterId}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        // 캐릭터 이름 조회
        const [characterRows] = await pool.query('SELECT character_name FROM characters WHERE character_id = ?', [characterId]);
        console.debug(`조회된 캐릭터 정보: ${JSON.stringify(characterRows)}`);
        if (characterRows.length === 0) {
            console.debug(`캐릭터를 찾을 수 없음: characterId=${characterId}`);
            return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
        }
        const characterName = characterRows[0].character_name;

        // 모든 슬롯 조회
        const [allSlots] = await pool.query('SELECT id, slot_name FROM equipment_slots ORDER BY id');
        console.debug(`조회된 모든 슬롯: ${JSON.stringify(allSlots)}`);

        // 캐릭터 장착 아이템 조회 (룬 및 보석 포함)
        const [equippedItemsRaw] = await pool.query(
            `SELECT
                cei.char_equip_id,
                es.slot_name AS slot_code,
                es.id AS slot_id,
                e.id AS equipment_id,
                e.name AS equipment_name,
                e.description AS equipment_description,
                e.equipment_type_id,
                et.name AS equipment_type_name,
                e.base_stats,
                e.is_unique,
                cei.enhancement_level
            FROM character_equipped_items cei
            JOIN equipment_slots es ON cei.equipment_slot_id = es.id
            JOIN equipments e ON cei.equipment_id = e.id
            JOIN equipment_types et ON e.equipment_type_id = et.id
            WHERE cei.character_id = ?`,
            [characterId]
        );
        console.debug(`조회된 장착 아이템 원본 데이터: ${JSON.stringify(equippedItemsRaw)}`);

        // 룬 및 보석 정보를 위한 맵 생성
        const runesMap = new Map(); // char_equip_id -> [runes]
        const gemsMap = new Map(); // char_equip_id -> [gems]
        console.debug('룬 및 보석 맵 초기화 완료');

        if (equippedItemsRaw.length > 0) {
            console.debug('장착된 아이템이 존재하여 룬/보석 정보 조회를 시작합니다.');
            const charEquipIds = equippedItemsRaw.map(item => item.char_equip_id);
            console.debug(`조회할 charEquipIds: ${JSON.stringify(charEquipIds)}`);

            const [runesRaw] = await pool.query(
                `SELECT ers.char_equip_id, r.id AS rune_id, r.name AS rune_name
                 FROM equipment_rune_sockets ers
                 JOIN runes r ON ers.rune_id = r.id
                 WHERE ers.char_equip_id IN (?)`,
                [charEquipIds]
            );
            console.debug(`조회된 룬 원본 데이터: ${JSON.stringify(runesRaw)}`);
            runesRaw.forEach(r => {
                if (!runesMap.has(r.char_equip_id)) {
                    runesMap.set(r.char_equip_id, []);
                }
                runesMap.get(r.char_equip_id).push({ id: r.rune_id, name: r.rune_name });
            });
            console.debug('룬 맵 생성 완료');

            const [gemsRaw] = await pool.query(
                `SELECT egs.char_equip_id, g.id AS gem_id, g.name AS gem_name
                 FROM equipment_gem_sockets egs
                 JOIN gems g ON egs.gem_id = g.id
                 WHERE egs.char_equip_id IN (?)`,
                [charEquipIds]
            );
            console.debug(`조회된 보석 원본 데이터: ${JSON.stringify(gemsRaw)}`);
            gemsRaw.forEach(g => {
                if (!gemsMap.has(g.char_equip_id)) {
                    gemsMap.set(g.char_equip_id, []);
                }
                gemsMap.get(g.char_equip_id).push({ id: g.gem_id, name: g.gem_name });
            });
            console.debug('보석 맵 생성 완료');
        }

        // 결과 데이터를 슬롯별로 구성
        const characterEquipment = allSlots.map(slot => {
            console.debug(`슬롯 처리 중: ${slot.slot_name}`);
            const equippedItem = equippedItemsRaw.find(item => item.slot_id === slot.id);
            return {
                slot: slot.slot_name,
                slotName: SLOT_NAME_MAP[slot.slot_name] || slot.slot_name,
                equipment: equippedItem ? {
                    id: equippedItem.equipment_id,
                    name: equippedItem.equipment_name,
                    type: equippedItem.equipment_type_name
                } : null,
                runes: equippedItem ? (runesMap.get(equippedItem.char_equip_id) || []) : [],
                gems: equippedItem ? (gemsMap.get(equippedItem.char_equip_id) || []) : []
            };
        });
        console.debug(`최종 캐릭터 장착 정보: ${JSON.stringify(characterEquipment)}`);

        res.json({
            characterId: parseInt(characterId),
            characterName: characterName,
            equipment: characterEquipment
        });
        console.debug('getCharacterEquipment 함수 종료 (성공)');

    } catch (err) {
        console.error('캐릭터 장착 정보 조회 오류:', err);
        console.debug('getCharacterEquipment 함수 종료 (오류)');
        res.status(500).json({ message: '캐릭터 장착 정보를 불러오는 데 실패했습니다.' });
    }
};

// 장비 착용/변경 (새로 추가)
const equipItemInSlot = async (req, res, dbManager) => {
    console.debug('equipItemInSlot 함수 진입');
    const { characterId, slot } = req.params;
    const { equipmentId } = req.body;
    console.debug(`입력값 - characterId: ${characterId}, slot: ${slot}, equipmentId: ${equipmentId}`);

    if (!characterId || !slot) {
        console.debug('유효성 검사 실패: 캐릭터 ID와 슬롯은 필수입니다.');
        return res.status(400).json({ message: '캐릭터 ID와 슬롯은 필수입니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        const [slotRows] = await pool.query('SELECT id, allowed_equipment_item_type_id FROM equipment_slots WHERE slot_name = ?', [slot]);
        console.debug(`조회된 슬롯 정보: ${JSON.stringify(slotRows)}`);
        if (slotRows.length === 0) {
            console.debug(`슬롯을 찾을 수 없음: slot=${slot}`);
            return res.status(404).json({ message: '슬롯을 찾을 수 없습니다.' });
        }
        const { id: equipment_slot_id, allowed_equipment_item_type_id } = slotRows[0];
        console.debug(`equipment_slot_id: ${equipment_slot_id}, allowed_equipment_item_type_id: ${allowed_equipment_item_type_id}`);

        if (equipmentId === null || equipmentId === 0) {
            console.debug('장비 해제 요청 감지');
            // 장비 해제
            const [deleteResult] = await pool.query(
                'DELETE FROM character_equipped_items WHERE character_id = ? AND equipment_slot_id = ?',
                [characterId, equipment_slot_id]
            );
            console.debug(`장비 해제 결과: ${JSON.stringify(deleteResult)}`);

            // 룬 및 보석 소켓도 함께 삭제
            if (deleteResult.affectedRows > 0) {
                console.debug('관련 룬 및 보석 소켓 삭제 시작');
                // 기존 장착된 아이템의 char_equip_id를 찾아서 룬/보석 삭제
                const [existingCharEquip] = await pool.query(
                    'SELECT char_equip_id FROM character_equipped_items WHERE character_id = ? AND equipment_slot_id = ?',
                    [characterId, equipment_slot_id] // This query will return empty if item was just deleted.
                );
                if (existingCharEquip.length > 0) {
                    const charEquipIdToDelete = existingCharEquip[0].char_equip_id;
                    await pool.query('DELETE FROM equipment_rune_sockets WHERE char_equip_id = ?', [charEquipIdToDelete]);
                    console.debug(`룬 소켓 삭제 완료 (char_equip_id: ${charEquipIdToDelete})`);
                    await pool.query('DELETE FROM equipment_gem_sockets WHERE char_equip_id = ?', [charEquipIdToDelete]);
                    console.debug(`보석 소켓 삭제 완료 (char_equip_id: ${charEquipIdToDelete})`);
                }
                console.debug('관련 룬 및 보석 소켓 삭제 완료');
            }

            res.json({ message: '장비 해제 성공', slot: slot, slotName: SLOT_NAME_MAP[slot] || slot, equipment: null, runes: [], gems: [] });
            console.debug('equipItemInSlot 함수 종료 (장비 해제 성공)');

        } else {
            console.debug('장비 장착/변경 요청 감지');
            // 장비 장착 또는 변경
            const [equipmentRows] = await pool.query('SELECT id, equipment_type_id FROM equipments WHERE id = ?', [equipmentId]);
            console.debug(`조회된 장비 정보: ${JSON.stringify(equipmentRows)}`);
            if (equipmentRows.length === 0) {
                console.debug(`장비를 찾을 수 없음: equipmentId=${equipmentId}`);
                return res.status(404).json({ message: '장비를 찾을 수 없습니다.' });
            }
            const { equipment_type_id } = equipmentRows[0];
            console.debug(`equipment_type_id: ${equipment_type_id}`);

            if (allowed_equipment_item_type_id && equipment_type_id !== allowed_equipment_item_type_id) {
                console.debug(`장착 불가: 슬롯 타입 불일치. 허용된 타입: ${allowed_equipment_item_type_id}, 장비 타입: ${equipment_type_id}`);
                return res.status(400).json({ message: '이 슬롯에 장착할 수 없는 장비 유형입니다.' });
            }

            // 기존에 해당 슬롯에 장비가 장착되어 있었다면, 그 장비의 룬/보석 소켓을 삭제
            const [existingEquippedItem] = await pool.query(
                'SELECT char_equip_id FROM character_equipped_items WHERE character_id = ? AND equipment_slot_id = ?',
                [characterId, equipment_slot_id]
            );
            console.debug(`기존 장착 아이템 정보: ${JSON.stringify(existingEquippedItem)}`);
            if (existingEquippedItem.length > 0) {
                const oldCharEquipId = existingEquippedItem[0].char_equip_id;
                await pool.query('DELETE FROM equipment_rune_sockets WHERE char_equip_id = ?', [oldCharEquipId]);
                console.debug(`이전 장비의 룬 소켓 삭제 완료 (char_equip_id: ${oldCharEquipId})`);
                await pool.query('DELETE FROM equipment_gem_sockets WHERE char_equip_id = ?', [oldCharEquipId]);
                console.debug(`이전 장비의 보석 소켓 삭제 완료 (char_equip_id: ${oldCharEquipId})`);
            }

            const [result] = await pool.query(
                'INSERT INTO character_equipped_items (character_id, equipment_slot_id, equipment_id, enhancement_level) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE equipment_id = VALUES(equipment_id)',
                [characterId, equipment_slot_id, equipmentId, 0] // enhancement_level default to 0 for now
            );
            console.debug(`장비 착용/변경 결과: ${JSON.stringify(result)}`);

            // 장착된 아이템의 상세 정보를 다시 조회하여 응답
            const [equippedItemInfo] = await pool.query(
                `SELECT
                    cei.char_equip_id,
                    es.slot_name AS slot,
                    e.id AS equipment_id,
                    e.name AS equipment_name,
                    et.name AS equipment_type_name
                FROM character_equipped_items cei
                JOIN equipment_slots es ON cei.equipment_slot_id = es.id
                JOIN equipments e ON cei.equipment_id = e.id
                JOIN equipment_types et ON e.equipment_type_id = et.id
                WHERE cei.character_id = ? AND cei.equipment_slot_id = ?`,
                [characterId, equipment_slot_id]
            );
            console.debug(`새롭게 장착된 아이템 정보: ${JSON.stringify(equippedItemInfo)}`);

            // 새로 장착된 아이템의 char_equip_id를 사용하여 룬/보석 정보 조회 (현재는 없으므로 빈 배열)
            const newCharEquipId = equippedItemInfo[0].char_equip_id;
            const [runesOnNewItem] = await pool.query('SELECT r.id, r.name FROM equipment_rune_sockets ers JOIN runes r ON ers.rune_id = r.id WHERE ers.char_equip_id = ?', [newCharEquipId]);
            const [gemsOnNewItem] = await pool.query('SELECT g.id, g.name FROM equipment_gem_sockets egs JOIN gems g ON egs.gem_id = g.id WHERE egs.char_equip_id = ?', [newCharEquipId]);

            res.json({
                message: '장비 장착/변경 성공',
                slot: equippedItemInfo[0].slot,
                slotName: SLOT_NAME_MAP[equippedItemInfo[0].slot] || equippedItemInfo[0].slot,
                equipment: {
                    id: equippedItemInfo[0].equipment_id,
                    name: equippedItemInfo[0].equipment_name,
                    type: equippedItemInfo[0].equipment_type_name
                },
                runes: runesOnNewItem,
                gems: gemsOnNewItem
            });
            console.debug('equipItemInSlot 함수 종료 (장비 장착/변경 성공)');
        }

    } catch (err) {
        console.error('장비 장착/변경 오류:', err);
        console.debug('equipItemInSlot 함수 종료 (오류)');
        res.status(500).json({ message: '장비 장착/변경에 실패했습니다.' });
    }
};

// 룬 삽입 (새로 추가)
const addRuneToEquipment = async (req, res, dbManager) => {
    console.debug('addRuneToEquipment 함수 진입');
    const { characterId, slot } = req.params;
    const { runeId } = req.body;
    console.debug(`입력값 - characterId: ${characterId}, slot: ${slot}, runeId: ${runeId}`);

    if (!characterId || !slot || !runeId) {
        console.debug('유효성 검사 실패: 캐릭터 ID, 슬롯, 룬 ID는 필수입니다.');
        return res.status(400).json({ message: '캐릭터 ID, 슬롯, 룬 ID는 필수입니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        const [slotRows] = await pool.query('SELECT id FROM equipment_slots WHERE slot_name = ?', [slot]);
        console.debug(`조회된 슬롯 정보: ${JSON.stringify(slotRows)}`);
        if (slotRows.length === 0) {
            console.debug(`슬롯을 찾을 수 없음: slot=${slot}`);
            return res.status(404).json({ message: '슬롯을 찾을 수 없습니다.' });
        }
        const equipment_slot_id = slotRows[0].id;
        console.debug(`equipment_slot_id: ${equipment_slot_id}`);

        const [equippedItemRows] = await pool.query(
            'SELECT char_equip_id FROM character_equipped_items WHERE character_id = ? AND equipment_slot_id = ?',
            [characterId, equipment_slot_id]
        );
        console.debug(`조회된 장착 아이템 정보: ${JSON.stringify(equippedItemRows)}`);
        if (equippedItemRows.length === 0) {
            console.debug(`해당 슬롯에 장착된 아이템이 없음: characterId=${characterId}, slot=${slot}`);
            return res.status(404).json({ message: '해당 슬롯에 장착된 아이템이 없습니다.' });
        }
        const char_equip_id = equippedItemRows[0].char_equip_id;
        console.debug(`char_equip_id: ${char_equip_id}`);

        // 룬 존재 여부 확인
        const [runeExists] = await pool.query('SELECT id FROM runes WHERE id = ?', [runeId]);
        console.debug(`룬 존재 여부 확인 결과: ${JSON.stringify(runeExists)}`);
        if (runeExists.length === 0) {
            console.debug(`룬을 찾을 수 없음: runeId=${runeId}`);
            return res.status(404).json({ message: '룬을 찾을 수 없습니다.' });
        }

        // 이미 장착된 룬인지 확인
        const [existingRune] = await pool.query(
            'SELECT * FROM equipment_rune_sockets WHERE char_equip_id = ? AND rune_id = ?',
            [char_equip_id, runeId]
        );
        console.debug(`기존 룬 장착 여부: ${JSON.stringify(existingRune)}`);
        if (existingRune.length > 0) {
            console.debug(`이미 장착된 룬: runeId=${runeId}`);
            return res.status(409).json({ message: '이미 장착된 룬입니다.' });
        }

        // 룬 소켓 제한 검증 (예시: 장비당 룬 1개로 제한)
        const [currentRunes] = await pool.query(
            'SELECT COUNT(*) as count FROM equipment_rune_sockets WHERE char_equip_id = ?',
            [char_equip_id]
        );
        console.debug(`현재 장착된 룬 개수: ${currentRunes[0].count}`);
        // 실제 게임 규칙에 따라 장비가 가질 수 있는 룬 소켓 수를 확인하는 로직 추가 필요
        // 여기서는 예시로 1개로 제한한다고 가정
        if (currentRunes[0].count >= 1) { // 이 값은 실제 게임 규칙에 따라 달라져야 합니다.
            console.debug('룬 소켓이 가득 찼습니다.');
            return res.status(400).json({ message: '이 장비에는 더 이상 룬을 장착할 수 없습니다.' });
        }

        const [insertResult] = await pool.query(
            'INSERT INTO equipment_rune_sockets (char_equip_id, rune_id) VALUES (?, ?)',
            [char_equip_id, runeId]
        );
        console.debug(`룬 삽입 결과: ${JSON.stringify(insertResult)}`);

        // 업데이트된 슬롯 정보 반환 (룬 목록 포함)
        const [updatedEquippedItemInfo] = await pool.query(
            `SELECT
                es.slot_name AS slot,
                e.id AS equipment_id,
                e.name AS equipment_name,
                et.name AS equipment_type_name,
                cei.char_equip_id
            FROM character_equipped_items cei
            JOIN equipment_slots es ON cei.equipment_slot_id = es.id
            JOIN equipments e ON cei.equipment_id = e.id
            JOIN equipment_types et ON e.equipment_type_id = et.id
            WHERE cei.char_equip_id = ?`,
            [char_equip_id]
        );
        console.debug(`업데이트된 장비 정보: ${JSON.stringify(updatedEquippedItemInfo)}`);

        const [runesOnItem] = await pool.query('SELECT r.id, r.name FROM equipment_rune_sockets ers JOIN runes r ON ers.rune_id = r.id WHERE ers.char_equip_id = ?', [char_equip_id]);
        const [gemsOnItem] = await pool.query('SELECT g.id, g.name FROM equipment_gem_sockets egs JOIN gems g ON egs.gem_id = g.id WHERE egs.char_equip_id = ?', [char_equip_id]);

        res.json({
            message: '룬 장착 성공',
            slot: updatedEquippedItemInfo[0].slot,
            slotName: SLOT_NAME_MAP[updatedEquippedItemInfo[0].slot] || updatedEquippedItemInfo[0].slot,
            equipment: {
                id: updatedEquippedItemInfo[0].equipment_id,
                name: updatedEquippedItemInfo[0].equipment_name,
                type: updatedEquippedItemInfo[0].equipment_type_name
            },
            runes: runesOnItem,
            gems: gemsOnItem
        });
        console.debug('addRuneToEquipment 함수 종료 (성공)');

    } catch (err) {
        console.error('룬 삽입 오류:', err);
        console.debug('addRuneToEquipment 함수 종료 (오류)');
        res.status(500).json({ message: '룬 삽입에 실패했습니다.' });
    }
};

// 룬 제거 (새로 추가)
const removeRuneFromEquipment = async (req, res, dbManager) => {
    console.debug('removeRuneFromEquipment 함수 진입');
    const { characterId, slot, runeId } = req.params; // runeId는 URL 파라미터로 가정
    console.debug(`입력값 - characterId: ${characterId}, slot: ${slot}, runeId: ${runeId}`);

    if (!characterId || !slot || !runeId) {
        console.debug('유효성 검사 실패: 캐릭터 ID, 슬롯, 룬 ID는 필수입니다.');
        return res.status(400).json({ message: '캐릭터 ID, 슬롯, 룬 ID는 필수입니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        const [slotRows] = await pool.query('SELECT id FROM equipment_slots WHERE slot_name = ?', [slot]);
        console.debug(`조회된 슬롯 정보: ${JSON.stringify(slotRows)}`);
        if (slotRows.length === 0) {
            console.debug(`슬롯을 찾을 수 없음: slot=${slot}`);
            return res.status(404).json({ message: '슬롯을 찾을 수 없습니다.' });
        }
        const equipment_slot_id = slotRows[0].id;
        console.debug(`equipment_slot_id: ${equipment_slot_id}`);

        const [equippedItemRows] = await pool.query(
            'SELECT char_equip_id FROM character_equipped_items WHERE character_id = ? AND equipment_slot_id = ?',
            [characterId, equipment_slot_id]
        );
        console.debug(`조회된 장착 아이템 정보: ${JSON.stringify(equippedItemRows)}`);
        if (equippedItemRows.length === 0) {
            console.debug(`해당 슬롯에 장착된 아이템이 없음: characterId=${characterId}, slot=${slot}`);
            return res.status(404).json({ message: '해당 슬롯에 장착된 아이템이 없습니다.' });
        }
        const char_equip_id = equippedItemRows[0].char_equip_id;
        console.debug(`char_equip_id: ${char_equip_id}`);

        const [deleteResult] = await pool.query(
            'DELETE FROM equipment_rune_sockets WHERE char_equip_id = ? AND rune_id = ?',
            [char_equip_id, runeId]
        );
        console.debug(`룬 제거 결과: ${JSON.stringify(deleteResult)}`);

        if (deleteResult.affectedRows === 0) {
            console.debug(`해당 룬을 찾을 수 없거나 이미 제거됨: char_equip_id=${char_equip_id}, runeId=${runeId}`);
            return res.status(404).json({ message: '해당 룬을 찾을 수 없거나 이미 제거되었습니다.' });
        }

        // 업데이트된 슬롯 정보 반환 (룬 목록 포함)
        const [updatedEquippedItemInfo] = await pool.query(
            `SELECT
                es.slot_name AS slot,
                e.id AS equipment_id,
                e.name AS equipment_name,
                et.name AS equipment_type_name,
                cei.char_equip_id
            FROM character_equipped_items cei
            JOIN equipment_slots es ON cei.equipment_slot_id = es.id
            JOIN equipments e ON cei.equipment_id = e.id
            JOIN equipment_types et ON e.equipment_type_id = et.id
            WHERE cei.char_equip_id = ?`,
            [char_equip_id]
        );
        console.debug(`업데이트된 장비 정보: ${JSON.stringify(updatedEquippedItemInfo)}`);

        const [runesOnItem] = await pool.query('SELECT r.id, r.name FROM equipment_rune_sockets ers JOIN runes r ON ers.rune_id = r.id WHERE ers.char_equip_id = ?', [char_equip_id]);
        const [gemsOnItem] = await pool.query('SELECT g.id, g.name FROM equipment_gem_sockets egs JOIN gems g ON egs.gem_id = g.id WHERE egs.char_equip_id = ?', [char_equip_id]);

        res.json({
            message: '룬 제거 성공',
            slot: updatedEquippedItemInfo[0].slot,
            slotName: SLOT_NAME_MAP[updatedEquippedItemInfo[0].slot] || updatedEquippedItemInfo[0].slot,
            equipment: {
                id: updatedEquippedItemInfo[0].equipment_id,
                name: updatedEquippedItemInfo[0].equipment_name,
                type: updatedEquippedItemInfo[0].equipment_type_name
            },
            runes: runesOnItem,
            gems: gemsOnItem
        });
        console.debug('removeRuneFromEquipment 함수 종료 (성공)');

    } catch (err) {
        console.error('룬 제거 오류:', err);
        console.debug('removeRuneFromEquipment 함수 종료 (오류)');
        res.status(500).json({ message: '룬 제거에 실패했습니다.' });
    }
};

// 보석 삽입 (새로 추가)
const addGemToEquipment = async (req, res, dbManager) => {
    console.debug('addGemToEquipment 함수 진입');
    const { characterId, slot } = req.params;
    const { gemId } = req.body;
    console.debug(`입력값 - characterId: ${characterId}, slot: ${slot}, gemId: ${gemId}`);

    if (!characterId || !slot || !gemId) {
        console.debug('유효성 검사 실패: 캐릭터 ID, 슬롯, 보석 ID는 필수입니다.');
        return res.status(400).json({ message: '캐릭터 ID, 슬롯, 보석 ID는 필수입니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        const [slotRows] = await pool.query('SELECT id FROM equipment_slots WHERE slot_name = ?', [slot]);
        console.debug(`조회된 슬롯 정보: ${JSON.stringify(slotRows)}`);
        if (slotRows.length === 0) {
            console.debug(`슬롯을 찾을 수 없음: slot=${slot}`);
            return res.status(404).json({ message: '슬롯을 찾을 수 없습니다.' });
        }
        const equipment_slot_id = slotRows[0].id;
        console.debug(`equipment_slot_id: ${equipment_slot_id}`);

        const [equippedItemRows] = await pool.query(
            'SELECT char_equip_id FROM character_equipped_items WHERE character_id = ? AND equipment_slot_id = ?',
            [characterId, equipment_slot_id]
        );
        console.debug(`조회된 장착 아이템 정보: ${JSON.stringify(equippedItemRows)}`);
        if (equippedItemRows.length === 0) {
            console.debug(`해당 슬롯에 장착된 아이템이 없음: characterId=${characterId}, slot=${slot}`);
            return res.status(404).json({ message: '해당 슬롯에 장착된 아이템이 없습니다.' });
        }
        const char_equip_id = equippedItemRows[0].char_equip_id;
        console.debug(`char_equip_id: ${char_equip_id}`);

        // 보석 존재 여부 확인
        const [gemExists] = await pool.query('SELECT id FROM gems WHERE id = ?', [gemId]);
        console.debug(`보석 존재 여부 확인 결과: ${JSON.stringify(gemExists)}`);
        if (gemExists.length === 0) {
            console.debug(`보석을 찾을 수 없음: gemId=${gemId}`);
            return res.status(404).json({ message: '보석을 찾을 수 없습니다.' });
        }

        // 이미 장착된 보석인지 확인
        const [existingGem] = await pool.query(
            'SELECT * FROM equipment_gem_sockets WHERE char_equip_id = ? AND gem_id = ?',
            [char_equip_id, gemId]
        );
        console.debug(`기존 보석 장착 여부: ${JSON.stringify(existingGem)}`);
        if (existingGem.length > 0) {
            console.debug(`이미 장착된 보석: gemId=${gemId}`);
            return res.status(409).json({ message: '이미 장착된 보석입니다.' });
        }

        // 보석 소켓 제한 검증 (예시: 장비당 보석 3개로 제한)
        const [currentGems] = await pool.query(
            'SELECT COUNT(*) as count FROM equipment_gem_sockets WHERE char_equip_id = ?',
            [char_equip_id]
        );
        console.debug(`현재 장착된 보석 개수: ${currentGems[0].count}`);
        // 실제 게임 규칙에 따라 장비가 가질 수 있는 보석 소켓 수를 확인하는 로직 추가 필요
        // 여기서는 예시로 3개로 제한한다고 가정
        if (currentGems[0].count >= 3) { // 이 값은 실제 게임 규칙에 따라 달라져야 합니다.
            console.debug('보석 소켓이 가득 찼습니다.');
            return res.status(400).json({ message: '이 장비에는 더 이상 보석을 장착할 수 없습니다.' });
        }

        const [insertResult] = await pool.query(
            'INSERT INTO equipment_gem_sockets (char_equip_id, gem_id) VALUES (?, ?)',
            [char_equip_id, gemId]
        );
        console.debug(`보석 삽입 결과: ${JSON.stringify(insertResult)}`);

        // 업데이트된 슬롯 정보 반환 (보석 목록 포함)
        const [updatedEquippedItemInfo] = await pool.query(
            `SELECT
                es.slot_name AS slot,
                e.id AS equipment_id,
                e.name AS equipment_name,
                et.name AS equipment_type_name,
                cei.char_equip_id
            FROM character_equipped_items cei
            JOIN equipment_slots es ON cei.equipment_slot_id = es.id
            JOIN equipments e ON cei.equipment_id = e.id
            JOIN equipment_types et ON e.equipment_type_id = et.id
            WHERE cei.char_equip_id = ?`,
            [char_equip_id]
        );
        console.debug(`업데이트된 장비 정보: ${JSON.stringify(updatedEquippedItemInfo)}`);

        const [runesOnItem] = await pool.query('SELECT r.id, r.name FROM equipment_rune_sockets ers JOIN runes r ON ers.rune_id = r.id WHERE ers.char_equip_id = ?', [char_equip_id]);
        const [gemsOnItem] = await pool.query('SELECT g.id, g.name FROM equipment_gem_sockets egs JOIN gems g ON egs.gem_id = g.id WHERE egs.char_equip_id = ?', [char_equip_id]);

        res.json({
            message: '보석 장착 성공',
            slot: updatedEquippedItemInfo[0].slot,
            slotName: SLOT_NAME_MAP[updatedEquippedItemInfo[0].slot] || updatedEquippedItemInfo[0].slot,
            equipment: {
                id: updatedEquippedItemInfo[0].equipment_id,
                name: updatedEquippedItemInfo[0].equipment_name,
                type: updatedEquippedItemInfo[0].equipment_type_name
            },
            runes: runesOnItem,
            gems: gemsOnItem
        });
        console.debug('addGemToEquipment 함수 종료 (성공)');

    } catch (err) {
        console.error('보석 삽입 오류:', err);
        console.debug('addGemToEquipment 함수 종료 (오류)');
        res.status(500).json({ message: '보석 삽입에 실패했습니다.' });
    }
};

// 보석 제거 (새로 추가)
const removeGemFromEquipment = async (req, res, dbManager) => {
    console.debug('removeGemFromEquipment 함수 진입');
    const { characterId, slot, gemId } = req.params; // gemId는 URL 파라미터로 가정
    console.debug(`입력값 - characterId: ${characterId}, slot: ${slot}, gemId: ${gemId}`);

    if (!characterId || !slot || !gemId) {
        console.debug('유효성 검사 실패: 캐릭터 ID, 슬롯, 보석 ID는 필수입니다.');
        return res.status(400).json({ message: '캐릭터 ID, 슬롯, 보석 ID는 필수입니다.' });
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');

        const [slotRows] = await pool.query('SELECT id FROM equipment_slots WHERE slot_name = ?', [slot]);
        console.debug(`조회된 슬롯 정보: ${JSON.stringify(slotRows)}`);
        if (slotRows.length === 0) {
            console.debug(`슬롯을 찾을 수 없음: slot=${slot}`);
            return res.status(404).json({ message: '슬롯을 찾을 수 없습니다.' });
        }
        const equipment_slot_id = slotRows[0].id;
        console.debug(`equipment_slot_id: ${equipment_slot_id}`);

        const [equippedItemRows] = await pool.query(
            'SELECT char_equip_id FROM character_equipped_items WHERE character_id = ? AND equipment_slot_id = ?',
            [characterId, equipment_slot_id]
        );
        console.debug(`조회된 장착 아이템 정보: ${JSON.stringify(equippedItemRows)}`);
        if (equippedItemRows.length === 0) {
            console.debug(`해당 슬롯에 장착된 아이템이 없음: characterId=${characterId}, slot=${slot}`);
            return res.status(404).json({ message: '해당 슬롯에 장착된 아이템이 없습니다.' });
        }
        const char_equip_id = equippedItemRows[0].char_equip_id;
        console.debug(`char_equip_id: ${char_equip_id}`);

        const [deleteResult] = await pool.query(
            'DELETE FROM equipment_gem_sockets WHERE char_equip_id = ? AND gem_id = ?',
            [char_equip_id, gemId]
        );
        console.debug(`보석 제거 결과: ${JSON.stringify(deleteResult)}`);

        if (deleteResult.affectedRows === 0) {
            console.debug(`해당 보석을 찾을 수 없거나 이미 제거됨: char_equip_id=${char_equip_id}, gemId=${gemId}`);
            return res.status(404).json({ message: '해당 보석을 찾을 수 없거나 이미 제거되었습니다.' });
        }

        // 업데이트된 슬롯 정보 반환 (보석 목록 포함)
        const [updatedEquippedItemInfo] = await pool.query(
            `SELECT
                es.slot_name AS slot,
                e.id AS equipment_id,
                e.name AS equipment_name,
                et.name AS equipment_type_name,
                cei.char_equip_id
            FROM character_equipped_items cei
            JOIN equipment_slots es ON cei.equipment_slot_id = es.id
            JOIN equipments e ON cei.equipment_id = e.id
            JOIN equipment_types et ON e.equipment_type_id = et.id
            WHERE cei.char_equip_id = ?`,
            [char_equip_id]
        );
        console.debug(`업데이트된 장비 정보: ${JSON.stringify(updatedEquippedItemInfo)}`);

        const [runesOnItem] = await pool.query('SELECT r.id, r.name FROM equipment_rune_sockets ers JOIN runes r ON ers.rune_id = r.id WHERE ers.char_equip_id = ?', [char_equip_id]);
        const [gemsOnItem] = await pool.query('SELECT g.id, g.name FROM equipment_gem_sockets egs JOIN gems g ON egs.gem_id = g.id WHERE egs.char_equip_id = ?', [char_equip_id]);

        res.json({
            message: '보석 제거 성공',
            slot: updatedEquippedItemInfo[0].slot,
            slotName: SLOT_NAME_MAP[updatedEquippedItemInfo[0].slot] || updatedEquippedItemInfo[0].slot,
            equipment: {
                id: updatedEquippedItemInfo[0].equipment_id,
                name: updatedEquippedItemInfo[0].equipment_name,
                type: updatedEquippedItemInfo[0].equipment_type_name
            },
            runes: runesOnItem,
            gems: gemsOnItem
        });
        console.debug('removeGemFromEquipment 함수 종료 (성공)');

    } catch (err) {
        console.error('보석 제거 오류:', err);
        console.debug('removeGemFromEquipment 함수 종료 (오류)');
        res.status(500).json({ message: '보석 제거에 실패했습니다.' });
    }
};

module.exports = {
    getGrades,
    getEquipmentTypes,
    getEquipmentParts,
    getAllEquipments,
    getEquipmentById,
    getAllRunes,
    getRuneById,
    getAllGems,
    getGemById,
    getEquipmentSlots,
    getCharacterEquipment,
    equipItemInSlot,
    addRuneToEquipment,
    removeRuneFromEquipment,
    addGemToEquipment,
    removeGemFromEquipment
}; 