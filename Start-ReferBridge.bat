@echo off
title ReferBridge Healthcare Network
cd /d "%~dp0"
echo ===================================================
echo Launching ReferBridge Healthcare Platform...
echo Opening in your browser at http://localhost:3000
echo ===================================================
start "" "http://localhost:3000"
npm run dev
pause
