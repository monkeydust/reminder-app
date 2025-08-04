#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Test runner script for Remindik application
 * Provides easy commands to run different test suites
 */

const COMMANDS = {
  'install': 'npm install',
  'browsers': 'npx playwright install',
  'test': 'npx playwright test',
  'test:headed': 'npx playwright test --headed',
  'test:debug': 'npx playwright test --debug',
  'test:ui': 'npx playwright test --ui',
  'test:basic': 'npx playwright test tests/basic-functionality.spec.js',
  'test:recurring': 'npx playwright test tests/recurring-reminders.spec.js',
  'test:viewer': 'npx playwright test tests/viewer-mode.spec.js',
  'test:theme': 'npx playwright test tests/theme-system.spec.js',
  'test:integration': 'npx playwright test tests/integration.spec.js',
  'test:chrome': 'npx playwright test --project=chromium',
  'test:firefox': 'npx playwright test --project=firefox',
  'test:safari': 'npx playwright test --project=webkit',
  'test:mobile': 'npx playwright test --project="Mobile Chrome"',
  'report': 'npx playwright show-report playwright-report',
  'help': 'show help'
};

function showHelp() {
  console.log('🧪 Remindik Test Runner\n');
  console.log('Available commands:');
  console.log('');
  
  console.log('Setup:');
  console.log('  install              Install dependencies');
  console.log('  browsers             Install Playwright browsers');
  console.log('');
  
  console.log('Run Tests:');
  console.log('  test                 Run all tests (headless)');
  console.log('  test:headed          Run all tests with browser UI');
  console.log('  test:debug           Run tests in debug mode');
  console.log('  test:ui              Run tests with Playwright UI');
  console.log('');
  
  console.log('Test Suites:');
  console.log('  test:basic           Run basic functionality tests');
  console.log('  test:recurring       Run recurring reminders tests');
  console.log('  test:viewer          Run viewer mode tests');
  console.log('  test:theme           Run theme system tests');
  console.log('  test:integration     Run integration tests');
  console.log('');
  
  console.log('Browser Specific:');
  console.log('  test:chrome          Run tests in Chrome only');
  console.log('  test:firefox         Run tests in Firefox only');
  console.log('  test:safari          Run tests in Safari only');
  console.log('  test:mobile          Run tests in mobile Chrome');
  console.log('');
  
  console.log('Reports:');
  console.log('  report               Show test report');
  console.log('  help                 Show this help');
  console.log('');
  
  console.log('Examples:');
  console.log('  node run-tests.js install');
  console.log('  node run-tests.js browsers');
  console.log('  node run-tests.js test');
  console.log('  node run-tests.js test:basic --headed');
  console.log('  node run-tests.js test:viewer --project=chromium');
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${command} ${args.join(' ')}\n`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ Command completed successfully\n`);
        resolve(code);
      } else {
        console.log(`\n❌ Command failed with exit code ${code}\n`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`\n❌ Error running command: ${error.message}\n`);
      reject(error);
    });
  });
}

async function checkSetup() {
  const packageJsonExists = fs.existsSync(path.join(__dirname, 'package.json'));
  const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
  
  if (!packageJsonExists) {
    console.log('❌ package.json not found. Please run setup first.');
    return false;
  }
  
  if (!nodeModulesExists) {
    console.log('⚠️  node_modules not found. Run "node run-tests.js install" first.');
    return false;
  }
  
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const extraArgs = args.slice(1);
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  if (!COMMANDS[command]) {
    console.log(`❌ Unknown command: ${command}`);
    console.log('Run "node run-tests.js help" to see available commands.');
    return;
  }
  
  // Special commands that don't need setup check
  if (command === 'install' || command === 'help') {
    const [cmd, ...cmdArgs] = COMMANDS[command].split(' ');
    await runCommand(cmd, [...cmdArgs, ...extraArgs]);
    return;
  }
  
  // Check if setup is complete for other commands
  if (command !== 'install' && !(await checkSetup())) {
    return;
  }
  
  try {
    const [cmd, ...cmdArgs] = COMMANDS[command].split(' ');
    await runCommand(cmd, [...cmdArgs, ...extraArgs]);
    
    // Show report hint after running tests
    if (command.startsWith('test') && command !== 'test:debug' && command !== 'test:ui') {
      console.log('💡 To view detailed results, run: node run-tests.js report');
    }
    
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n⚠️  Test execution interrupted');
  process.exit(1);
});

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});