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
  console.debug('initializeMainPool 함수 진입');
  console.debug(`DB 설정: ${JSON.stringify(dbConfig)}`);
  console.debug(`DB 이름: ${dbName}, DB 초기화 여부: ${resetDb}`);
  let connection;
  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true
    });
    console.debug('임시 DB 연결 성공');
    if (resetDb) {
      console.debug(`기존 데이터베이스 (${dbName}) 삭제 시도...`);
      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
      console.debug('기존 데이터베이스 삭제 완료');
    }
    console.debug(`데이터베이스 (${dbName}) 생성 시도...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.debug('데이터베이스 생성 완료');

    // 새로 생성된 데이터베이스를 사용하도록 연결 변경
    await connection.changeUser({ database: dbName });
    console.debug(`데이터베이스 연결을 ${dbName}으로 변경 성공`);

    // 스키마 파일 실행
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.debug('스키마 파일 읽기 성공');
    await connection.query(schemaSql);
    console.log(`MySQL 메인 데이터베이스 스키마 적용 완료: ${dbName}`);
    console.debug('스키마 적용 완료');

    // 시드 파일 실행 (RESET_DB가 true일 때만)
    if (resetDb) {
      const mainSeedPath = path.join(__dirname, '..', 'database', 'seed.sql');
      const mainSeedContent = fs.readFileSync(mainSeedPath, 'utf8');
      console.debug('메인 시드 파일 읽기 성공');

      // SOURCE 명령어를 파싱하여 개별 시드 파일 경로 추출
      const sourceRegex = /SOURCE\s+([^;]+);/g;
      let match;
      let fullSeedSql = '';

      while ((match = sourceRegex.exec(mainSeedContent)) !== null) {
        const seedFilePathRelative = match[1].trim();
        const seedFilePath = path.join(__dirname, '..', '..', seedFilePathRelative);
        console.debug(`개별 시드 파일 읽기 시도: ${seedFilePath}`);
        const individualSeedSql = fs.readFileSync(seedFilePath, 'utf8');
        // 모든 주석 (라인 및 블록) 제거
        const cleanedContent = individualSeedSql
          .replace(/\/\*[\s\S]*?\*\//g, '') // 블록 주석 제거
          .replace(/--.*$/gm, ''); // 라인 주석 제거

        // SQL 구문을 세미콜론으로 분리하고 각 구문 정리
        const statements = cleanedContent.split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);

        if (statements.length > 0) {
          // 각 구문 뒤에 단일 세미콜론과 줄 바꿈을 추가하여 fullSeedSql에 직접 추가
          // 이렇게 하면 각 SQL 구문이 정확히 ;로 끝나고 \n으로 분리됩니다.
          const formattedStatements = statements.map(stmt => stmt + ';\n').join('');
          fullSeedSql += formattedStatements;
          console.log(`DEBUG: Processed cleanSeedSql from ${seedFilePathRelative} (first 500 chars): \`${statements.join(' ').substring(0, 500)}\``); // Log truncated
          console.debug(`개별 시드 파일 (${seedFilePathRelative}) 내용 추가됨`);
        } else {
          console.debug(`개별 시드 파일 (${seedFilePathRelative})에 실행할 SQL이 없습니다.`);
        }
      }
      
      if (fullSeedSql.length > 0) {
        console.debug('Executing combined seed SQL (first 500 chars):', fullSeedSql.substring(0, 500) + (fullSeedSql.length > 500 ? '...' : ''));
        console.log('DEBUG: Full seed SQL content (start):', fullSeedSql.substring(0, 5000)); // 첫 5000자만 출력
        console.log('DEBUG: Full seed SQL content (end):', fullSeedSql.substring(fullSeedSql.length - 5000 > 0 ? fullSeedSql.length - 5000 : 0)); // 마지막 5000자 출력
        await connection.query(fullSeedSql);
        console.log(`MySQL 메인 데이터베이스 시드 데이터 적용 완료: ${dbName}`);
        console.debug('시드 데이터 적용 완료');
      } else {
        console.debug('실행할 시드 SQL이 없습니다.');
      }
    }

    if (resetDb) {
      console.log(`MySQL 메인 데이터베이스 초기화 완료: ${dbName}`);
    }
    await connection.end();
    console.debug('임시 DB 연결 해제됨');

    mainPool = await mysql.createPool({
      ...dbConfig,
      database: dbName,
      multipleStatements: true
    });
    console.log(`MySQL 메인 데이터베이스 연결 성공: ${dbName}`);
    console.debug('메인 DB 풀 생성 성공');

    console.debug('initializeMainPool 함수 종료 (성공)');

  } catch (err) {
    console.error('MySQL 메인 데이터베이스 연결 실패:', err);
    console.debug('initializeMainPool 함수 종료 (오류)');
    process.exit(1);
  } finally {
    if (connection) {
      connection.end();
      console.debug('finally 블록: 임시 DB 연결 해제됨');
    }
  }
}

function getPool() {
  console.debug('getPool 함수 진입');
  if (!mainPool) {
    console.debug('메인 데이터베이스 풀이 초기화되지 않음, 오류 발생');
    throw new Error('메인 데이터베이스 풀이 초기화되지 않았습니다.');
  }
  console.debug('메인 데이터베이스 풀 반환');
  return mainPool;
}

module.exports = {
  initializeMainPool,
  getPool
}; 