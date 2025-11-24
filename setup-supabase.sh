#!/bin/bash

# 🚀 Script de Configuración Automática Supabase + GitHub

echo "🎯 Configurando integración Supabase + GitHub..."

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
fi

# Verificar si ya existe config de Supabase
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Inicializando proyecto Supabase..."
    supabase init
fi

# Crear directorio para Edge Functions si no existe
mkdir -p supabase/functions/github-sync

# Copiar la función Edge si no existe
if [ ! -f "supabase/functions/github-sync/index.ts" ]; then
    echo "📄 Copiando Edge Function..."
    cp supabase/edge-functions/github-sync.ts supabase/functions/github-sync/index.ts
fi

echo "✅ Configuración base completada!"
echo ""
echo "🔑 Próximos pasos:"
echo "1. Configura tus credenciales de Supabase:"
echo "   supabase login"
echo ""
echo "2. Conecta tu proyecto:"
echo "   supabase link --project-ref TU_PROJECT_REF"
echo ""
echo "3. Deploya la función:"
echo "   supabase functions deploy github-sync"
echo ""
echo "4. Configura el webhook en GitHub con la URL generada"
echo ""
echo "📚 Ver guía completa: SUPABASE-GITHUB-INTEGRATION.md"