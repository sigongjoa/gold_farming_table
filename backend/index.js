require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dbManager = require('./utils/dbManager'); // dbManager 모듈 불러오기
const taskRoutes = require('./routes/taskRoutes'); // taskRoutes 추가
const morgan = require('morgan');
const bodyParser = require('body-parser');

const itemRoutes = require('./routes/itemRoutes'); // itemRoutes 모듈을 불러옵니다。
const craftingRoutes = require('./routes/craftingRoutes'); // craftingRoutes 모듈을 불러옵니다。
const userRoutes = require('./routes/userRoutes'); // 새로운 userRoutes 모듈을 불러옵니다。
const serverRoutes = require('./routes/serverRoutes'); // 새로운 serverRoutes 모듈을 불러옵니다。
const questRoutes = require('./routes/questRoutes'); // 새로운 questRoutes 모듈을 불러옵니다。
const resourceRoutes = require('./routes/resourceRoutes'); // 새로운 resourceRoutes 모듈을 불러옵니다。
const lifeSkillRoutes = require('./routes/lifeSkillRoutes'); // 새로운 lifeSkillRoutes 모듈을 불러옵니다。
const characterRoutes = require('./routes/characterRoutes'); // 새로운 characterRoutes 모듈을 불러옵니다。
const equipmentRoutes = require('./routes/equipmentRoutes'); // 새로운 equipmentRoutes 모듈을 불러옵니다。
const partTimeJobRoutes = require('./routes/partTimeJobRoutes'); // 새로운 partTimeJobRoutes 모듈을 불러옵니다。
const userCharacterTaskRoutes = require('./routes/userCharacterTaskRoutes'); // 새로운 userCharacterTaskRoutes 모듈을 불러옵니다。
const craftingFacilityRoutes = require('./routes/craftingFacilityRoutes'); // 새로운 craftingFacilityRoutes 모듈을 불러옵니다。
const professionRoutes = require('./routes/professionRoutes'); // 새로운 professionRoutes 모듈을 불러옵니다。

const app = express();
const PORT = process.env.PORT || 3001;

console.debug('Backend: Express app initialized');

app.use(helmet());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);
console.debug('Backend: Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

async function initializeApp() {
  console.debug('initializeApp: Entering function');
  try {
    console.debug('initializeApp: Initializing main database pool');
    await dbManager.initializeMainPool();
    console.debug('initializeApp: Main database pool initialized');

    console.debug('initializeApp: Setting up routes');
    app.use('/servers', serverRoutes(dbManager)); 
    app.use('/items', itemRoutes(dbManager));
    app.use('/users', userRoutes(dbManager));
    app.use('/crafting', craftingRoutes(dbManager));
    app.use('/quests', questRoutes(dbManager));
    app.use('/resources', resourceRoutes(dbManager));
    app.use('/tasks', taskRoutes);
    app.use('/life-skills', lifeSkillRoutes(dbManager));
    app.use('/characters', characterRoutes(dbManager));
    app.use('/equipments', equipmentRoutes(dbManager));
    app.use('/api', partTimeJobRoutes(dbManager));
    app.use('/user-character-tasks', userCharacterTaskRoutes(dbManager));
    app.use('/crafting-facilities', craftingFacilityRoutes(dbManager));
    app.use('/professions', professionRoutes);
    console.debug('initializeApp: Routes set up');

    // 정적 프론트엔드 파일 제공
    console.debug('initializeApp: Serving static frontend files from:', path.join(__dirname, '../frontend'));
    app.use(express.static(path.join(__dirname, '../frontend')));

    // 헬스 체크
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' });
    });
    console.debug('initializeApp: Exiting function (initialization and routes set up)');

  } catch (err) {
    console.error('initializeApp: Application initialization failed:', err);
    throw err; // 에러를 호출자로 전파
  }
}

console.debug('Backend: Calling initializeApp()');
initializeApp()
  .then(() => {
    console.debug('Backend: Database initialized and routes set up, starting server');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.debug(`Backend: Server running on http://localhost:${PORT}`);
    });

    // 404 핸들러 (모든 라우트와 정적 파일 이후에 배치)
    app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });

    // 에러 핸들러 (모든 미들웨어와 라우트 이후에 배치)
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });

  })
  .catch(err => {
    console.error('Backend: Failed to start application:', err);
    process.exit(1);
  }); 