# PowerShell Script para ejecutar Tests de Integración de Persistencia
param([switch]$Verbose)

Write-Host "Ejecutando Tests de Integración de Persistencia..." -ForegroundColor Cyan

# Buscar Node.js
$nodePaths = @(
    "C:\Users\victor.vega\Downloads\node-v20.18.0-win-x64\node-v20.18.0-win-x64\node.exe"
)

$nodeExe = $null
foreach ($path in $nodePaths) {
    if (Test-Path $path -ErrorAction SilentlyContinue) {
        $nodeExe = $path
        Write-Host "Usando Node.js: $nodeExe" -ForegroundColor Green
        break
    }
}

if (-not $nodeExe) {
    Write-Host "ERROR: No se pudo encontrar Node.js" -ForegroundColor Red
    exit 1
}

Write-Host "=== EJECUTANDO TESTS DE INTEGRACIÓN ===" -ForegroundColor Yellow

$result = & $nodeExe run-integration-tests.js 2>&1
Write-Host $result

if ($LASTEXITCODE -eq 0) {
    Write-Host "TODOS LOS TESTS DE INTEGRACIÓN PASARON" -ForegroundColor Green
} else {
    Write-Host "ALGUNOS TESTS DE INTEGRACIÓN FALLARON" -ForegroundColor Red
}

Write-Host "Tests completados" -ForegroundColor Cyan
Read-Host "Presione Enter para continuar"