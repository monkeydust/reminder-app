# Remindik Test Cases

## 1. Basic Todo Functionality

### 1.1 Add One-Time Reminders
- **TC001**: Add reminder with text input and "Once" button
- **TC002**: Add reminder by pressing Enter in input field
- **TC003**: Prevent adding empty reminders (show alert)
- **TC004**: Handle maximum character limit (200 chars)
- **TC005**: Clear input field after successful addition

### 1.2 Display and Management
- **TC006**: Display reminders in "One-Time Reminders" section
- **TC007**: Show correct reminder count in stats
- **TC008**: Toggle reminder completion status
- **TC009**: Delete individual reminders
- **TC010**: Clear all reminders with confirmation

### 1.3 Data Persistence
- **TC011**: Save reminders to localStorage
- **TC012**: Load reminders on page refresh
- **TC013**: Maintain state across browser sessions

## 2. Recurring Reminders

### 2.1 Creation
- **TC014**: Open recurring reminder modal
- **TC015**: Create daily recurring reminder
- **TC016**: Create weekly recurring reminder with day selection
- **TC017**: Create monthly recurring reminder
- **TC018**: Set specific time for recurring reminder
- **TC019**: Set start date for recurring reminder
- **TC020**: Validate required fields (text, days for weekly)

### 2.2 Display and Pattern Recognition
- **TC021**: Show recurring reminders in "Recurring Reminders" section
- **TC022**: Display correct recurring pattern text (e.g., "Weekly on Wed")
- **TC023**: Show next due date and time
- **TC024**: Apply green border styling to recurring items
- **TC025**: Hide recurring tasks until due date

### 2.3 Editing
- **TC026**: Open edit modal for existing recurring reminder
- **TC027**: Modify reminder text and save changes
- **TC028**: Change frequency (daily/weekly/monthly)
- **TC029**: Update day selection for weekly reminders
- **TC030**: Change time and recalculate next due date
- **TC031**: Cancel editing without saving changes

### 2.4 Completion and Rescheduling
- **TC032**: Complete recurring task with "Complete & Reschedule"
- **TC033**: Automatically generate next occurrence
- **TC034**: Calculate correct next due date based on frequency
- **TC035**: Show feedback message with next occurrence date
- **TC036**: Move completed instance to one-time section temporarily

## 3. Viewer Mode

### 3.1 Mode Switching
- **TC037**: Enter viewer mode via eye icon
- **TC038**: Exit viewer mode via X button
- **TC039**: Maintain theme setting in viewer mode
- **TC040**: Sync theme toggle between modes

### 3.2 Task Display
- **TC041**: Show next upcoming task for today
- **TC042**: Display task with correct due date/time
- **TC043**: Show recurring pattern information
- **TC044**: Hide tasks not due today
- **TC045**: Handle tasks without specific times

### 3.3 Progressive Animations
- **TC046**: Level 1 animation (2+ hours away) - gentle pulse
- **TC047**: Level 2 animation (1-2 hours) - moderate pulse + glow
- **TC048**: Level 3 animation (30min-1hr) - pulse + shake + glow
- **TC049**: Level 4 animation (15-30min) - intense effects
- **TC050**: Level 5 animation (5-15min) - very intense
- **TC051**: Level 6 animation (0-5min) - extreme intensity
- **TC052**: Overdue animation - maximum intensity + red border

### 3.4 Task Completion
- **TC053**: Show DONE button for due/actionable tasks
- **TC054**: Hide DONE button for future tasks
- **TC055**: Complete task with disappear animation
- **TC056**: Transition to next task with entrance animation
- **TC057**: Show cat celebration when all tasks done

### 3.5 All Done State
- **TC058**: Display large cat emoji when no tasks remain
- **TC059**: Show "All done for today!" celebration message
- **TC060**: Hide reminder card box completely
- **TC061**: Center cat emoji properly in viewport

### 3.6 Test Mode
- **TC062**: Activate test mode via flask icon
- **TC063**: Generate test reminders at different intervals
- **TC064**: Demonstrate animation progression
- **TC065**: Deactivate test mode and restore original tasks
- **TC066**: Show appropriate test mode feedback

## 4. Theme System

### 4.1 Theme Switching
- **TC067**: Toggle between light and dark themes
- **TC068**: Apply theme to all UI components
- **TC069**: Persist theme preference in localStorage
- **TC070**: Load saved theme on application start
- **TC071**: Update theme toggle icon correctly

### 4.2 Theme Coverage
- **TC072**: Apply theme to main interface
- **TC073**: Apply theme to modals (recurring, edit)
- **TC074**: Apply theme to viewer mode
- **TC075**: Apply theme to all animation effects
- **TC076**: Ensure readable contrast in both themes

## 5. Data Management

### 5.1 Storage
- **TC077**: Save todos array to localStorage
- **TC078**: Save theme preference to localStorage
- **TC079**: Handle localStorage quota limits
- **TC080**: Graceful fallback if localStorage unavailable

### 5.2 Data Integrity
- **TC081**: Validate todo object structure
- **TC082**: Handle malformed data in localStorage
- **TC083**: Migrate old data formats if needed
- **TC084**: Preserve data during application updates

## 6. User Experience

### 6.1 Responsive Design
- **TC085**: Display correctly on 1024x600 screen (viewer mode)
- **TC086**: Adapt layout for mobile devices
- **TC087**: Handle different screen orientations
- **TC088**: Maintain usability across viewport sizes

### 6.2 Accessibility
- **TC089**: Keyboard navigation support
- **TC090**: Screen reader compatibility
- **TC091**: High contrast support
- **TC092**: Focus management in modals

### 6.3 Performance
- **TC093**: Fast application startup
- **TC094**: Smooth animations without lag
- **TC095**: Efficient localStorage operations
- **TC096**: Responsive user interactions

## 7. Edge Cases

### 7.1 Error Handling
- **TC097**: Handle corrupted localStorage data
- **TC098**: Manage browser compatibility issues
- **TC099**: Deal with system clock changes
- **TC100**: Handle extreme date/time values

### 7.2 Boundary Conditions
- **TC101**: Maximum number of reminders
- **TC102**: Very long reminder text
- **TC103**: Rapid user interactions
- **TC104**: Multiple browser tabs open
- **TC105**: Page reload during modal operations

## 8. Integration Tests

### 8.1 Workflow Tests
- **TC106**: Complete end-to-end recurring reminder workflow
- **TC107**: Full viewer mode session with multiple tasks
- **TC108**: Theme switching throughout application
- **TC109**: Data persistence across application restart
- **TC110**: Mixed one-time and recurring reminder scenarios