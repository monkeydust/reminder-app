# Remindik - Automated Testing Guide

This document explains how to set up and run automated tests for the Remindik application.

## Overview

The testing framework uses **Playwright** for cross-browser automation testing. It provides comprehensive coverage of all application features including:

- ✅ Basic todo functionality
- ✅ Recurring reminders
- ✅ Viewer mode with animations
- ✅ Theme switching
- ✅ Data persistence
- ✅ Integration workflows
- ✅ Error handling
- ✅ Performance testing

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
node run-tests.js install

# Install Playwright browsers
node run-tests.js browsers
```

### 2. Run All Tests

```bash
# Run all tests (headless)
node run-tests.js test

# Run tests with browser UI (headed mode)
node run-tests.js test:headed
```

### 3. View Results

```bash
# Open HTML test report
node run-tests.js report
```

## Available Test Commands

### Setup Commands
```bash
node run-tests.js install     # Install dependencies
node run-tests.js browsers    # Install Playwright browsers
```

### Test Execution
```bash
node run-tests.js test               # Run all tests (headless)
node run-tests.js test:headed        # Run with browser UI
node run-tests.js test:debug         # Run in debug mode
node run-tests.js test:ui            # Run with Playwright UI
```

### Individual Test Suites
```bash
node run-tests.js test:basic         # Basic functionality (TC001-TC013)
node run-tests.js test:recurring     # Recurring reminders (TC014-TC036)
node run-tests.js test:viewer        # Viewer mode (TC037-TC066)
node run-tests.js test:theme         # Theme system (TC067-TC076)
node run-tests.js test:integration   # Integration tests (TC106-TC110)
```

### Browser-Specific Testing
```bash
node run-tests.js test:chrome        # Chrome only
node run-tests.js test:firefox       # Firefox only
node run-tests.js test:safari        # Safari only
node run-tests.js test:mobile        # Mobile Chrome
```

### Reports and Debug
```bash
node run-tests.js report             # Show HTML report
node run-tests.js help               # Show all commands
```

## Test Structure

### Test Files

| File | Test Cases | Description |
|------|------------|-------------|
| `basic-functionality.spec.js` | TC001-TC013 | Adding, completing, deleting reminders |
| `recurring-reminders.spec.js` | TC014-TC036 | Creating, editing, completing recurring tasks |
| `viewer-mode.spec.js` | TC037-TC066 | Viewer mode, animations, test mode |
| `theme-system.spec.js` | TC067-TC076 | Light/dark theme switching |
| `integration.spec.js` | TC097-TC110 | End-to-end workflows, error handling |

### Test Coverage

The test suite covers **110+ test cases** including:

#### Basic Functionality (13 tests)
- Adding reminders via button and Enter key
- Input validation and character limits
- Completion toggling and deletion
- Data persistence across sessions

#### Recurring Reminders (23 tests)
- Daily, weekly, monthly frequencies
- Day selection for weekly tasks
- Time and date configuration
- Edit functionality
- Automatic rescheduling

#### Viewer Mode (30 tests)
- Mode switching and theme sync
- Progressive animations (6 levels)
- Task completion with animations
- "All done" cat celebration
- Test mode for animation demonstration
- Responsive design

#### Theme System (10 tests)
- Light/dark theme switching
- Component-wide theme application
- Persistence and loading
- Transition effects

#### Integration (34 tests)
- End-to-end workflows
- Cross-browser compatibility
- Error handling and edge cases
- Performance testing
- Data corruption recovery

## Test Configuration

### Browsers Tested
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Mobile Chrome, Mobile Safari
- **Tablet**: iPad Pro

### Viewports Tested
- Desktop: 1440x900, 1024x600
- Mobile: 375x667 (iPhone)
- Tablet: 768x1024 (iPad)

### Test Features
- **Screenshots**: Captured on failure
- **Video Recording**: For failed tests
- **Trace Files**: For debugging
- **Parallel Execution**: For faster runs
- **Retry Logic**: Automatic retry on CI

## Debugging Tests

### Debug Mode
```bash
node run-tests.js test:debug
```
Opens Playwright Inspector for step-by-step debugging.

### UI Mode
```bash
node run-tests.js test:ui
```
Opens Playwright UI for interactive test running.

### Headed Mode
```bash
node run-tests.js test:headed
```
Runs tests with visible browser windows.

### Specific Test Debugging
```bash
# Debug specific test file
npx playwright test tests/viewer-mode.spec.js --debug

# Debug specific test case
npx playwright test tests/basic-functionality.spec.js -g "TC001" --debug
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd reminder
          node run-tests.js install
          node run-tests.js browsers
      - name: Run tests
        run: |
          cd reminder
          node run-tests.js test
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: reminder/test-results/
```

## Test Data Management

### Clean State
Each test starts with a clean state:
- localStorage is cleared
- No existing reminders
- Light theme (default)

### Test Isolation
Tests are fully isolated and can run in parallel without interference.

### Mock Data
Tests create their own test data and clean up automatically.

## Advanced Usage

### Custom Test Runs
```bash
# Run specific test pattern
npx playwright test -g "recurring"

# Run with specific project
npx playwright test --project=chromium

# Run with custom timeout
npx playwright test --timeout=60000
```

### Configuration Override
```bash
# Run with custom config
npx playwright test --config=custom-playwright.config.js
```

### Environment Variables
```bash
# Set headless mode
HEADED=true node run-tests.js test

# Set browser
BROWSER=firefox node run-tests.js test
```

## Troubleshooting

### Common Issues

#### Browser Installation
```bash
# If browsers fail to install
npx playwright install --force
```

#### Permission Issues (Windows)
```bash
# Run as administrator if needed
# Or check Windows Defender exclusions
```

#### Port Conflicts
Tests use file:// protocol, so no port conflicts should occur.

#### Timeout Issues
```bash
# Increase timeout for slow systems
npx playwright test --timeout=120000
```

### Getting Help

1. **View Test Results**: `node run-tests.js report`
2. **Debug Failed Tests**: `node run-tests.js test:debug`
3. **Check Configuration**: Review `playwright.config.js`
4. **Verify Setup**: Ensure browsers are installed correctly

## Test Maintenance

### Adding New Tests
1. Create test file in `tests/` directory
2. Follow existing naming conventions
3. Update test documentation
4. Add to appropriate test suite

### Updating Tests
1. Maintain test ID references (TC001, etc.)
2. Update expected behaviors
3. Verify cross-browser compatibility
4. Update documentation

### Performance Monitoring
Tests include performance assertions to catch regressions:
- Load time monitoring
- Animation performance
- Theme switching speed
- Large dataset handling

## Best Practices

1. **Test Independence**: Each test can run alone
2. **Clear Assertions**: Use descriptive expect statements
3. **Wait Strategies**: Use proper waiting for dynamic content
4. **Error Handling**: Test both success and failure paths
5. **Cross-Browser**: Verify compatibility across browsers
6. **Responsive**: Test on different viewport sizes
7. **Accessibility**: Include accessibility checks where relevant

For more information about specific test cases, see `tests/test-cases.md`.