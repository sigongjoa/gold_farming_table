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

const dbName = process.env.DB_NAME || 'mabinogi_item_db';
const resetDb = process.env.RESET_DB === 'true';

let mainPool; // 메인 데이터베이스 풀

async function initializeMainPool() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    if (resetDb) {
      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    }
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    if (resetDb) {
      console.log(`MySQL 메인 데이터베이스 초기화 완료: ${dbName}`);
    }
    await connection.end();

    mainPool = await mysql.createPool({
      ...dbConfig,
      database: dbName,
      multipleStatements: true
    });
    console.log(`MySQL 메인 데이터베이스 연결 성공: ${dbName}`);

    if (resetDb) {
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('메인 데이터베이스에 스키마 적용 중...');
      await mainPool.query(schemaSql);
      console.log('메인 데이터베이스에 스키마 성공적으로 적용됨.');

      const seedPath = path.join(__dirname, '../database/seed.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('메인 데이터베이스에 시드 데이터 적용 중...');
      await mainPool.query(seedSql);
      console.log('메인 데이터베이스에 시드 데이터 성공적으로 적용됨.');
    }

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