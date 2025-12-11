# Script PowerShell para limpiar el historial de Git y eliminar credenciales
# 
# ⚠️ ADVERTENCIA: Este script reescribirá el historial de Git
# Asegúrate de hacer backup antes de ejecutarlo

Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host "🧹 Limpieza del Historial de Git - Eliminar Credenciales"
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host ""

# Verificar que estamos en un repositorio Git
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: No estás en un repositorio Git" -ForegroundColor Red
    exit 1
}

# Hacer backup de la rama actual
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📦 Creando backup de la rama: $currentBranch" -ForegroundColor Yellow
git branch "backup-$currentBranch-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto reescribirá el historial de Git" -ForegroundColor Red
Write-Host "   Asegúrate de coordinar con tu equipo antes de continuar" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "¿Continuar? (escribe 'yes' para confirmar)"

if ($confirm -ne "yes") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🧹 Eliminando archivos del historial..." -ForegroundColor Yellow

# Eliminar archivos del historial
git filter-branch --force --index-filter `
    "git rm --cached --ignore-unmatch backend/src/config/firebase-adminsdk.json tibitribial-firebase-adminsdk-fbsvc-f75a156e4e.json" `
    --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar filter-branch" -ForegroundColor Red
    exit 1
}

Write-Host "🧹 Limpiando referencias..." -ForegroundColor Yellow

# Limpiar referencias
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object {
    git update-ref -d $_
}

Write-Host "🧹 Limpiando reflog y optimizando..." -ForegroundColor Yellow

# Limpiar reflog y optimizar
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host "=" -NoNewline
Write-Host ("=" * 59)
Write-Host ""
Write-Host "📝 Próximos pasos:"
Write-Host "1. Verifica que los archivos fueron eliminados:"
Write-Host "   git log --all --full-history -- backend/src/config/firebase-adminsdk.json"
Write-Host ""
Write-Host "2. Si el comando anterior no muestra resultados, los archivos fueron eliminados"
Write-Host ""
Write-Host "3. Para hacer push (requiere coordinación con tu equipo):"
Write-Host "   git push --force-with-lease origin $currentBranch"
Write-Host ""
Write-Host "⚠️  NOTA: --force-with-lease es más seguro que --force"
Write-Host "   Solo hará push si nadie más ha hecho cambios en la rama remota"
Write-Host ""

