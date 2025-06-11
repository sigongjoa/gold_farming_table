# 백엔드 서버 실행 방법

이 문서는 `BuyRiceEat` 프로젝트의 백엔드 서버를 로컬 환경에서 실행하는 방법을 설명합니다.

## 1. 준비물

백엔드 서버를 실행하기 전에 다음 소프트웨어가 설치되어 있는지 확인하십시오:

*   **Node.js**: [Node.js 공식 웹사이트](https://nodejs.org/ko/)에서 최신 LTS 버전을 다운로드하여 설치하십시오.
*   **npm (Node Package Manager)**: Node.js와 함께 설치됩니다.
*   **MySQL**: 로컬 또는 원격 MySQL 서버가 필요합니다.

## 2. 환경 설정 (`.env` 파일)

백엔드 서버는 데이터베이스 연결을 위해 환경 변수를 사용합니다. 프로젝트 루트 디렉토리 (`D:\BuyRiceEat`)에 있는 `.env.example` 파일을 기반으로 `.env` 파일을 생성하고 데이터베이스 연결 정보를 설정해야 합니다.

1.  **`.env.example` 파일 복사:**
    프로젝트 루트 디렉토리(`D:\BuyRiceEat`)에서 다음 명령어를 실행하여 `.env.example` 파일을 `.env`로 복사합니다:
    ```powershell
    Copy-Item .env.example .env
    ```

2.  **`.env` 파일 편집:**
    새로 생성된 `.env` 파일을 텍스트 편집기(예: 메모장, VS Code)로 열고 다음 변수들을 실제 MySQL 환경에 맞게 수정합니다:

    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_root_password # 여기에 실제 MySQL root 비밀번호를 입력합니다. 비밀번호가 없으면 비워둡니다.
    DB_NAME=mabinogi_item_db
    PORT=3001
    CORS_ORIGIN=* # 개발 환경에서는 '*' (모든 출처 허용)를 사용할 수 있습니다.
    RESET_DB=false # 데이터베이스를 초기화하려면 true로 설정 (주의: 모든 데이터가 삭제됩니다!)
    ```
    특히 `DB_PASSWORD`는 MySQL `root` 사용자의 **실제 비밀번호**와 일치해야 합니다. 비밀번호가 없다면 `DB_PASSWORD=`와 같이 값을 비워두십시오.

3.  **파일 저장:** 변경 사항을 저장하고 파일을 닫습니다.

## 3. 종속성 설치

`backend` 디렉토리로 이동하여 필요한 Node.js 패키지를 설치합니다:

```powershell
cd backend
npm install
```

## 4. 백엔드 서버 실행

**가장 중요한 단계입니다!** `.env` 파일이 올바르게 로드되도록 **프로젝트 루트 디렉토리(`D:\BuyRiceEat`)에서** 서버를 실행해야 합니다.

프로젝트 루트 디렉토리(`D:\BuyRiceEat`)로 이동한 후 다음 명령어를 실행합니다:

```powershell
node backend/index.js
```

서버가 성공적으로 시작되면 다음과 유사한 메시지가 터미널에 표시됩니다:

```
DB_HOST: localhost
DB_USER: root
DB_PASSWORD: ********
MySQL 메인 데이터베이스 초기화 완료: mabinogi_item_db
MySQL 메인 데이터베이스 연결 성공: mabinogi_item_db
메인 데이터베이스에 스키마 적용 중...
메인 데이터베이스에 스키마 성공적으로 적용됨.
메인 데이터베이스에 시드 데이터 적용 중...
메인 데이터베이스에 시드 데이터 성공적으로 적용됨.
서버가 http://localhost:3001 에서 실행 중입니다.
```

이제 백엔드 서버가 `http://localhost:3001`에서 실행 중입니다.

## 5. 서버 중지

서버를 중지하려면 터미널 창에서 `Ctrl + C`를 누르십시오. 