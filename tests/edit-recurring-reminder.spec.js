const { test, expect } = require('@playwright/test');

test.describe('Edit Recurring Reminder Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + require('path').join(__dirname, '..', 'index.html'));
    await page.evaluate(() => localStorage.clear());
    await page.waitForSelector('#todoInput');
  });

  test('TC026: Open edit modal for existing recurring reminder', async ({ page }) => {
    // First create a recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Original task');
    await page.selectOption('#recurringFreq', 'daily');
    await page.fill('#recurringTime', '09:00');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Verify recurring reminder was created
    await expect(page.locator('#recurringList .recurring-item')).toHaveCount(1);
    await expect(page.locator('.recurring-text')).toHaveText('Original task');
    
    // Click edit button to open edit modal
    await page.click('.edit-recurring-btn');
    
    // Verify edit modal opens
    await expect(page.locator('#editRecurringModal')).toBeVisible();
    await expect(page.locator('#editRecurringText')).toBeFocused();
  });

  test('TC027: Modify reminder text and save changes', async ({ page }) => {
    // Create a recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Original task');
    await page.selectOption('#recurringFreq', 'daily');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    
    // Verify current values are loaded
    await expect(page.locator('#editRecurringText')).toHaveValue('Original task');
    await expect(page.locator('#editRecurringFreq')).toHaveValue('daily');
    
    // Modify the text
    await page.fill('#editRecurringText', 'Updated task text');
    
    // Save changes
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Recurring reminder updated successfully!');
      await dialog.accept();
    });
    
    await page.click('#saveEditRecurring');
    
    // Verify changes were saved
    await expect(page.locator('.recurring-text')).toHaveText('Updated task text');
  });

  test('TC028: Change frequency (daily to weekly)', async ({ page }) => {
    // Create a daily recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Daily task');
    await page.selectOption('#recurringFreq', 'daily');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    
    // Change frequency from daily to weekly
    await page.selectOption('#editRecurringFreq', 'weekly');
    
    // Verify day selector appears for weekly
    await expect(page.locator('#editDaySelector')).toBeVisible();
    
    // Select a day (Wednesday)
    await page.click('.edit-day-btn[data-day="3"]');
    
    // Save changes
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#saveEditRecurring');
    
    // Verify frequency change reflected in display
    await expect(page.locator('.recurring-pattern')).toContainText('Weekly on Wed');
  });

  test('TC029: Update day selection for weekly reminders', async ({ page }) => {
    // Create a weekly recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Weekly meeting');
    await page.selectOption('#recurringFreq', 'weekly');
    await page.click('[data-day="1"]'); // Monday
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Verify initial day selection
    await expect(page.locator('.recurring-pattern')).toContainText('Weekly on Mon');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    
    // Verify current day is selected
    await expect(page.locator('.edit-day-btn[data-day="1"]')).toHaveClass(/selected/);
    
    // Change day selection from Monday to Friday
    await page.click('.edit-day-btn[data-day="1"]'); // Deselect Monday
    await page.click('.edit-day-btn[data-day="5"]'); // Select Friday
    
    // Save changes
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#saveEditRecurring');
    
    // Verify day change reflected in display
    await expect(page.locator('.recurring-pattern')).toContainText('Weekly on Fri');
  });

  test('TC030: Change time and recalculate next due date', async ({ page }) => {
    // Create a recurring reminder with specific time
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Morning task');
    await page.selectOption('#recurringFreq', 'daily');
    await page.fill('#recurringTime', '08:00');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    
    // Verify current time is loaded
    await expect(page.locator('#editRecurringTime')).toHaveValue('08:00');
    
    // Change time to afternoon
    await page.fill('#editRecurringTime', '15:30');
    
    // Save changes
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#saveEditRecurring');
    
    // Verify time change is reflected (check that next due date updated)
    const nextDueText = await page.locator('.next-due').textContent();
    expect(nextDueText).toContain('3:30'); // Should show new time in next due
  });

  test('TC031: Cancel editing without saving changes', async ({ page }) => {
    // Create a recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Original task');
    await page.selectOption('#recurringFreq', 'daily');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Open edit modal and make changes
    await page.click('.edit-recurring-btn');
    await page.fill('#editRecurringText', 'Changed text that should not save');
    await page.selectOption('#editRecurringFreq', 'weekly');
    
    // Cancel without saving
    await page.click('#cancelEditRecurring');
    
    // Verify modal is closed
    await expect(page.locator('#editRecurringModal')).not.toBeVisible();
    
    // Verify original text remains unchanged
    await expect(page.locator('.recurring-text')).toHaveText('Original task');
    await expect(page.locator('.recurring-pattern')).toContainText('Daily');
  });

  test('TC032: Validate required fields in edit modal', async ({ page }) => {
    // Create a recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Test task');
    await page.selectOption('#recurringFreq', 'weekly');
    await page.click('[data-day="2"]'); // Tuesday
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    
    // Try to save with empty text
    await page.fill('#editRecurringText', '');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please enter a reminder text!');
      await dialog.accept();
    });
    
    await page.click('#saveEditRecurring');
    
    // Verify modal stays open and original text remains
    await expect(page.locator('#editRecurringModal')).toBeVisible();
    
    // Fix the text and try weekly without days
    await page.fill('#editRecurringText', 'Fixed text');
    
    // Deselect all days
    await page.click('.edit-day-btn[data-day="2"]'); // Deselect Tuesday
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Please select at least one day of the week!');
      await dialog.accept();
    });
    
    await page.click('#saveEditRecurring');
    
    // Verify modal stays open
    await expect(page.locator('#editRecurringModal')).toBeVisible();
  });

  test('TC033: Edit modal pre-populates with current values', async ({ page }) => {
    // Create a complex recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Complex weekly task');
    await page.selectOption('#recurringFreq', 'weekly');
    await page.click('[data-day="1"]'); // Monday
    await page.click('[data-day="3"]'); // Wednesday  
    await page.click('[data-day="5"]'); // Friday
    await page.fill('#recurringTime', '14:45');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    
    // Verify all current values are pre-populated
    await expect(page.locator('#editRecurringText')).toHaveValue('Complex weekly task');
    await expect(page.locator('#editRecurringFreq')).toHaveValue('weekly');
    await expect(page.locator('#editRecurringTime')).toHaveValue('14:45');
    
    // Verify day selections are preserved
    await expect(page.locator('.edit-day-btn[data-day="1"]')).toHaveClass(/selected/);
    await expect(page.locator('.edit-day-btn[data-day="3"]')).toHaveClass(/selected/);
    await expect(page.locator('.edit-day-btn[data-day="5"]')).toHaveClass(/selected/);
    
    // Verify non-selected days are not selected
    await expect(page.locator('.edit-day-btn[data-day="0"]')).not.toHaveClass(/selected/);
    await expect(page.locator('.edit-day-btn[data-day="2"]')).not.toHaveClass(/selected/);
  });

  test('TC034: Edit monthly recurring reminder', async ({ page }) => {
    // Create a monthly recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Monthly report');
    await page.selectOption('#recurringFreq', 'monthly');
    await page.fill('#recurringTime', '10:00');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Verify monthly reminder created
    await expect(page.locator('.recurring-pattern')).toContainText('Monthly');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    
    // Verify monthly frequency is loaded
    await expect(page.locator('#editRecurringFreq')).toHaveValue('monthly');
    
    // Verify day selector is hidden for monthly
    await expect(page.locator('#editDaySelector')).not.toBeVisible();
    
    // Change text and time
    await page.fill('#editRecurringText', 'Updated monthly report');
    await page.fill('#editRecurringTime', '16:00');
    
    // Save changes
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#saveEditRecurring');
    
    // Verify changes saved
    await expect(page.locator('.recurring-text')).toHaveText('Updated monthly report');
    await expect(page.locator('.recurring-pattern')).toContainText('Monthly');
  });

  test('TC035: Close edit modal with X button', async ({ page }) => {
    // Create a recurring reminder
    await page.click('#recurringBtn');
    await page.fill('#recurringText', 'Test task');
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.click('#createRecurring');
    
    // Open edit modal
    await page.click('.edit-recurring-btn');
    await expect(page.locator('#editRecurringModal')).toBeVisible();
    
    // Make some changes
    await page.fill('#editRecurringText', 'Should not save');
    
    // Close with X button
    await page.click('#closeEditModal');
    
    // Verify modal closed and changes not saved
    await expect(page.locator('#editRecurringModal')).not.toBeVisible();
    await expect(page.locator('.recurring-text')).toHaveText('Test task');
  });
});