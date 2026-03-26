@echo off
REM Script para iniciar rapidamente el frontend en Windows

echo ==================================
echo 🚀 EmprendeIA Frontend
echo ==================================
echo.

REM Verificar si estamos en la carpeta correcta
if not exist "package.json" (
    echo ❌ Error: Ejecuta este script desde la carpeta frontend-emprenderia
    exit /b 1
)

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install
)

echo.
echo ✅ Iniciando servidor...
echo.
echo 🌍 Frontend disponible en: http://localhost:3000
echo 🔌 Backend esperado en: http://localhost:5000
echo.
echo Presiona Ctrl+C para detener el servidor
echo ==================================
echo.

call npm run dev

pause
