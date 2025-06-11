const express = require('express');
const cors = require('cors'); // CORS 미들웨어를 불러옵니다。
const path = require('path');
const dbManager = require('./utils/dbManager'); // dbManager 모듈 불러오기
const taskRoutes = require('./routes/taskRoutes'); // taskRoutes 추가

const itemRoutes = require('./routes/itemRoutes'); // itemRoutes 모듈을 불러옵니다.
const craftingRoutes = require('./routes/craftingRoutes'); // craftingRoutes 모듈을 불러옵니다。
const userRoutes = require('./routes/userRoutes'); // 새로운 userRoutes 모듈을 불러옵니다.
const serverRoutes = require('./routes/serverRoutes'); // 새로운 serverRoutes 모듈을 불러옵니다.
const questRoutes = require('./routes/questRoutes'); // 새로운 questRoutes 모듈을 불러옵니다.
const resourceRoutes = require('./routes/resourceRoutes'); // 새로운 resourceRoutes 모듈을 불러옵니다.
const lifeSkillRoutes = require('./routes/lifeSkillRoutes'); // 새로운 lifeSkillRoutes 모듈을 불러옵니다.
const characterRoutes = require('./routes/characterRoutes'); // 새로운 characterRoutes 모듈을 불러옵니다.

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors()); // 모든 도메인에서의 요청을 허용합니다。

async function initializeApp() {
  try {
    await dbManager.initializeMainPool(); // 메타 데이터베이스 풀 초기화

    // 라우트 설정은 데이터베이스 연결 풀이 생성된 후에 이루어져야 합니다.
    // 각 라우터 모듈에 dbManager를 전달하여 동적 DB 연결을 사용하도록 합니다.
    app.use('/items', itemRoutes(dbManager));
    app.use('/users', userRoutes(dbManager));
    app.use('/crafting', craftingRoutes(dbManager));
    app.use('/servers', serverRoutes(dbManager)); // 새 서버 라우트
    app.use('/quests', questRoutes(dbManager)); // 새 숙제 라우트
    app.use('/resources', resourceRoutes(dbManager)); // 새 재화 라우트
    app.use('/tasks', taskRoutes); // taskRoutes 연결
    app.use('/life-skills', lifeSkillRoutes(dbManager)); // 새 생활스킬 라우트
    app.use('/characters', characterRoutes(dbManager)); // 새 캐릭터 관리 라우트

    // 정적 프론트엔드 파일 제공은 API 라우트 이후에 정의합니다.
    app.use(express.static(path.join(__dirname, '../frontend')));

    app.listen(port, () => {
      console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
    });

  } catch (err) {
    console.error('애플리케이션 초기화 실패:', err);
    process.exit(1); // 연결 실패 시 애플리케이션 종료
  }
}

// 서버 시작 전 애플리케이션 초기화
initializeApp();

// 기존의 / 엔드포인트는 express.static이 index.html을 자동으로 처리하므로 필요 없습니다.
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// }); 