@echo off
chcp 65001 >nul
title Gerar ZZEARCH Browser Portable
if not exist node_modules call npm install
call npm run dist:win
echo.
echo Se tudo deu certo, o executavel portatil estara na pasta dist.
pause