const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');

// 데이터베이스 연결을 mocking
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    query: jest.fn((sql) => {
      if (sql === 'SELECT * FROM items') {
        return Promise.resolve([[{ item_id: 1, name: '테스트 아이템', item_type: '소모품' }], []]);
      }
      return Promise.resolve([[], []]);
    }),
  })),
}));

const app = express();
app.use(express.json());

// index.js에서 dbConfig와 initializeDatabase 함수를 가져오는 대신,
// 여기서는 테스트를 위해 직접 초기화 부분을 작성합니다.
// 실제 애플리케이션에서는 모듈화하여 가져오는 것이 좋습니다.

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mabinogi_item_db'
};

let pool;

async function initializeDatabase() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('MySQL 데이터베이스 연결 성공 (Mock)');
  } catch (err) {
    console.error('MySQL 데이터베이스 연결 실패 (Mock):', err);
  }
}

initializeDatabase();

// 테스트할 API 엔드포인트
app.get('/items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM items');
    res.json(rows);
  } catch (err) {
    console.error('아이템 조회 오류:', err);
    res.status(500).send('아이템을 불러오는 데 실패했습니다.');
  }
});

describe('아이템 API', () => {
  test('GET /items는 모든 아이템을 반환해야 합니다.', async () => {
    const res = await request(app).get('/items');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([{
      item_id: 1,
      name: '테스트 아이템',
      item_type: '소모품'
    }]);
  });
}); 