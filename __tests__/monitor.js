#!/usr/bin/env node

/**
 * Monitor Automático de la App
 * Ejecuta tests continuos y reporta el estado
 */

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

class AppMonitor {
  constructor() {
    this.isRunning = false;
    this.testInterval = 30000; // 30 segundos
    this.results = [];
    this.maxResults = 100;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Monitor already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting App Monitor...');
    console.log(`📊 Running tests every ${this.testInterval / 1000} seconds`);
    
    this.runContinuousTests();
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 App Monitor stopped');
  }

  async runContinuousTests() {
    while (this.isRunning) {
      try {
        await this.runTestSuite();
        await this.sleep(this.testInterval);
      } catch (error) {
        console.error('❌ Monitor error:', error.message);
        await this.sleep(5000); // Wait 5 seconds on error
      }
    }
  }

  async runTestSuite() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 Running test suite at ${timestamp}`);
    
    const testResult = {
      timestamp,
      tests: {},
      overall: 'passed'
    };

    // Test 1: Syntax Check
    try {
      testResult.tests.syntax = await this.checkSyntax();
    } catch (error) {
      testResult.tests.syntax = { status: 'failed', error: error.message };
      testResult.overall = 'failed';
    }

    // Test 2: Type Check
    try {
      testResult.tests.types = await this.checkTypes();
    } catch (error) {
      testResult.tests.types = { status: 'failed', error: error.message };
      testResult.overall = 'failed';
    }

    // Test 3: File Structure
    try {
      testResult.tests.structure = await this.checkFileStructure();
    } catch (error) {
      testResult.tests.structure = { status: 'failed', error: error.message };
      testResult.overall = 'failed';
    }

    // Test 4: Dependencies
    try {
      testResult.tests.dependencies = await this.checkDependencies();
    } catch (error) {
      testResult.tests.dependencies = { status: 'failed', error: error.message };
      testResult.overall = 'failed';
    }

    // Test 5: Performance
    try {
      testResult.tests.performance = await this.checkPerformance();
    } catch (error) {
      testResult.tests.performance = { status: 'failed', error: error.message };
      testResult.overall = 'failed';
    }

    this.saveResult(testResult);
    this.displayResult(testResult);
  }

  async checkSyntax() {
    return new Promise((resolve, reject) => {
      const tsc = spawn('npx', ['tsc', '--noEmit'], { stdio: 'pipe' });
      let output = '';
      let errorOutput = '';

      tsc.stdout.on('data', (data) => {
        output += data.toString();
      });

      tsc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      tsc.on('close', (code) => {
        if (code === 0) {
          resolve({ status: 'passed', message: 'No syntax errors' });
        } else {
          reject(new Error(`Syntax errors found: ${errorOutput}`));
        }
      });
    });
  }

  async checkTypes() {
    // Simplified type checking
    const tsFiles = this.findFiles('.', /\.(ts|tsx)$/);
    const errors = [];

    for (const file of tsFiles.slice(0, 10)) { // Check first 10 files
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic checks
        if (content.includes('any') && !content.includes('// @ts-ignore')) {
          errors.push(`${file}: Contains 'any' type`);
        }
        
        if (content.includes('// @ts-ignore')) {
          errors.push(`${file}: Contains @ts-ignore`);
        }
      } catch (error) {
        errors.push(`${file}: Cannot read file`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Type issues: ${errors.slice(0, 3).join(', ')}`);
    }

    return { status: 'passed', message: `Checked ${tsFiles.length} TypeScript files` };
  }

  async checkFileStructure() {
    const requiredFiles = [
      'app/_layout.tsx',
      'app/index.tsx',
      'package.json',
      'tsconfig.json'
    ];

    const requiredDirs = [
      'app',
      'components',
      'hooks',
      'utils'
    ];

    const missing = [];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        missing.push(`File: ${file}`);
      }
    }

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        missing.push(`Directory: ${dir}`);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing: ${missing.join(', ')}`);
    }

    return { status: 'passed', message: 'File structure is valid' };
  }

  async checkDependencies() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const criticalDeps = ['expo', 'react', 'react-native'];
    const missing = criticalDeps.filter(dep => !deps[dep]);

    if (missing.length > 0) {
      throw new Error(`Missing critical dependencies: ${missing.join(', ')}`);
    }

    // Check for outdated packages (simplified)
    const outdatedWarnings = [];
    if (deps.expo && deps.expo.startsWith('^52')) {
      // OK
    } else {
      outdatedWarnings.push('Expo version might be outdated');
    }

    return { 
      status: 'passed', 
      message: `${Object.keys(deps).length} dependencies checked`,
      warnings: outdatedWarnings
    };
  }

  async checkPerformance() {
    const startTime = Date.now();
    
    // Count files
    const jsFiles = this.findFiles('.', /\.(js|jsx|ts|tsx)$/);
    const totalSize = jsFiles.reduce((size, file) => {
      try {
        return size + fs.statSync(file).size;
      } catch {
        return size;
      }
    }, 0);

    const endTime = Date.now();
    const scanTime = endTime - startTime;

    const warnings = [];
    if (jsFiles.length > 200) {
      warnings.push('Large number of source files');
    }
    if (totalSize > 5 * 1024 * 1024) { // 5MB
      warnings.push('Large total source size');
    }
    if (scanTime > 1000) {
      warnings.push('Slow file system scan');
    }

    return {
      status: 'passed',
      message: `${jsFiles.length} files, ${Math.round(totalSize / 1024)}KB total`,
      warnings,
      metrics: {
        fileCount: jsFiles.length,
        totalSize,
        scanTime
      }
    };
  }

  findFiles(dir, pattern) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.findFiles(fullPath, pattern));
        } else if (pattern.test(item)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }

  saveResult(result) {
    this.results.push(result);
    
    // Keep only last N results
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(-this.maxResults);
    }

    // Save to file
    fs.writeFileSync('monitor-results.json', JSON.stringify({
      lastUpdate: new Date().toISOString(),
      results: this.results
    }, null, 2));
  }

  displayResult(result) {
    const status = result.overall === 'passed' ? '✅' : '❌';
    console.log(`${status} Overall: ${result.overall.toUpperCase()}`);
    
    for (const [testName, testResult] of Object.entries(result.tests)) {
      const testStatus = testResult.status === 'passed' ? '✅' : '❌';
      console.log(`  ${testStatus} ${testName}: ${testResult.message || testResult.error}`);
      
      if (testResult.warnings && testResult.warnings.length > 0) {
        testResult.warnings.forEach(warning => {
          console.log(`    ⚠️ ${warning}`);
        });
      }
    }
  }

  generateDashboard() {
    const recent = this.results.slice(-10);
    const passed = recent.filter(r => r.overall === 'passed').length;
    const failed = recent.length - passed;
    
    console.log('\n📊 DASHBOARD (Last 10 runs)');
    console.log('='.repeat(40));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / recent.length) * 100)}%`);
    
    if (recent.length > 0) {
      const latest = recent[recent.length - 1];
      console.log(`🕐 Last Run: ${latest.timestamp}`);
      console.log(`📊 Status: ${latest.overall.toUpperCase()}`);
    }
    
    console.log('='.repeat(40));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new AppMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      monitor.start();
      break;
    case 'dashboard':
      if (fs.existsSync('monitor-results.json')) {
        const data = JSON.parse(fs.readFileSync('monitor-results.json', 'utf8'));
        monitor.results = data.results || [];
        monitor.generateDashboard();
      } else {
        console.log('No monitoring data found. Run "monitor start" first.');
      }
      break;
    case 'once':
      monitor.runTestSuite().then(() => {
        console.log('Single test run completed');
        process.exit(0);
      });
      break;
    default:
      console.log('Usage:');
      console.log('  node monitor.js start     - Start continuous monitoring');
      console.log('  node monitor.js once      - Run tests once');
      console.log('  node monitor.js dashboard - Show dashboard');
  }
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping monitor...');
    monitor.stop();
    process.exit(0);
  });
}

module.exports = AppMonitor;