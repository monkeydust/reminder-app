# Page snapshot

```yaml
- heading "Remindik" [level=1]
- button "👁️"
- button "🌙"
- textbox "Enter your reminder..."
- button "Once"
- button "⟳ Recurring"
- heading "Edit Recurring Reminder" [level=3]
- button "×"
- text: "Reminder:"
- textbox "Reminder:": Updated task text
- text: "Repeat:"
- combobox "Repeat:":
  - option "Daily" [selected]
  - option "Weekly"
  - option "Monthly"
- text: "Time:"
- textbox "Time:": 08:00
- button "Cancel"
- button "Save Changes"
- heading "Recurring Reminders" [level=2]
- list:
  - listitem:
    - text: "Original task ⟳ Daily Next: Saturday, July 19, 2025 at 8:00 AM"
    - button "Edit"
    - button "Delete"
- heading "One-Time Reminders" [level=2]
- list: No one-time reminders yet.
- text: 1 reminder
- button "Clear All"
```