const { getPool } = require('../utils/dbManager');

// 은동전 및 마족 공물 자동 충전 로직
const updateAndGetResources = async (user_id, pool) => {
    console.debug('updateAndGetResources 함수 진입');
    console.debug(`입력값 - user_id: ${user_id}`);
    const [userRows] = await pool.query('SELECT silver_coins, silver_coins_last_recharge_at, demon_tribute, demon_tribute_last_recharge_at FROM users WHERE id = ?', [user_id]);
    console.debug(`사용자 조회 결과: ${JSON.stringify(userRows)}`);

    if (userRows.length === 0) {
        console.debug(`사용자를 찾을 수 없음: user_id=${user_id}`);
        throw new Error('사용자를 찾을 수 없습니다.');
    }

    let { silver_coins, silver_coins_last_recharge_at, demon_tribute, demon_tribute_last_recharge_at } = userRows[0];
    console.debug(`현재 재화 상태 - silver_coins: ${silver_coins}, silver_coins_last_recharge_at: ${silver_coins_last_recharge_at}, demon_tribute: ${demon_tribute}, demon_tribute_last_recharge_at: ${demon_tribute_last_recharge_at}`);

    const now = new Date();
    console.debug(`현재 시간: ${now.toISOString()}`);

    // 은동전 자동 충전 계산
    const silverCoinRechargeRatePerMin = 1 / 30; // 30분마다 1개
    const silverCoinMaxCapacity = 100; // 은동전 최대 100개
    const silverCoinsLastRechargeDate = new Date(silver_coins_last_recharge_at);
    const silverCoinsMinutesElapsed = (now.getTime() - silverCoinsLastRechargeDate.getTime()) / (1000 * 60);
    console.debug(`은동전 - 마지막 충전 이후 경과 시간 (분): ${silverCoinsMinutesElapsed}`);

    let rechargedSilverCoins = Math.floor(silverCoinsMinutesElapsed * silverCoinRechargeRatePerMin);
    let newSilverCoins = Math.min(silver_coins + rechargedSilverCoins, silverCoinMaxCapacity);
    console.debug(`은동전 - 충전될 양: ${rechargedSilverCoins}, 예상 새 수량 (최대치 적용 전): ${silver_coins + rechargedSilverCoins}, 예상 새 수량 (최대치 적용 후): ${newSilverCoins}`);
    
    // 퀘스트 보상 등으로 100개 이상 초과 보유 가능하나, 자동 충전은 100개 미만일 때만 작동
    if (silver_coins < silverCoinMaxCapacity) {
        newSilverCoins = Math.min(silver_coins + rechargedSilverCoins, silverCoinMaxCapacity);
        console.debug(`은동전 - 현재 수량(${silver_coins})이 최대치(${silverCoinMaxCapacity}) 미만이므로 자동 충전 적용, 새 수량: ${newSilverCoins}`);
    } else {
        newSilverCoins = silver_coins;
        console.debug(`은동전 - 현재 수량(${silver_coins})이 최대치(${silverCoinMaxCapacity}) 이상이므로 자동 충전 미적용, 새 수량: ${newSilverCoins}`);
    }


    let newSilverCoinsLastRechargeAt = silver_coins_last_recharge_at;
    if (newSilverCoins > silver_coins) { // 실제로 충전이 발생했으면
        console.debug('은동전이 실제로 충전되었습니다.');
        // 자동 충전은 100개 미만일 때만 작동하며, 충전된 만큼 시간을 업데이트
        // 만약 맥스에 도달했으면, 맥스에 도달한 시점으로 시간을 맞추거나, 아니면 새로운 시간을 충전된 시간으로 업데이트
        if (newSilverCoins === silverCoinMaxCapacity) {
            const minutesToMax = (silverCoinMaxCapacity - silver_coins) / silverCoinRechargeRatePerMin;
            newSilverCoinsLastRechargeAt = new Date(silverCoinsLastRechargeDate.getTime() + minutesToMax * 60 * 1000);
            console.debug(`은동전이 최대치에 도달, 마지막 충전 시간 조정: ${newSilverCoinsLastRechargeAt.toISOString()}`);
        } else {
            newSilverCoinsLastRechargeAt = now;
            console.debug(`은동전이 최대치에 도달하지 않음, 마지막 충전 시간 현재 시간으로 업데이트: ${newSilverCoinsLastRechargeAt.toISOString()}`);
        }
    }


    // 마족 공물 자동 충전 계산
    const demonTributeRechargeRatePerMin = 1 / (12 * 60); // 12시간마다 1개
    const demonTributeMaxCapacity = 10; // 마족공물 최대 10개 (사용자 요청에 따라 수정)
    const demonTributeLastRechargeDate = new Date(demon_tribute_last_recharge_at);
    const demonTributeMinutesElapsed = (now.getTime() - demonTributeLastRechargeDate.getTime()) / (1000 * 60);
    console.debug(`마족 공물 - 마지막 충전 이후 경과 시간 (분): ${demonTributeMinutesElapsed}`);

    let rechargedDemonTribute = Math.floor(demonTributeMinutesElapsed * demonTributeRechargeRatePerMin);
    let newDemonTribute = Math.min(demon_tribute + rechargedDemonTribute, demonTributeMaxCapacity);
    console.debug(`마족 공물 - 충전될 양: ${rechargedDemonTribute}, 예상 새 수량 (최대치 적용 전): ${demon_tribute + rechargedDemonTribute}, 예상 새 수량 (최대치 적용 후): ${newDemonTribute}`);

    // 퀘스트 보상 등으로 100개 이상 초과 보유 가능하나, 자동 충전은 100개 미만일 때만 작동
    if (demon_tribute < demonTributeMaxCapacity) {
        newDemonTribute = Math.min(demon_tribute + rechargedDemonTribute, demonTributeMaxCapacity);
        console.debug(`마족 공물 - 현재 수량(${demon_tribute})이 최대치(${demonTributeMaxCapacity}) 미만이므로 자동 충전 적용, 새 수량: ${newDemonTribute}`);
    } else {
        newDemonTribute = demon_tribute;
        console.debug(`마족 공물 - 현재 수량(${demon_tribute})이 최대치(${demonTributeMaxCapacity}) 이상이므로 자동 충전 미적용, 새 수량: ${newDemonTribute}`);
    }

    let newDemonTributeLastRechargeAt = demon_tribute_last_recharge_at;
    if (newDemonTribute > demon_tribute) { // 실제로 충전이 발생했으면
        console.debug('마족 공물이 실제로 충전되었습니다.');
        // 자동 충전은 100개 미만일 때만 작동하며, 충전된 만큼 시간을 업데이트
        // 만약 맥스에 도달했으면, 맥스에 도달한 시점으로 시간을 맞추거나, 아니면 새로운 시간을 충전된 시간으로 업데이트
        if (newDemonTribute === demonTributeMaxCapacity) {
            const minutesToMax = (demonTributeMaxCapacity - demon_tribute) / demonTributeRechargeRatePerMin;
            newDemonTributeLastRechargeAt = new Date(demonTributeLastRechargeDate.getTime() + minutesToMax * 60 * 1000);
            console.debug(`마족 공물이 최대치에 도달, 마지막 충전 시간 조정: ${newDemonTributeLastRechargeAt.toISOString()}`);
        } else {
            newDemonTributeLastRechargeAt = now;
            console.debug(`마족 공물이 최대치에 도달하지 않음, 마지막 충전 시간 현재 시간으로 업데이트: ${newDemonTributeLastRechargeAt.toISOString()}`);
        }
    }

    // 데이터베이스 업데이트
    await pool.query(
        'UPDATE users SET silver_coins = ?, silver_coins_last_recharge_at = ?, demon_tribute = ?, demon_tribute_last_recharge_at = ? WHERE id = ?',
        [newSilverCoins, newSilverCoinsLastRechargeAt, newDemonTribute, newDemonTributeLastRechargeAt, user_id]
    );
    console.debug('사용자 재화 데이터베이스 업데이트 완료');

    const resources = {
        silver_coins: newSilverCoins,
        silver_coins_last_recharge_at: newSilverCoinsLastRechargeAt,
        demon_tribute: newDemonTribute,
        demon_tribute_last_recharge_at: newDemonTributeLastRechargeAt,
        silverCoinMaxCapacity,
        demonTributeMaxCapacity
    };
    console.debug(`반환될 재화 정보: ${JSON.stringify(resources)}`);
    console.debug('updateAndGetResources 함수 종료');
    return resources;
};

