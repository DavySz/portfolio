#!/bin/bash

# Script para corrigir imports de tipo automaticamente
# Uso: ./fix-imports.sh

echo "🔧 Corrigindo imports de tipo..."

# Executar ESLint com fix automático
npx eslint . --fix

echo "✅ Imports corrigidos!"
echo ""
echo "Se ainda houver erros, rode: npm run lint"
