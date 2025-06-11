const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); // CORS 미들웨어를 불러옵니다.
const itemRoutes = require('./routes/itemRoutes'); // itemRoutes 모듈을 불러옵니다.
const craftingRoutes = require('./routes/craftingRoutes'); // craftingRoutes 모듈을 불러옵니다.
const userRoutes = require('./routes/userRoutes'); // 새로운 userRoutes 모듈을 불러옵니다.
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors()); // 모든 도메인에서의 요청을 허용합니다.

// 데이터베이스 연결 설정 (실제 사용 시에는 .env 파일 등을 통해 관리)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'aaccbb1245@', // 실제 비밀번호로 변경하세요
  database: 'mabinogi_item_db'
};

// 데이터베이스 연결 풀 생성
let pool;

async function initializeDatabase() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('MySQL 데이터베이스 연결 성공');
    
    // 라우트 설정은 데이터베이스 연결 풀이 생성된 후에 이루어져야 합니다.
    app.use('/items', itemRoutes);
    app.use('/users', userRoutes);
    app.use('/crafting', craftingRoutes);

  } catch (err) {
    console.error('MySQL 데이터베이스 연결 실패:', err);
    process.exit(1); // 연결 실패 시 애플리케이션 종료
  }
}

// 서버 시작 전 데이터베이스 초기화
initializeDatabase();

app.get('/', (req, res) => {
  res.send('마비노기 아이템 데이터베이스 API 서버입니다.');
});

// 기존의 /items 엔드포인트는 itemRoutes로 대체됩니다.
// app.get('/items', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM items');
//     res.json(rows);
//   } catch (err) {
//     console.error('아이템 조회 오류:', err);
//     res.status(500).send('아이템을 불러오는 데 실패했습니다.');
//   }
// });

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

module.exports = { pool }; // pool 객체를 내보냅니다. 