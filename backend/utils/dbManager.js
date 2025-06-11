const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let mainPool; // 메인 데이터베이스 풀

async function initializeMainPool() {
  let connection;
  try {
    // 먼저 root 계정으로 연결하여 데이터베이스를 삭제하고 다시 생성합니다.
    connection = await mysql.createConnection(dbConfig);
    await connection.query('DROP DATABASE IF EXISTS mabinogi_item_db');
    await connection.query('CREATE DATABASE mabinogi_item_db');
    console.log('MySQL 메인 데이터베이스 초기화 및 재성공: mabinogi_item_db');
    await connection.end();

    // 새로 생성된 데이터베이스에 연결할 풀 생성
    mainPool = await mysql.createPool({
      ...dbConfig,
      database: 'mabinogi_item_db',
      multipleStatements: true // 여러 SQL 문장을 한 번에 실행 허용
    });
    console.log('MySQL 메인 데이터베이스 연결 성공: mabinogi_item_db');

    // 메인 스키마 적용
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('메인 데이터베이스에 스키마 적용 중...');
    await mainPool.query(schemaSql);
    console.log('메인 데이터베이스에 스키마 성공적으로 적용됨.');

    // 시드 데이터 적용
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('메인 데이터베이스에 시드 데이터 적용 중...');
    await mainPool.query(seedSql);
    console.log('메인 데이터베이스에 시드 데이터 성공적으로 적용됨.');

  } catch (err) {
    console.error('MySQL 메인 데이터베이스 연결 실패:', err);
    process.exit(1);
  } finally {
    if (connection) connection.end();
  }
}

function getPool() {
  if (!mainPool) {
    throw new Error('메인 데이터베이스 풀이 초기화되지 않았습니다.');
  }
  return mainPool;
}

module.exports = {
  initializeMainPool,
  getPool
}; 