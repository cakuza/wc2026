@echo off
setlocal
cd /d "%~dp0"
echo.
echo WC26 Hub local dev server
echo =========================
echo.
if not exist node_modules (
  echo node_modules not found. Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
)
echo.
echo Starting Next.js dev server.
echo Local URL: http://localhost:3000
echo Visual review: http://localhost:3000/visual-review
echo Cards: http://localhost:3000/cards
echo.
call npm.cmd run dev
if errorlevel 1 (
  echo.
  echo Dev server stopped with an error.
  pause
  exit /b 1
)
