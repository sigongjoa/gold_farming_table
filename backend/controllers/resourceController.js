const { getPool } = require('../utils/dbManager');

// 은동전 및 마족 공물 자동 충전 로직
const updateAndGetResources = async (user_id, pool) => {
    const [userRows] = await pool.query('SELECT silver_coins, silver_coins_last_recharge_at, demon_tribute, demon_tribute_last_recharge_at FROM users WHERE id = ?', [user_id]);

    if (userRows.length === 0) {
        throw new Error('사용자를 찾을 수 없습니다.');
    }

    let { silver_coins, silver_coins_last_recharge_at, demon_tribute, demon_tribute_last_recharge_at } = userRows[0];

    const now = new Date();

    // 은동전 자동 충전 계산
    const silverCoinRechargeRatePerMin = 1 / 30; // 30분마다 1개
    const silverCoinMaxCapacity = 100;
    const silverCoinsLastRechargeDate = new Date(silver_coins_last_recharge_at);
    const silverCoinsMinutesElapsed = (now.getTime() - silverCoinsLastRechargeDate.getTime()) / (1000 * 60);

    let rechargedSilverCoins = Math.floor(silverCoinsMinutesElapsed * silverCoinRechargeRatePerMin);
    let newSilverCoins = Math.min(silver_coins + rechargedSilverCoins, silverCoinMaxCapacity);
    
    // 퀘스트 보상 등으로 100개 이상 초과 보유 가능하나, 자동 충전은 100개 미만일 때만 작동
    if (silver_coins < silverCoinMaxCapacity) {
        newSilverCoins = Math.min(silver_coins + rechargedSilverCoins, silverCoinMaxCapacity);
    } else {
        newSilverCoins = silver_coins;
    }


    let newSilverCoinsLastRechargeAt = silver_coins_last_recharge_at;
    if (newSilverCoins > silver_coins) { // 실제로 충전이 발생했으면
        // 자동 충전은 100개 미만일 때만 작동하며, 충전된 만큼 시간을 업데이트
        // 만약 맥스에 도달했으면, 맥스에 도달한 시점으로 시간을 맞추거나, 아니면 새로운 시간을 충전된 시간으로 업데이트
        if (newSilverCoins === silverCoinMaxCapacity) {
            const minutesToMax = (silverCoinMaxCapacity - silver_coins) / silverCoinRechargeRatePerMin;
            newSilverCoinsLastRechargeAt = new Date(silverCoinsLastRechargeDate.getTime() + minutesToMax * 60 * 1000);
        } else {
            newSilverCoinsLastRechargeAt = now;
        }
    }


    // 마족 공물 자동 충전 계산
    const demonTributeRechargeRatePerMin = 1 / (12 * 60); // 12시간마다 1개
    const demonTributeMaxCapacity = 2;
    const demonTributeLastRechargeDate = new Date(demon_tribute_last_recharge_at);
    const demonTributeMinutesElapsed = (now.getTime() - demonTributeLastRechargeDate.getTime()) / (1000 * 60);

    let rechargedDemonTribute = Math.floor(demonTributeMinutesElapsed * demonTributeRechargeRatePerMin);
    let newDemonTribute = Math.min(demon_tribute + rechargedDemonTribute, demonTributeMaxCapacity);

    // 퀘스트 보상 등으로 100개 이상 초과 보유 가능하나, 자동 충전은 100개 미만일 때만 작동
    if (demon_tribute < demonTributeMaxCapacity) {
        newDemonTribute = Math.min(demon_tribute + rechargedDemonTribute, demonTributeMaxCapacity);
    } else {
        newDemonTribute = demon_tribute;
    }

    let newDemonTributeLastRechargeAt = demon_tribute_last_recharge_at;
    if (newDemonTribute > demon_tribute) { // 실제로 충전이 발생했으면
        // 자동 충전은 100개 미만일 때만 작동하며, 충전된 만큼 시간을 업데이트
        // 만약 맥스에 도달했으면, 맥스에 도달한 시점으로 시간을 맞추거나, 아니면 새로운 시간을 충전된 시간으로 업데이트
        if (newDemonTribute === demonTributeMaxCapacity) {
            const minutesToMax = (demonTributeMaxCapacity - demon_tribute) / demonTributeRechargeRatePerMin;
            newDemonTributeLastRechargeAt = new Date(demonTributeLastRechargeDate.getTime() + minutesToMax * 60 * 1000);
        } else {
            newDemonTributeLastRechargeAt = now;
        }
    }

    // 데이터베이스 업데이트
    await pool.query(
        'UPDATE users SET silver_coins = ?, silver_coins_last_recharge_at = ?, demon_tribute = ?, demon_tribute_last_recharge_at = ? WHERE id = ?',
        [newSilverCoins, newSilverCoinsLastRechargeAt, newDemonTribute, newDemonTributeLastRechargeAt, user_id]
    );

    return {
        silver_coins: newSilverCoins,
        silver_coins_last_recharge_at: newSilverCoinsLastRechargeAt,
        demon_tribute: newDemonTribute,
        demon_tribute_last_recharge_at: newDemonTributeLastRechargeAt,
        silverCoinMaxCapacity,
        demonTributeMaxCapacity
    };
};

const getUserResources = async (req, res, dbManager) => {
    const { user_id } = req.params;
    try {
        const pool = dbManager.getPool();
        const resources = await updateAndGetResources(user_id, pool);
        res.json(resources);
    } catch (err) {
        console.error('사용자 재화 조회 오류:', err);
        res.status(500).json({ message: '사용자 재화를 불러오는 데 실패했습니다.' });
    }
};

const updateUserResources = async (req, res, dbManager) => {
    const { user_id } = req.params;
    const { silver_coins_change, demon_tribute_change } = req.body; // 변경량

    try {
        const pool = dbManager.getPool();
        let query = 'UPDATE users SET ';
        const params = [];
        const updates = [];

        if (silver_coins_change !== undefined) {
            updates.push('silver_coins = silver_coins + ?');
            params.push(silver_coins_change);
        }
        if (demon_tribute_change !== undefined) {
            updates.push('demon_tribute = demon_tribute + ?');
            params.push(demon_tribute_change);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: '업데이트할 재화가 없습니다.' });
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(user_id);

        await pool.query(query, params);

        // 업데이트 후 최신 재화 상태 반환 (자동 충전 포함)
        const updatedResources = await updateAndGetResources(user_id, pool);
        res.json({ message: '재화 업데이트 성공', resources: updatedResources });

    } catch (err) {
        console.error('재화 업데이트 오류:', err);
        res.status(500).json({ message: '재화 업데이트에 실패했습니다.' });
    }
};


module.exports = {
    getUserResources,
    updateUserResources
}; 