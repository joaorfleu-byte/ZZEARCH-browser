@echo off
chcp 65001 >nul
title ZZEARCH Browser
echo ======================================
echo          ZZEARCH BROWSER
echo ======================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)
echo Abrindo ZZEARCH...
call npm start
if errorlevel 1 pause