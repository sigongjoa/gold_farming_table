async function getDailyQuests(req, res, dbManager) {
  console.debug('getDailyQuests 함수 진입');
  const user_id = req.params.user_id;
  console.debug(`입력값 - user_id: ${user_id}`);
  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    const [rows] = await pool.query('SELECT * FROM daily_quests WHERE user_id = ?', [user_id]);
    console.debug(`조회된 일일 숙제: ${JSON.stringify(rows)}`);
    res.json(rows);
    console.debug('getDailyQuests 함수 종료 (성공)');
  } catch (error) {
    console.error('일일 숙제를 가져오는 중 오류 발생:', error);
    console.debug('getDailyQuests 함수 종료 (오류)');
    res.status(500).send('서버 오류');
  }
}

async function completeDailyQuest(req, res, dbManager) {
  console.debug('completeDailyQuest 함수 진입');
  const user_id = req.params.user_id;
  const quest_id = req.params.quest_id;
  const current_date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  console.debug(`입력값 - user_id: ${user_id}, quest_id: ${quest_id}, current_date: ${current_date}`);

  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    const [result] = await pool.query(
      'UPDATE daily_quests SET is_completed = TRUE, last_completed_date = ? WHERE id = ? AND user_id = ?',
      [current_date, quest_id, user_id]
    );
    console.debug(`일일 숙제 완료 업데이트 결과: ${JSON.stringify(result)}`);
    if (result.affectedRows === 0) {
      console.debug(`일일 숙제를 찾을 수 없거나 이미 완료됨: quest_id=${quest_id}, user_id=${user_id}`);
      return res.status(404).send('숙제를 찾을 수 없거나 이미 완료되었습니다.');
    }
    res.status(200).send('일일 숙제가 완료되었습니다.');
    console.debug('completeDailyQuest 함수 종료 (성공)');
  } catch (error) {
    console.error('일일 숙제를 완료하는 중 오류 발생:', error);
    console.debug('completeDailyQuest 함수 종료 (오류)');
    res.status(500).send('서버 오류');
  }
}

async function resetDailyQuests(req, res, dbManager) {
    console.debug('resetDailyQuests 함수 진입');
    const user_id = req.params.user_id;
    console.debug(`입력값 - user_id: ${user_id}`);
    //const today = new Date().toISOString().slice(0, 10);

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        // 어제 이전에 완료된 숙제만 리셋합니다.
        const [result] = await pool.query(
            'UPDATE daily_quests SET is_completed = FALSE, last_completed_date = NULL WHERE user_id = ?',
            [user_id]
        );
        console.debug(`일일 숙제 리셋 결과: ${JSON.stringify(result)}`);
        // 또는 단순히 모든 숙제를 리셋하려면 다음 쿼리를 사용합니다.
        // await pool.query('UPDATE daily_quests SET is_completed = FALSE, last_completed_date = NULL WHERE user_id = ?', [user_id]);

        res.status(200).send('일일 숙제가 성공적으로 초기화되었습니다.');
        console.debug('resetDailyQuests 함수 종료 (성공)');
    } catch (error) {
        console.error('일일 숙제 초기화 중 오류 발생:', error);
        console.debug('resetDailyQuests 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

async function getWeeklyQuests(req, res, dbManager) {
  console.debug('getWeeklyQuests 함수 진입');
  const user_id = req.params.user_id;
  console.debug(`입력값 - user_id: ${user_id}`);
  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    const [rows] = await pool.query('SELECT * FROM weekly_quests WHERE user_id = ?', [user_id]);
    console.debug(`조회된 주간 숙제: ${JSON.stringify(rows)}`);
    res.json(rows);
    console.debug('getWeeklyQuests 함수 종료 (성공)');
  } catch (error) {
    console.error('주간 숙제를 가져오는 중 오류 발생:', error);
    console.debug('getWeeklyQuests 함수 종료 (오류)');
    res.status(500).send('서버 오류');
  }
}

async function completeWeeklyQuest(req, res, dbManager) {
  console.debug('completeWeeklyQuest 함수 진입');
  const user_id = req.params.user_id;
  const quest_id = req.params.quest_id;
  // 현재 주를 나타내는 값을 계산 (예: 해당 주의 첫 번째 날)
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); // 월요일로 설정
  const current_week = d.toISOString().slice(0, 10);
  console.debug(`입력값 - user_id: ${user_id}, quest_id: ${quest_id}, current_week: ${current_week}`);

  try {
    const pool = dbManager.getPool();
    console.debug('DB 풀 가져오기 성공');
    const [result] = await pool.query(
      'UPDATE weekly_quests SET is_completed = TRUE, last_completed_week = ? WHERE id = ? AND user_id = ?',
      [current_week, quest_id, user_id]
    );
    console.debug(`주간 숙제 완료 업데이트 결과: ${JSON.stringify(result)}`);
    if (result.affectedRows === 0) {
      console.debug(`주간 숙제를 찾을 수 없거나 이미 완료됨: quest_id=${quest_id}, user_id=${user_id}`);
      return res.status(404).send('숙제를 찾을 수 없거나 이미 완료되었습니다.');
    }
    res.status(200).send('주간 숙제가 완료되었습니다.');
    console.debug('completeWeeklyQuest 함수 종료 (성공)');
  } catch (error) {
    console.error('주간 숙제를 완료하는 중 오류 발생:', error);
    console.debug('completeWeeklyQuest 함수 종료 (오류)');
    res.status(500).send('서버 오류');
  }
}

