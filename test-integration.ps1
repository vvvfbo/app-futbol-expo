# PowerShell Script para ejecutar Tests de Integración de Persistencia
# Este script ejecuta tests que detectan problemas reales de race conditions

param(
    [switch]$Verbose
)

Write-Host "Ejecutando Tests de Integración de Persistencia..." -ForegroundColor Cyan

# Buscar Node.js
$nodePaths = @(
    "C:\Users\victor.vega\Downloads\node-v20.18.0-win-x64\node-v20.18.0-win-x64\node.exe",
    "node"
)

$nodeExe = $null
foreach ($path in $nodePaths) {
    if (Test-Path $path -ErrorAction SilentlyContinue) {
        $nodeExe = $path
        Write-Host "Usando Node.js: $nodeExe" -ForegroundColor Green
        break
    }
    elseif ((Get-Command $path -ErrorAction SilentlyContinue)) {
        $nodeExe = $path
        Write-Host "Usando Node.js del sistema: $nodeExe" -ForegroundColor Green
        break
    }
}

if (-not $nodeExe) {
    Write-Host "❌ ERROR: No se pudo encontrar Node.js" -ForegroundColor Red
    Write-Host "Instala Node.js o verifica la ruta" -ForegroundColor Red
    exit 1
}

try {
    # Ejecutar los tests de integración
    Write-Host "`n🧪 === EJECUTANDO TESTS DE INTEGRACIÓN ===" -ForegroundColor Yellow
    
    $result = & $nodeExe run-integration-tests.js 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ TODOS LOS TESTS DE INTEGRACIÓN PASARON" -ForegroundColor Green
        Write-Host $result
        Write-Host "`n🎉 El sistema de persistencia está funcionando correctamente" -ForegroundColor Green
    } else {
        Write-Host "`n❌ ALGUNOS TESTS DE INTEGRACIÓN FALLARON" -ForegroundColor Red
        Write-Host $result
        Write-Host "`n⚠️ Se detectaron problemas de persistencia" -ForegroundColor Yellow
    }
    
    Write-Host "`nTests de integración completados" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERROR ejecutando tests de integración: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nPresione Enter para continuar..." -NoNewline -ForegroundColor Green
Read-Host