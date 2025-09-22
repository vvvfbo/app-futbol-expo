#!/usr/bin/env node

/**
 * 🧹 LIMPIADOR DE PROYECTO - App Futbol Expo
 * ==========================================
 * 
 * Este script identifica y elimina archivos innecesarios para optimizar el proyecto
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.cyan}${colors.bright}🧹 ${msg}${colors.reset}\n`)
};

class ProjectCleaner {
    constructor() {
        this.filesToDelete = [];
        this.duplicateTests = [];
        this.obsoleteFiles = [];
        this.stats = {
            deleted: 0,
            skipped: 0,
            spaceSaved: 0
        };
    }

    async analyzeProject() {
        log.header('ANALIZANDO PROYECTO PARA LIMPIEZA');

        // 1. Identificar archivos de test duplicados/obsoletos
        await this.findDuplicateTestFiles();

        // 2. Identificar archivos temporales
        await this.findTemporaryFiles();

        // 3. Identificar archivos de configuración obsoletos
        await this.findObsoleteConfigFiles();

        // 4. Generar reporte
        this.generateCleanupReport();
    }

    async findDuplicateTestFiles() {
        log.info('Buscando archivos de test duplicados...');

        // Archivos de test que parecen duplicados o innecesarios
        const testPatterns = [
            'check-and-run-tests.js',
            'comprehensive-test-runner.js',
            'create-amistosos-data.js',
            'create-amistosos-sample-data.js',
            'create-sample-data.js',
            'demo-torneos-test.js',
            'execute-comprehensive-test.js',
            'execute-comprehensive-tests.js',
            'execute-simple-tester.js',
            'execute-test-now.js',
            'execute-tester.js',
            'execute-tests-final.js',
            'execute-tests-now.js',
            'execute-tests-simple.js',
            'execute-tests.js',
            'execute-torneos-test.js',
            'run-all-tests.js',
            'run-amistosos-setup.js',
            'run-comprehensive-test.js',
            'run-comprehensive-tester.js',
            'run-final-tests.js',
            'run-jest-simple.js',
            'run-quick-test.js',
            'run-simple-test.js',
            'run-test-now.js',
            'run-test.js',
            'run-tester-simple.js',
            'run-tester.js',
            'run-tests-simple.js',
            'run-tests.js',
            'run-torneos-comprehensive-test.js',
            'run-torneos-test.js',
            'setup-amistosos-data.js',
            'setup-amistosos-debug.js',
            'setup-amistosos-simple.js',
            'setup-amistosos-test.js',
            'setup-testing.js',
            'setup-torneos-test.js',
            'simple-test-runner.js',
            'simple-test.js',
            'test-runner.js'
        ];

        for (const pattern of testPatterns) {
            if (fs.existsSync(pattern)) {
                const stats = fs.statSync(pattern);
                this.duplicateTests.push({
                    file: pattern,
                    size: stats.size,
                    reason: 'Archivo de test duplicado/obsoleto'
                });
            }
        }

        log.info(`Encontrados ${this.duplicateTests.length} archivos de test para eliminar`);
    }

    async findTemporaryFiles() {
        log.info('Buscando archivos temporales...');

        const tempPatterns = [
            'metro.config.js', // Si existe y está vacío/problemático
            '*.tmp',
            '*.log',
            '.DS_Store',
            'Thumbs.db'
        ];

        // Verificar metro.config.js si existe
        if (fs.existsSync('metro.config.js')) {
            const content = fs.readFileSync('metro.config.js', 'utf8').trim();
            if (content.length < 100) { // Archivo muy pequeño, probablemente problemático
                const stats = fs.statSync('metro.config.js');
                this.obsoleteFiles.push({
                    file: 'metro.config.js',
                    size: stats.size,
                    reason: 'Archivo de configuración Metro problemático/vacío'
                });
            }
        }
    }

    async findObsoleteConfigFiles() {
        log.info('Buscando archivos de configuración obsoletos...');

        // Verificar archivos de configuración que podrían no ser necesarios
        const configFiles = [
            'jest.config.js', // Si no estás usando Jest activamente
            'eslint.config.js' // Si está duplicado con otras configuraciones
        ];

        for (const file of configFiles) {
            if (fs.existsSync(file)) {
                // Verificar si realmente se necesita
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('// TODO') || content.length < 50) {
                    const stats = fs.statSync(file);
                    this.obsoleteFiles.push({
                        file,
                        size: stats.size,
                        reason: 'Archivo de configuración incompleto o no utilizado'
                    });
                }
            }
        }
    }

    generateCleanupReport() {
        log.header('REPORTE DE LIMPIEZA');

        const allFiles = [...this.duplicateTests, ...this.obsoleteFiles];

        if (allFiles.length === 0) {
            log.success('¡El proyecto ya está limpio! No se encontraron archivos innecesarios.');
            return;
        }

        console.log(`${colors.yellow}📊 ARCHIVOS IDENTIFICADOS PARA ELIMINACIÓN:${colors.reset}\n`);

        let totalSize = 0;

        // Mostrar archivos de test duplicados
        if (this.duplicateTests.length > 0) {
            console.log(`${colors.magenta}📝 ARCHIVOS DE TEST DUPLICADOS/OBSOLETOS:${colors.reset}`);
            this.duplicateTests.forEach((item, index) => {
                totalSize += item.size;
                console.log(`   ${index + 1}. ${item.file} (${this.formatBytes(item.size)})`);
                console.log(`      └─ ${item.reason}`);
            });
            console.log();
        }

        // Mostrar archivos obsoletos
        if (this.obsoleteFiles.length > 0) {
            console.log(`${colors.cyan}🗑️  ARCHIVOS OBSOLETOS:${colors.reset}`);
            this.obsoleteFiles.forEach((item, index) => {
                totalSize += item.size;
                console.log(`   ${index + 1}. ${item.file} (${this.formatBytes(item.size)})`);
                console.log(`      └─ ${item.reason}`);
            });
            console.log();
        }

        console.log(`${colors.bright}📈 RESUMEN:${colors.reset}`);
        console.log(`   • Total archivos: ${allFiles.length}`);
        console.log(`   • Espacio a liberar: ${this.formatBytes(totalSize)}`);
        console.log(`   • Tests duplicados: ${this.duplicateTests.length}`);
        console.log(`   • Archivos obsoletos: ${this.obsoleteFiles.length}`);

        console.log(`\n${colors.bright}🎯 ARCHIVOS IMPORTANTES A MANTENER:${colors.reset}`);
        console.log(`   ✅ super-test-completo.js - Nuestro test principal`);
        console.log(`   ✅ ejecutar-super-test.bat - Script de ejecución`);
        console.log(`   ✅ start-direct.bat - Script de inicio de la app`);
        console.log(`   ✅ Todos los archivos .tsx/.ts del código fuente`);

        this.showCleanupInstructions(allFiles);
    }

    showCleanupInstructions(files) {
        console.log(`\n${colors.bright}🚀 INSTRUCCIONES DE LIMPIEZA:${colors.reset}`);
        console.log(`\n${colors.green}OPCIÓN 1 - Eliminación Automática (Recomendado):${colors.reset}`);
        console.log(`   node limpiar-proyecto.js --delete`);

        console.log(`\n${colors.yellow}OPCIÓN 2 - Eliminación Manual:${colors.reset}`);
        files.forEach(item => {
            console.log(`   del "${item.file}"`);
        });

        console.log(`\n${colors.blue}OPCIÓN 3 - Crear Backup antes de eliminar:${colors.reset}`);
        console.log(`   node limpiar-proyecto.js --backup`);

        console.log(`\n${colors.cyan}💡 BENEFICIOS DE LA LIMPIEZA:${colors.reset}`);
        console.log(`   • Proyecto más limpio y organizado`);
        console.log(`   • Menor tamaño de repositorio`);
        console.log(`   • Menos archivos de test confusos`);
        console.log(`   • Mejor rendimiento de build`);
        console.log(`   • Mantenimiento más fácil`);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async executeCleanup(mode = 'preview') {
        const allFiles = [...this.duplicateTests, ...this.obsoleteFiles];

        if (mode === 'delete') {
            log.header('EJECUTANDO LIMPIEZA');

            for (const item of allFiles) {
                try {
                    if (fs.existsSync(item.file)) {
                        fs.unlinkSync(item.file);
                        log.success(`Eliminado: ${item.file}`);
                        this.stats.deleted++;
                        this.stats.spaceSaved += item.size;
                    } else {
                        log.warning(`Ya no existe: ${item.file}`);
                        this.stats.skipped++;
                    }
                } catch (error) {
                    log.error(`Error eliminando ${item.file}: ${error.message}`);
                }
            }

            console.log(`\n${colors.bright}🎉 LIMPIEZA COMPLETADA:${colors.reset}`);
            console.log(`   • Archivos eliminados: ${this.stats.deleted}`);
            console.log(`   • Archivos omitidos: ${this.stats.skipped}`);
            console.log(`   • Espacio liberado: ${this.formatBytes(this.stats.spaceSaved)}`);

        } else if (mode === 'backup') {
            log.header('CREANDO BACKUP ANTES DE LIMPIAR');

            const backupDir = 'backup-archivos-' + new Date().toISOString().slice(0, 10);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir);
            }

            for (const item of allFiles) {
                if (fs.existsSync(item.file)) {
                    const backupPath = path.join(backupDir, item.file);
                    fs.copyFileSync(item.file, backupPath);
                    log.info(`Backup creado: ${backupPath}`);
                }
            }

            log.success(`Backup completado en: ${backupDir}`);
            console.log(`Ahora ejecuta: node limpiar-proyecto.js --delete`);
        }
    }
}

// Ejecutar el limpiador
if (require.main === module) {
    const cleaner = new ProjectCleaner();
    const mode = process.argv[2];

    cleaner.analyzeProject().then(() => {
        if (mode === '--delete') {
            cleaner.executeCleanup('delete');
        } else if (mode === '--backup') {
            cleaner.executeCleanup('backup');
        }
        // Por defecto solo muestra el análisis
    }).catch(error => {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = ProjectCleaner;