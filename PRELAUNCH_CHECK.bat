@echo off
setlocal
cd /d "%~dp0"
echo.
echo WC26 Hub prelaunch check
echo ========================
echo.
echo Note: route checks need a running server.
echo Start RUN_DEV.bat first, then run this file in another terminal if you also want npm run check:routes.
echo.
if not exist node_modules (
  echo node_modules not found. Installing dependencies...
  call npm.cmd install
  if errorlevel 1 goto failed
)
call npm.cmd run import:squads
if errorlevel 1 goto failed
call npm.cmd run validate:data
if errorlevel 1 goto failed
call npm.cmd run lint
if errorlevel 1 goto failed
call npm.cmd run typecheck
if errorlevel 1 goto failed
call npm.cmd run build
if errorlevel 1 goto failed
call npm.cmd run prelaunch
if errorlevel 1 goto failed
echo.
echo Prelaunch check passed.
pause
exit /b 0

:failed
echo.
echo Prelaunch check failed.
pause
exit /b 1