const getUserResources = async (req, res, dbManager) => {
    console.debug('getUserResources 함수 진입');
    const { user_id } = req.params;
    console.debug(`입력값 - user_id: ${user_id}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const resources = await updateAndGetResources(user_id, pool);
        console.debug(`조회된 사용자 재화: ${JSON.stringify(resources)}`);
        res.json(resources);
        console.debug('getUserResources 함수 종료 (성공)');
    } catch (err) {
        console.error('사용자 재화 조회 오류:', err);
        console.debug('getUserResources 함수 종료 (오류)');
        res.status(500).json({ message: '사용자 재화를 불러오는 데 실패했습니다.' });
    }
};

const updateUserResources = async (req, res, dbManager) => {
    console.debug('updateUserResources 함수 진입');
    const { user_id } = req.params;
    const { silver_coins_change, demon_tribute_change } = req.body; // 변경량
    console.debug(`입력값 - user_id: ${user_id}, silver_coins_change: ${silver_coins_change}, demon_tribute_change: ${demon_tribute_change}`);

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        let query = 'UPDATE users SET ';
        const params = [];
        const updates = [];
        console.debug('업데이트 쿼리 빌드 시작');

        if (silver_coins_change !== undefined) {
            updates.push('silver_coins = silver_coins + ?');
            params.push(silver_coins_change);
            console.debug(`은동전 변경량 추가: ${silver_coins_change}`);
        }
        if (demon_tribute_change !== undefined) {
            updates.push('demon_tribute = demon_tribute + ?');
            params.push(demon_tribute_change);
            console.debug(`마족 공물 변경량 추가: ${demon_tribute_change}`);
        }

        if (updates.length === 0) {
            console.debug('업데이트할 재화가 없습니다.');
            return res.status(400).json({ message: '업데이트할 재화가 없습니다.' });
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(user_id);
        console.debug(`최종 업데이트 쿼리: ${query}, 파라미터: ${JSON.stringify(params)}`);

        await pool.query(query, params);
        console.debug('재화 업데이트 쿼리 실행 완료');

        // 업데이트 후 최신 재화 상태 반환 (자동 충전 포함)
        const updatedResources = await updateAndGetResources(user_id, pool);
        console.debug(`업데이트 후 재화 상태: ${JSON.stringify(updatedResources)}`);
        res.json({ message: '재화 업데이트 성공', resources: updatedResources });
        console.debug('updateUserResources 함수 종료 (성공)');

    } catch (err) {
        console.error('재화 업데이트 오류:', err);
        console.debug('updateUserResources 함수 종료 (오류)');
        res.status(500).json({ message: '재화 업데이트에 실패했습니다.' });
    }
};


module.exports = {
    getUserResources,
    updateUserResources
};