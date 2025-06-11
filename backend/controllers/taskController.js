const { getPool } = require('../utils/dbManager');

// 새 작업 생성
const createTask = async (req, res) => {
    const { taskName } = req.body;
    if (!taskName) {
        return res.status(400).json({ message: '작업 이름은 필수입니다.' });
    }

    const pool = getPool();
    try {
        const [result] = await pool.query(
            'INSERT INTO tasks (task_name) VALUES (?) ON DUPLICATE KEY UPDATE task_name = VALUES(task_name)',
            [taskName]
        );
        res.status(201).json({ message: '작업이 성공적으로 추가되거나 업데이트되었습니다.', taskId: result.insertId });
    } catch (error) {
        console.error('작업 추가 오류:', error);
        res.status(500).json({ message: '작업 추가에 실패했습니다.' });
    }
};

// 모든 작업 조회
const getAllTasks = async (req, res) => {
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT * FROM tasks ORDER BY task_name');
        res.json(rows);
    } catch (error) {
        console.error('모든 작업 조회 오류:', error);
        res.status(500).json({ message: '작업을 불러오는 데 실패했습니다.' });
    }
};

// 특정 캐릭터의 작업 목록 및 완료 상태 조회
const getCharacterTasks = async (req, res) => {
    const { characterId } = req.params;
    const pool = getPool();
    try {
        // 모든 작업과 해당 캐릭터의 완료 상태를 JOIN하여 가져옵니다.
        // 캐릭터가 아직 수행하지 않은 작업은 is_completed가 NULL이 됩니다.
        const [rows] = await pool.query(
            `SELECT
                t.id AS task_id,
                t.task_name,
                ct.is_completed,
                ct.completed_date
            FROM
                tasks t
            LEFT JOIN
                character_tasks ct ON t.id = ct.task_id AND ct.character_id = ?
            ORDER BY
                t.task_name`,
            [characterId]
        );
        res.json(rows);
    } catch (error) {
        console.error('캐릭터 작업 조회 오류:', error);
        res.status(500).json({ message: '캐릭터 작업을 불러오는 데 실패했습니다.' });
    }
};

// 특정 캐릭터의 작업 완료 상태 업데이트 또는 삽입
const updateCharacterTaskCompletion = async (req, res) => {
    const { taskId, characterId } = req.params;
    const { isCompleted } = req.body;
    const completedDate = isCompleted ? new Date().toISOString().slice(0, 10) : null; // YYYY-MM-DD

    if (isCompleted === undefined) {
        return res.status(400).json({ message: 'isCompleted 값은 필수입니다.' });
    }

    const pool = getPool();
    try {
        const [result] = await pool.query(
            `INSERT INTO character_tasks (character_id, task_id, is_completed, completed_date)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE is_completed = VALUES(is_completed), completed_date = VALUES(completed_date)`,
            [characterId, taskId, isCompleted, completedDate]
        );
        res.json({ message: '캐릭터 작업 상태가 성공적으로 업데이트되었습니다.', changes: result.affectedRows });
    } catch (error) {
        console.error('캐릭터 작업 완료 상태 업데이트 오류:', error);
        res.status(500).json({ message: '캐릭터 작업 상태 업데이트에 실패했습니다.' });
    }
};

const getTasksForAllCharacters = async (req, res) => {
    const { characterIds } = req.query; // 쉼표로 구분된 characterId 문자열

    if (!characterIds) {
        return res.status(400).json({ message: 'characterIds는 필수입니다.' });
    }

    const charIdsArray = characterIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (charIdsArray.length === 0) {
        return res.status(200).json([]); // 유효한 ID가 없으면 빈 배열 반환
    }

    const pool = getPool();
    try {
        // 모든 작업과 주어진 캐릭터들의 완료 상태를 JOIN하여 가져옵니다.
        const [rows] = await pool.query(
            `SELECT
                t.id AS task_id,
                t.task_name,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'character_id', ct.character_id,
                        'is_completed', ct.is_completed,
                        'completed_date', ct.completed_date
                    )
                ) AS character_statuses
            FROM
                tasks t
            LEFT JOIN
                character_tasks ct ON t.id = ct.task_id AND ct.character_id IN (?)
            GROUP BY
                t.id, t.task_name
            ORDER BY
                t.task_name`,
            [charIdsArray]
        );

        // MySQL의 JSON_ARRAYAGG는 빈 배열을 반환하지 않고 NULL을 반환할 수 있으므로, 이를 처리합니다.
        const result = rows.map(row => ({
            ...row,
            character_statuses: row.character_statuses ? row.character_statuses.filter(status => status.character_id !== null) : []
        }));

        res.json(result);
    } catch (error) {
        console.error('모든 캐릭터에 대한 작업 조회 오류:', error);
        res.status(500).json({ message: '모든 캐릭터에 대한 작업을 불러오는 데 실패했습니다.' });
    }
};

// 작업 삭제
const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const pool = getPool();
    try {
        const [result] = await pool.query(
            'DELETE FROM tasks WHERE id = ?',
            [taskId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '작업을 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '작업이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('작업 삭제 오류:', error);
        res.status(500).json({ message: '작업 삭제에 실패했습니다.' });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getCharacterTasks,
    updateCharacterTaskCompletion,
    getTasksForAllCharacters,
    deleteTask
}; 