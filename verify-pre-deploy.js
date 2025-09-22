#!/usr/bin/env node
/**
 * Script de Verificación Pre-Deploy
 * Ejecuta todos los tests y verifica que el código esté listo para deploy
 */

const { TestRunner } = require('./__tests__/test-runner.js');
const fs = require('fs');
const path = require('path');

class PreDeployChecker {
    constructor() {
        this.checks = [];
        this.warnings = [];
        this.errors = [];
    }

    async runAllChecks() {
        console.log('🔍 VERIFICACIÓN PRE-DEPLOY\n');
        console.log('Verificando que el código esté listo para producción...\n');

        // 1. Verificar estructura de archivos
        await this.checkFileStructure();

        // 2. Verificar configuración
        await this.checkConfiguration();

        // 3. Ejecutar tests unitarios
        await this.runUnitTests();

        // 4. Verificar tipos y funciones críticas
        await this.checkCriticalFunctions();

        // 5. Verificar dependencias
        await this.checkDependencies();

        // Imprimir resultado final
        this.printFinalReport();

        // Retornar código de salida
        return this.shouldAllowDeploy();
    }

    async checkFileStructure() {
        console.log('📁 Verificando estructura de archivos...');

        const requiredFiles = [
            'hooks/data-context.tsx',
            'hooks/auth-context.tsx',
            'hooks/use-test-data-generator.tsx',
            'types/index.ts',
            'app/(tabs)/index.tsx',
            'netlify.toml',
            '.npmrc'
        ];

        let filesOk = 0;
        for (const file of requiredFiles) {
            if (fs.existsSync(path.join(__dirname, file))) {
                console.log(`   ✅ ${file}`);
                filesOk++;
            } else {
                console.log(`   ❌ ${file} - FALTA`);
                this.errors.push(`Archivo requerido faltante: ${file}`);
            }
        }

        this.checks.push({
            name: 'Estructura de Archivos',
            passed: filesOk === requiredFiles.length,
            details: `${filesOk}/${requiredFiles.length} archivos encontrados`
        });

        console.log('');
    }

    async checkConfiguration() {
        console.log('⚙️  Verificando configuración...');

        // Verificar netlify.toml
        try {
            if (fs.existsSync('netlify.toml')) {
                const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
                if (netlifyConfig.includes('[[redirects]]') && netlifyConfig.includes('dist')) {
                    console.log('   ✅ netlify.toml configurado correctamente');
                } else {
                    console.log('   ⚠️  netlify.toml podría estar incompleto');
                    this.warnings.push('Verificar configuración de netlify.toml');
                }
            } else {
                console.log('   ❌ netlify.toml no encontrado');
                this.errors.push('netlify.toml requerido para deploy');
            }
        } catch (error) {
            this.errors.push(`Error verificando netlify.toml: ${error.message}`);
        }

        // Verificar .npmrc
        try {
            if (fs.existsSync('.npmrc')) {
                console.log('   ✅ .npmrc encontrado');
            } else {
                console.log('   ⚠️  .npmrc no encontrado (podría causar problemas de build)');
                this.warnings.push('.npmrc recomendado para builds estables');
            }
        } catch (error) {
            this.warnings.push(`No se pudo verificar .npmrc: ${error.message}`);
        }

        this.checks.push({
            name: 'Configuración',
            passed: fs.existsSync('netlify.toml'),
            details: 'Archivos de configuración básicos'
        });

        console.log('');
    }

    async runUnitTests() {
        console.log('🧪 Ejecutando tests unitarios...');

        try {
            const runner = new TestRunner();
            const results = await runner.runAllTests();

            const successRate = results.total > 0
                ? Math.round((results.passed / results.total) * 100)
                : 0;

            if (successRate >= 90) {
                console.log('   🎉 Tests unitarios: EXCELENTE');
            } else if (successRate >= 75) {
                console.log('   ⚠️  Tests unitarios: ADVERTENCIA');
                this.warnings.push(`Solo ${successRate}% de tests pasan`);
            } else {
                console.log('   ❌ Tests unitarios: CRÍTICO');
                this.errors.push(`Solo ${successRate}% de tests pasan - demasiado bajo`);
            }

            this.checks.push({
                name: 'Tests Unitarios',
                passed: successRate >= 75,
                details: `${results.passed}/${results.total} tests (${successRate}%)`
            });

        } catch (error) {
            console.log('   ❌ Error ejecutando tests unitarios');
            this.errors.push(`Error en tests: ${error.message}`);

            this.checks.push({
                name: 'Tests Unitarios',
                passed: false,
                details: 'Error ejecutando tests'
            });
        }

        console.log('');
    }

