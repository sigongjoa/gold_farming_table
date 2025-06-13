module.exports = (dbManager) => {
    const getAllPartTimeJobs = async (req, res) => {
        console.debug('getAllPartTimeJobs 함수 진입');
        try {
            const pool = dbManager.getPool(); // dbManager를 통해 풀을 가져옵니다.
            console.debug('DB 풀 가져오기 성공');
            const [rows] = await pool.query('SELECT * FROM part_time_jobs');
            console.debug(`조회된 아르바이트 목록: ${JSON.stringify(rows)}`);
            res.json(rows);
            console.debug('getAllPartTimeJobs 함수 종료 (성공)');
        } catch (error) {
            console.error('Error fetching part-time jobs:', error);
            console.debug('getAllPartTimeJobs 함수 종료 (오류)');
            res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    };

    return {
        getAllPartTimeJobs,
    };
}; 