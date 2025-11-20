@echo off
echo ===============================================
echo      CLEANING GIT REPO FROM LARGE FILES
echo ===============================================
echo.

REM --- 1. Backup Repo ---
echo Membuat backup repo ke folder "_backup_repo" ...
set BACKUP=_backup_repo
if exist %BACKUP% rd /s /q %BACKUP%
xcopy . %BACKUP% /E /H /C /I >nul
echo Backup selesai.
echo.

REM --- 2. Download BFG (otomatis) ---
echo Mengunduh BFG Repo-Cleaner...
curl -L -o bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
echo BFG terunduh.
echo.

REM --- 3. Hapus file besar di history ---
echo Membersihkan file besar dari riwayat Git...
java -jar bfg.jar --strip-blobs-bigger-than 10M .

echo.
echo BFG selesai membersihkan.
echo.

REM --- 4. Clean-up Git ---
echo Cleaning git...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Git cleanup selesai.
echo.

REM --- 5. Push paksa ke GitHub ---
echo Siap push paksa ke origin main ...
git push origin main --force

echo.
echo ===============================================
echo       CLEANING COMPLETE – PUSH SUKSES
echo ===============================================
pause