async function resetWeeklyQuests(req, res, dbManager) {
    console.debug('resetWeeklyQuests 함수 진입');
    const user_id = req.params.user_id;
    console.debug(`입력값 - user_id: ${user_id}`);
    //const d = new Date();
    //d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); // 현재 주의 월요일
    //const currentWeekStart = d.toISOString().slice(0, 10);

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        // 지난 주 이전에 완료된 숙제만 리셋합니다.
        const [result] = await pool.query(
            'UPDATE weekly_quests SET is_completed = FALSE, last_completed_week = NULL WHERE user_id = ?',
            [user_id]
        );
        console.debug(`주간 숙제 리셋 결과: ${JSON.stringify(result)}`);
        // 또는 단순히 모든 숙제를 리셋하려면 다음 쿼리를 사용합니다.
        // await pool.query('UPDATE weekly_quests SET is_completed = FALSE, last_completed_week = NULL WHERE user_id = ?', [user_id]);

        res.status(200).send('주간 숙제가 성공적으로 초기화되었습니다.');
        console.debug('resetWeeklyQuests 함수 종료 (성공)');
    } catch (error) {
        console.error('주간 숙제 초기화 중 오류 발생:', error);
        console.debug('resetWeeklyQuests 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

// 새로운 일일 숙제 추가 (필요시)
async function addDailyQuest(req, res, dbManager) {
    console.debug('addDailyQuest 함수 진입');
    const { user_id } = req.params;
    const { quest_name, quest_description, quest_category } = req.body;
    console.debug(`입력값 - user_id: ${user_id}, quest_name: ${quest_name}, quest_description: ${quest_description}, quest_category: ${quest_category}`);

    if (!quest_name || !user_id) {
        console.debug('유효성 검사 실패: 퀘스트 이름 또는 사용자 ID가 필수입니다.');
        return res.status(400).send('퀘스트 이름과 사용자 ID는 필수입니다.');
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [result] = await pool.query(
            'INSERT INTO daily_quests (user_id, quest_name, quest_description, quest_category) VALUES (?, ?, ?, ?)',
            [user_id, quest_name, quest_description, quest_category]
        );
        console.debug(`일일 숙제 추가 결과: ${JSON.stringify(result)}`);
        res.status(201).json({ message: '일일 숙제가 성공적으로 추가되었습니다.', questId: result.insertId });
        console.debug('addDailyQuest 함수 종료 (성공)');
    } catch (error) {
        console.error('일일 숙제 추가 중 오류 발생:', error);
        console.debug('addDailyQuest 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

// 일일 숙제 수정
async function updateDailyQuest(req, res, dbManager) {
    console.debug('updateDailyQuest 함수 진입');
    const { user_id, quest_id } = req.params;
    const { quest_name, quest_description, quest_category } = req.body;
    console.debug(`입력값 - user_id: ${user_id}, quest_id: ${quest_id}, quest_name: ${quest_name}, quest_description: ${quest_description}, quest_category: ${quest_category}`);

    if (!quest_name) {
        console.debug('유효성 검사 실패: 퀘스트 이름이 필수입니다.');
        return res.status(400).send('퀘스트 이름은 필수입니다.');
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [result] = await pool.query(
            'UPDATE daily_quests SET quest_name = ?, quest_description = ?, quest_category = ? WHERE id = ? AND user_id = ?',
            [quest_name, quest_description, quest_category, quest_id, user_id]
        );
        console.debug(`일일 숙제 수정 결과: ${JSON.stringify(result)}`);
        if (result.affectedRows === 0) {
            console.debug(`일일 숙제를 찾을 수 없거나 수정 권한이 없음: quest_id=${quest_id}, user_id=${user_id}`);
            return res.status(404).send('일일 숙제를 찾을 수 없거나 수정 권한이 없습니다.');
        }
        res.status(200).send('일일 숙제가 성공적으로 수정되었습니다.');
        console.debug('updateDailyQuest 함수 종료 (성공)');
    } catch (error) {
        console.error('일일 숙제 수정 중 오류 발생:', error);
        console.debug('updateDailyQuest 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

// 일일 숙제 삭제
async function deleteDailyQuest(req, res, dbManager) {
    console.debug('deleteDailyQuest 함수 진입');
    const { user_id, quest_id } = req.params;
    console.debug(`입력값 - user_id: ${user_id}, quest_id: ${quest_id}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [result] = await pool.query(
            'DELETE FROM daily_quests WHERE id = ? AND user_id = ?',
            [quest_id, user_id]
        );
        console.debug(`일일 숙제 삭제 결과: ${JSON.stringify(result)}`);
        if (result.affectedRows === 0) {
            console.debug(`일일 숙제를 찾을 수 없거나 삭제 권한이 없음: quest_id=${quest_id}, user_id=${user_id}`);
            return res.status(404).send('일일 숙제를 찾을 수 없거나 삭제 권한이 없습니다.');
        }
        res.status(200).send('일일 숙제가 성공적으로 삭제되었습니다.');
        console.debug('deleteDailyQuest 함수 종료 (성공)');
    } catch (error) {
        console.error('일일 숙제 삭제 중 오류 발생:', error);
        console.debug('deleteDailyQuest 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

// 새로운 주간 숙제 추가 (필요시)
async function addWeeklyQuest(req, res, dbManager) {
    console.debug('addWeeklyQuest 함수 진입');
    const { user_id } = req.params;
    const { quest_name, quest_description, quest_category } = req.body;
    console.debug(`입력값 - user_id: ${user_id}, quest_name: ${quest_name}, quest_description: ${quest_description}, quest_category: ${quest_category}`);

    if (!quest_name || !user_id) {
        console.debug('유효성 검사 실패: 퀘스트 이름 또는 사용자 ID가 필수입니다.');
        return res.status(400).send('퀘스트 이름과 사용자 ID는 필수입니다.');
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [result] = await pool.query(
            'INSERT INTO weekly_quests (user_id, quest_name, quest_description, quest_category) VALUES (?, ?, ?, ?)',
            [user_id, quest_name, quest_description, quest_category]
        );
        console.debug(`주간 숙제 추가 결과: ${JSON.stringify(result)}`);
        res.status(201).json({ message: '주간 숙제가 성공적으로 추가되었습니다.', questId: result.insertId });
        console.debug('addWeeklyQuest 함수 종료 (성공)');
    } catch (error) {
        console.error('주간 숙제 추가 중 오류 발생:', error);
        console.debug('addWeeklyQuest 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

// 주간 숙제 수정
async function updateWeeklyQuest(req, res, dbManager) {
    console.debug('updateWeeklyQuest 함수 진입');
    const { user_id, quest_id } = req.params;
    const { quest_name, quest_description, quest_category } = req.body;
    console.debug(`입력값 - user_id: ${user_id}, quest_id: ${quest_id}, quest_name: ${quest_name}, quest_description: ${quest_description}, quest_category: ${quest_category}`);

    if (!quest_name) {
        console.debug('유효성 검사 실패: 퀘스트 이름이 필수입니다.');
        return res.status(400).send('퀘스트 이름은 필수입니다.');
    }

    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [result] = await pool.query(
            'UPDATE weekly_quests SET quest_name = ?, quest_description = ?, quest_category = ? WHERE id = ? AND user_id = ?',
            [quest_name, quest_description, quest_category, quest_id, user_id]
        );
        console.debug(`주간 숙제 수정 결과: ${JSON.stringify(result)}`);
        if (result.affectedRows === 0) {
            console.debug(`주간 숙제를 찾을 수 없거나 수정 권한이 없음: quest_id=${quest_id}, user_id=${user_id}`);
            return res.status(404).send('주간 숙제를 찾을 수 없거나 수정 권한이 없습니다.');
        }
        res.status(200).send('주간 숙제가 성공적으로 수정되었습니다.');
        console.debug('updateWeeklyQuest 함수 종료 (성공)');
    } catch (error) {
        console.error('주간 숙제 수정 중 오류 발생:', error);
        console.debug('updateWeeklyQuest 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

// 주간 숙제 삭제
async function deleteWeeklyQuest(req, res, dbManager) {
    console.debug('deleteWeeklyQuest 함수 진입');
    const { user_id } = req.params;
    const { quest_id } = req.params;
    console.debug(`입력값 - user_id: ${user_id}, quest_id: ${quest_id}`);
    try {
        const pool = dbManager.getPool();
        console.debug('DB 풀 가져오기 성공');
        const [result] = await pool.query(
            'DELETE FROM weekly_quests WHERE id = ? AND user_id = ?',
            [quest_id, user_id]
        );
        console.debug(`주간 숙제 삭제 결과: ${JSON.stringify(result)}`);
        if (result.affectedRows === 0) {
            console.debug(`주간 숙제를 찾을 수 없거나 삭제 권한이 없음: quest_id=${quest_id}, user_id=${user_id}`);
            return res.status(404).send('주간 숙제를 찾을 수 없거나 삭제 권한이 없습니다.');
        }
        res.status(200).send('주간 숙제가 성공적으로 삭제되었습니다.');
        console.debug('deleteWeeklyQuest 함수 종료 (성공)');
    } catch (error) {
        console.error('주간 숙제 삭제 중 오류 발생:', error);
        console.debug('deleteWeeklyQuest 함수 종료 (오류)');
        res.status(500).send('서버 오류');
    }
}

module.exports = {
  getDailyQuests,
  completeDailyQuest,
  resetDailyQuests,
  addDailyQuest,
  updateDailyQuest,
  deleteDailyQuest,
  getWeeklyQuests,
  completeWeeklyQuest,
  resetWeeklyQuests,
  addWeeklyQuest,
  updateWeeklyQuest,
  deleteWeeklyQuest
}; 