# Script simple para ejecutar tests
Write-Host "Ejecutando Tests Unitarios..." -ForegroundColor Green

# Intentar con la ruta del proyecto primero
$nodeInProject = "$PSScriptRoot\node-v20.18.0-win-x64\node.exe"

if (Test-Path $nodeInProject) {
    Write-Host "Usando Node.js del proyecto"
    & $nodeInProject "simple-test-runner.js"
} else {
    Write-Host "Intentando usar node desde PATH"
    try {
        node "simple-test-runner.js"
    } catch {
        Write-Host "Error: Node.js no encontrado"
    }
}

Write-Host ""
Write-Host "Tests completados"
pause