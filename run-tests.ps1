# Script de PowerShell para ejecutar tests
Write-Host "🚀 Ejecutando Tests Unitarios Completos..." -ForegroundColor Green
Write-Host ""

# Buscar Node.js en diferentes ubicaciones
$nodeLocations = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:USERPROFILE\Downloads\node-v20.18.0-win-x64\node-v20.18.0-win-x64\node.exe",
    "$PSScriptRoot\node-v20.18.0-win-x64\node.exe"
)

$nodeFound = $false
$nodePath = ""

foreach ($location in $nodeLocations) {
    if (Test-Path $location) {
        $nodePath = $location
        $nodeFound = $true
        Write-Host "✅ Node.js encontrado en: $location" -ForegroundColor Green
        break
    }
}

if (-not $nodeFound) {
    # Intentar usar node desde PATH
    try {
        $null = Get-Command node -ErrorAction Stop
        $nodePath = "node"
        $nodeFound = $true
        Write-Host "✅ Node.js encontrado en PATH" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js no encontrado en ninguna ubicación" -ForegroundColor Red
        Write-Host "Por favor instala Node.js o verifica la ruta" -ForegroundColor Yellow
        Read-Host "Presiona Enter para continuar"
        exit 1
    }
}

Write-Host ""
Write-Host "🔧 Ejecutando tests..." -ForegroundColor Cyan

# Ejecutar el test runner simple
try {
    & $nodePath "simple-test-runner.js"
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "🎉 Tests completados exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Tests completados con advertencias (código: $exitCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error ejecutando tests: $($_.Exception.Message)" -ForegroundColor Red
    $exitCode = 1
}

Write-Host ""
Write-Host "Presiona Enter para continuar..."
Read-Host

exit $exitCode