    async checkCriticalFunctions() {
        console.log('🔧 Verificando funciones críticas...');

        // Verificar que el data-context exporte las funciones necesarias
        try {
            const dataContextPath = path.join(__dirname, 'hooks', 'data-context.tsx');
            if (fs.existsSync(dataContextPath)) {
                const content = fs.readFileSync(dataContextPath, 'utf8');

                const requiredFunctions = [
                    'crearClub',
                    'crearEquipo',
                    'agregarJugador',
                    'crearTorneo'
                ];

                let functionsFound = 0;
                for (const func of requiredFunctions) {
                    if (content.includes(func)) {
                        functionsFound++;
                    } else {
                        this.warnings.push(`Función ${func} podría no estar disponible`);
                    }
                }

                console.log(`   ✅ ${functionsFound}/${requiredFunctions.length} funciones críticas encontradas`);

                this.checks.push({
                    name: 'Funciones Críticas',
                    passed: functionsFound >= requiredFunctions.length - 1, // Permitir 1 faltante
                    details: `${functionsFound}/${requiredFunctions.length} funciones`
                });
            }
        } catch (error) {
            this.errors.push(`Error verificando funciones: ${error.message}`);
        }

        console.log('');
    }

    async checkDependencies() {
        console.log('📦 Verificando dependencias...');

        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

            const criticalDeps = [
                'expo',
                'react',
                'react-native',
                '@react-native-async-storage/async-storage'
            ];

            let depsOk = 0;
            for (const dep of criticalDeps) {
                if (deps[dep]) {
                    console.log(`   ✅ ${dep}: ${deps[dep]}`);
                    depsOk++;
                } else {
                    console.log(`   ❌ ${dep}: FALTANTE`);
                    this.errors.push(`Dependencia crítica faltante: ${dep}`);
                }
            }

            this.checks.push({
                name: 'Dependencias',
                passed: depsOk === criticalDeps.length,
                details: `${depsOk}/${criticalDeps.length} dependencias críticas`
            });

        } catch (error) {
            this.errors.push(`Error verificando dependencias: ${error.message}`);
        }

        console.log('');
    }

    printFinalReport() {
        console.log('📊 REPORTE FINAL DE VERIFICACIÓN PRE-DEPLOY');
        console.log('═'.repeat(60));

        // Resumen de checks
        const passedChecks = this.checks.filter(c => c.passed).length;
        const totalChecks = this.checks.length;

        console.log(`🎯 Verificaciones: ${passedChecks}/${totalChecks} pasadas\n`);

        // Detalles de cada check
        this.checks.forEach(check => {
            const status = check.passed ? '✅' : '❌';
            console.log(`${status} ${check.name}: ${check.details}`);
        });

        // Advertencias
        if (this.warnings.length > 0) {
            console.log('\n⚠️  ADVERTENCIAS:');
            this.warnings.forEach((warning, i) => {
                console.log(`   ${i + 1}. ${warning}`);
            });
        }

        // Errores
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORES CRÍTICOS:');
            this.errors.forEach((error, i) => {
                console.log(`   ${i + 1}. ${error}`);
            });
        }

        console.log('\n' + '═'.repeat(60));

        // Veredicto final
        const canDeploy = this.shouldAllowDeploy();
        if (canDeploy) {
            console.log('🚀 VEREDICTO: LISTO PARA DEPLOY');
            console.log('   El código ha pasado todas las verificaciones críticas.');
        } else {
            console.log('🚨 VEREDICTO: NO DEPLOYAR');
            console.log('   Hay errores críticos que deben arreglarse primero.');
        }

        console.log('═'.repeat(60));
    }

    shouldAllowDeploy() {
        // No permitir deploy si hay errores críticos
        if (this.errors.length > 0) {
            return false;
        }

        // Verificar que al menos 75% de los checks pasen
        const passedChecks = this.checks.filter(c => c.passed).length;
        const successRate = this.checks.length > 0 ? (passedChecks / this.checks.length) : 0;

        return successRate >= 0.75; // 75% o más
    }
}

// Función principal
async function main() {
    const checker = new PreDeployChecker();
    const canDeploy = await checker.runAllChecks();

    // Salir con código apropiado
    process.exit(canDeploy ? 0 : 1);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Error fatal en verificación:', error);
        process.exit(1);
    });
}

module.exports = { PreDeployChecker };