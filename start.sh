#!/bin/bash
# Script para iniciar rápidamente el frontend

echo "=================================="
echo "🚀 EmprendeIA Frontend"
echo "=================================="
echo ""

# Verificar si estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la carpeta frontend-emprenderia"
    exit 1
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

echo ""
echo "✅ Iniciando servidor..."
echo ""
echo "🌍 Frontend disponible en: http://localhost:3000"
echo "🔌 Backend esperado en: http://localhost:5000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "=================================="
echo ""

npm run dev
