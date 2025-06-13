@echo on
setlocal
pushd "%~dp0\..\.."

REM 1) connection info
set DB_USER=root
set DB_PASS=aaccbb1245@
set DB_NAME=mabinogi_item_db

echo [DEBUG] DB_USER=%DB_USER% DB_PASS=%DB_PASS% DB_NAME=%DB_NAME%

REM 2) drop
echo === Dropping existing database ===
mysql -u %DB_USER% -p%DB_PASS% -e "DROP DATABASE IF EXISTS %DB_NAME%;"
if %ERRORLEVEL% NEQ 0 (
  echo Error: Failed to drop database.
  goto :EOF
)
echo.

REM 3) create
echo === Creating database ===
mysql -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE %DB_NAME%;"
if %ERRORLEVEL% NEQ 0 (
  echo Error: Failed to create database.
  goto :EOF
)
echo.

REM 4) schema
echo === Applying schema ===
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < backend\database\schema.sql
if %ERRORLEVEL% NEQ 0 (
  echo Error: Failed to apply schema.
  goto :EOF
)
echo.

REM 5) seed
echo === Applying seed data ===
mysql -u %DB_USER% -p%DB_PASS% %DB_NAME% < backend\database\seed.sql
if %ERRORLEVEL% NEQ 0 (
  echo Error: Failed to apply seed data.
  goto :EOF
)
echo.

echo ====================================
echo Database reset and seeding complete!
echo ====================================

popd
endlocal
pause
