class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.lastSyncTime = localStorage.getItem('lastSyncTime') || 0;
        this.syncInProgress = false;
        this.testDayOffset = 0;
        this.testInterval = null;
        this.weatherData = null;
        this.lastWeatherUpdate = 0;
        this.selectedDays = [];
        this.demoTask = null;
        this.demoStage = 0;
        this.demoStages = null;
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadQuotes(); // Initialize quotes
        this.render();
        
        // Sync with server on startup
        this.syncWithServer();
        
        // Set up periodic sync every 2 seconds for faster updates
        setInterval(() => {
            this.syncWithServer();
        }, 2000);
    }
    
    bindElements() {
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.recurringList = document.getElementById('recurringList');
        this.todoCount = document.getElementById('todoCount');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        
        // New segmented control elements
        this.nowBtn = document.getElementById('nowBtn');
        this.dateBtn = document.getElementById('dateBtn');
        this.recurringBtn = document.getElementById('recurringBtn');
        
        // Action buttons for each type
        this.addNowBtn = document.getElementById('addNowBtn');
        this.addDateBtn = document.getElementById('addDateBtn');
        this.addRecurringBtn = document.getElementById('addRecurringBtn');
        
        // Date picker elements
        this.scheduledDate = document.getElementById('scheduledDate');
        this.scheduledTime = document.getElementById('scheduledTime');
        
        // Control containers
        this.nowControls = document.getElementById('nowControls');
        this.dateControls = document.getElementById('dateControls');
        this.recurringControls = document.getElementById('recurringControls');
        
        // Existing modal elements
        this.recurringModal = document.getElementById('recurringModal');
        this.recurringText = document.getElementById('recurringText');
        this.recurringFreq = document.getElementById('recurringFreq');
        this.daySelector = document.getElementById('daySelector');
        this.recurringTime = document.getElementById('recurringTime');
        this.startDate = document.getElementById('startDate');
        this.closeModal = document.getElementById('closeModal');
        this.cancelRecurring = document.getElementById('cancelRecurring');
        this.createRecurring = document.getElementById('createRecurring');
        
        // Viewer mode elements
        this.viewerToggle = document.getElementById('viewerToggle');
        this.viewerMode = document.getElementById('viewerMode');
        this.exitViewer = document.getElementById('exitViewer');
        this.nextReminder = document.getElementById('nextReminder');
        this.doneBtn = document.getElementById('doneBtn');
        this.allDoneSection = document.getElementById('allDoneSection');
        this.testMode = document.getElementById('testMode');
        
        // Debug: Check if elements are found
        console.log('Element binding check:');
        console.log('exitViewer:', this.exitViewer);
        console.log('testMode:', this.testMode);
        
        
        
        
        
        // Edit modal elements
        this.editRecurringModal = document.getElementById('editRecurringModal');
        this.editRecurringText = document.getElementById('editRecurringText');
        this.editRecurringFreq = document.getElementById('editRecurringFreq');
        this.editDaySelector = document.getElementById('editDaySelector');
        this.editRecurringTime = document.getElementById('editRecurringTime');
        this.closeEditModal = document.getElementById('closeEditModal');
        this.cancelEditRecurring = document.getElementById('cancelEditRecurring');
        this.saveEditRecurringBtn = document.getElementById('saveEditRecurring');
        this.editTimeMinusBtn = document.getElementById('editTimeMinusBtn');
        this.editTimePlusBtn = document.getElementById('editTimePlusBtn');
        
        this.selectedDays = [];
        this.editSelectedDays = [];
        this.isViewerMode = false;
        this.isTestMode = false;
        this.currentViewerTask = null;
        this.timeInterval = null;
        this.currentEditingId = null;
        this.originalTodos = null;
        this.quotes = null;
        this.isCompletingTask = false; // Guard against rapid double-clicks
    }
    
    bindEvents() {
        // Segmented control events
        this.nowBtn.addEventListener('click', () => this.switchReminderType('now'));
        this.dateBtn.addEventListener('click', () => this.switchReminderType('date'));
        this.recurringBtn.addEventListener('click', () => this.switchReminderType('recurring'));
        
        // Action button events
        this.addNowBtn.addEventListener('click', () => this.addTodo());
        this.addDateBtn.addEventListener('click', () => this.addScheduledReminder());
        this.addRecurringBtn.addEventListener('click', () => this.addRecurringReminder());
        
        // Quick date button events
        document.querySelectorAll('.quick-date').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickDate(e));
        });
        
        // Recurring form events
        this.recurringFreq.addEventListener('change', () => this.updateDaySelector());
        
        // Day selector button events
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleDay(e));
        });
        
        // Enter key support
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleEnterKey();
        });
        
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Viewer mode events
        this.viewerToggle.addEventListener('click', () => this.toggleViewerMode());
        
        if (this.exitViewer) {
            this.exitViewer.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Exit viewer button clicked');
                this.exitViewerMode();
            });
            // Add additional event for safety
            this.exitViewer.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Exit viewer button touched');
                this.exitViewerMode();
            });
        } else {
            console.error('Exit viewer button not found!');
        }
        
        // Fullscreen button event
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        this.doneBtn.addEventListener('click', () => this.completeViewerTask());
        
        if (this.testMode) {
            this.testMode.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Test mode button clicked');
                this.toggleTestMode();
            });
            // Add additional event for safety
            this.testMode.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Test mode button touched');
                this.toggleTestMode();
            });
        } else {
            console.error('Test mode button not found!');
        }

        
        
        
        
        
        // Edit modal events
        this.closeEditModal.addEventListener('click', () => this.closeEditRecurringModal());
        this.cancelEditRecurring.addEventListener('click', () => this.closeEditRecurringModal());
        this.saveEditRecurringBtn.addEventListener('click', () => this.saveEditRecurring());
        this.editRecurringFreq.addEventListener('change', () => this.updateEditDaySelector());
        
        // Time adjustment buttons
        this.editTimeMinusBtn.addEventListener('click', () => this.adjustEditTime(-15));
        this.editTimePlusBtn.addEventListener('click', () => this.adjustEditTime(15));
        
        // Add keyboard shortcuts for edit modal
        this.editRecurringModal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target === this.editRecurringText || e.target === this.editRecurringTime)) {
                e.preventDefault();
                this.saveEditRecurring();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.closeEditRecurringModal();
            }
        });
        
        // Legacy modal event handlers removed - now using inline form
        
        // Legacy modal click handlers removed
        
        // Legacy day selector events - removed to avoid conflicts
        
        // Weather expansion events
        this.bindWeatherExpansionEvents();
    }
    
    bindWeatherExpansionEvents() {
        // Add event listeners for weather card expansion
        const weatherDisplay = document.querySelector('.weather-display');
        const weatherCurrent = document.querySelector('.weather-current');
        const forecastView = document.querySelector('.weather-forecast-view');
        
        if (weatherDisplay && weatherCurrent && forecastView) {
            let isExpanded = false;
            let autoHideTimer = null;
            
            const showForecast = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                if (isExpanded) return;
                
                // Hide current weather content and remove grey background
                weatherCurrent.style.display = 'none';
                weatherDisplay.style.background = 'none';
                weatherDisplay.style.border = 'none';
                weatherDisplay.style.backdropFilter = 'none';
                forecastView.classList.remove('hidden');
                forecastView.classList.add('visible');
                
                isExpanded = true;
                
                // Set 10-second auto-hide timer
                autoHideTimer = setTimeout(() => {
                    hideForecast();
                }, 10000);
                
                console.log('Forecast shown, auto-hide in 5 seconds');
            };
            
            const hideForecast = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                if (!isExpanded) return;
                
                // Clear timer if manual hide
                if (autoHideTimer) {
                    clearTimeout(autoHideTimer);
                    autoHideTimer = null;
                }
                
                // Hide forecast and restore weather display styling
                forecastView.classList.remove('visible');
                forecastView.classList.add('hidden');
                weatherCurrent.style.display = 'block';
                weatherDisplay.style.background = 'rgba(255, 255, 255, 0.1)';
                weatherDisplay.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                weatherDisplay.style.backdropFilter = 'blur(10px)';
                
                isExpanded = false;
                
                console.log('Forecast hidden');
            };
            
            // Make the weather card clickable
            weatherDisplay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!isExpanded) {
                    showForecast(e);
                } else {
                    hideForecast(e);
                }
            });
            weatherDisplay.style.cursor = 'pointer';
        }
    }
    
    bindDayButtons() {
        document.querySelectorAll('.day-btn:not(.edit-day-btn)').forEach(btn => {
            btn.addEventListener('click', () => this.toggleDaySelection(btn));
        });
        
        document.querySelectorAll('.edit-day-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleEditDaySelection(btn));
        });
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') {
            alert('Please enter a reminder!');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            isRecurring: false
        };
        
        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }
    
    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    
    clearAll() {
        if (this.todos.length === 0) {
            alert('No reminders to clear!');
            return;
        }
        
        if (confirm('Are you sure you want to clear all reminders?')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    clearCompleted() {
        // Prevent multiple rapid clicks
        if (this.clearCompletedBtn.disabled) return;
        
        const completedTodos = this.todos.filter(todo => todo.completed);
        
        if (completedTodos.length === 0) {
            alert('No completed reminders to clear!');
            return;
        }
        
        // Disable button temporarily
        this.clearCompletedBtn.disabled = true;
        
        if (confirm(`Are you sure you want to clear ${completedTodos.length} completed reminder${completedTodos.length === 1 ? '' : 's'}?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }
        
        // Re-enable button after a short delay
        setTimeout(() => {
            this.clearCompletedBtn.disabled = false;
        }, 500);
    }

    // New segmented control methods
    switchReminderType(type) {
        // Update active button
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(type + 'Btn').classList.add('active');
        
        // Show appropriate controls
        document.querySelectorAll('.creation-controls').forEach(control => control.classList.remove('active'));
        document.getElementById(type + 'Controls').classList.add('active');
        
        // Set default date/time for date picker
        if (type === 'date') {
            this.setDefaultDateTime();
        } else if (type === 'recurring') {
            this.setDefaultStartDate();
            this.updateDaySelector();
        }
        
        // Update placeholder text based on type
        const placeholders = {
            now: 'Create a task for right now...',
            date: 'Schedule a reminder for later...',
            recurring: 'Set up a recurring reminder...'
        };
        this.todoInput.placeholder = placeholders[type];
    }

    setDefaultDateTime() {
        // Set default date to today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        this.scheduledDate.value = todayStr;
        
        // Set default time to next hour
        const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
        const timeStr = nextHour.toTimeString().split(' ')[0].substring(0, 5);
        this.scheduledTime.value = timeStr;
    }

    handleQuickDate(e) {
        const btn = e.target;
        const hours = btn.dataset.hours;
        const dateType = btn.dataset.date;
        
        // Remove selected class from all quick date buttons
        document.querySelectorAll('.quick-date').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const now = new Date();
        let targetDate = new Date();
        
        if (hours) {
            // Set time based on hours from now
            targetDate = new Date(now.getTime() + parseInt(hours) * 60 * 60 * 1000);
        } else if (dateType === 'today') {
            targetDate = new Date(now);
            targetDate.setHours(now.getHours() + 1, 0, 0, 0); // Next hour, on the hour
        } else if (dateType === 'tomorrow') {
            targetDate = new Date(now);
            targetDate.setDate(now.getDate() + 1);
            targetDate.setHours(9, 0, 0, 0); // 9 AM tomorrow
        } else if (dateType === 'weekend') {
            targetDate = new Date(now);
            const daysUntilSaturday = (6 - now.getDay()) % 7 || 7;
            targetDate.setDate(now.getDate() + daysUntilSaturday);
            targetDate.setHours(10, 0, 0, 0); // 10 AM Saturday
        }
        
        // Update date and time inputs
        this.scheduledDate.value = targetDate.toISOString().split('T')[0];
        this.scheduledTime.value = targetDate.toTimeString().split(' ')[0].substring(0, 5);
    }

    handleEnterKey() {
        // Determine which action to take based on active type
        const activeBtn = document.querySelector('.type-btn.active');
        const type = activeBtn.dataset.type;
        
        if (type === 'now') {
            this.addTodo();
        } else if (type === 'date') {
            this.addScheduledReminder();
        } else if (type === 'recurring') {
            this.addRecurringReminder();
        }
    }

    addScheduledReminder() {
        const text = this.todoInput.value.trim();
        if (!text) {
            alert('Please enter a reminder text');
            return;
        }
        
        const date = this.scheduledDate.value;
        const time = this.scheduledTime.value;
        
        if (!date || !time) {
            alert('Please select both date and time');
            return;
        }
        
        // Create scheduled reminder
        const scheduledDateTime = new Date(`${date}T${time}`);
        const now = new Date();
        
        if (scheduledDateTime <= now) {
            alert('Please select a future date and time');
            return;
        }
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: now.toISOString(),
            scheduledFor: scheduledDateTime.toISOString(),
            type: 'scheduled'
        };
        
        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
        
        // Clear quick date selection
        document.querySelectorAll('.quick-date').forEach(btn => btn.classList.remove('selected'));
        
        console.log('Scheduled reminder created:', todo);
    }

    addRecurringReminder() {
        const text = this.todoInput.value.trim();
        if (!text) {
            alert('Please enter a reminder text');
            return;
        }
        
        const frequency = this.recurringFreq.value;
        const time = this.recurringTime.value;
        const startDate = new Date(this.startDate.value);
        
        if (frequency === 'weekly' && this.selectedDays.length === 0) {
            alert('Please select at least one day of the week!');
            return;
        }
        
        const recurringTask = {
            id: Date.now(),
            text: text,
            completed: false,
            isRecurring: true,
            frequency: frequency,
            time: time,
            days: frequency === 'weekly' ? [...this.selectedDays] : [],
            startDate: startDate.toISOString(),
            nextDue: this.calculateNextDue(frequency, this.selectedDays, startDate, time),
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(recurringTask);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
        
        // Reset form
        this.selectedDays = [];
        this.updateDaySelector();
        this.setDefaultStartDate();
        
        this.showSuccessMessage(`Recurring reminder created! Next: ${this.formatDate(new Date(recurringTask.nextDue))}`);
    }
    
    toggleDay(e) {
        console.log('toggleDay called', e.target.dataset.day);
        const day = parseInt(e.target.dataset.day);
        const index = this.selectedDays.indexOf(day);
        
        if (index > -1) {
            this.selectedDays.splice(index, 1);
        } else {
            this.selectedDays.push(day);
        }
        
        console.log('selectedDays:', this.selectedDays);
        this.updateDayButtons();
    }
    
    updateDayButtons() {
        console.log('updateDayButtons called, selectedDays:', this.selectedDays);
        document.querySelectorAll('.day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            if (this.selectedDays.includes(day)) {
                console.log('Adding selected class to day:', day);
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    openRecurringModal() {
        const text = this.todoInput.value.trim();
        if (text) {
            this.recurringText.value = text;
        }
        this.recurringModal.style.display = 'block';
    }
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        // Also push to server (async, don't wait)
        this.pushToServer().catch(error => console.error('Background sync failed:', error));
    }
    
    render() {
        this.renderRecurringTasks();
        this.renderOneTimeTasks();
        this.updateStats();
    }
    
    renderRecurringTasks() {
        this.recurringList.innerHTML = '';
        
        const recurringTasks = this.todos.filter(todo => todo.isRecurring && !todo.completed);
        
        if (recurringTasks.length === 0) {
            this.recurringList.innerHTML = '<div class="empty-message">No recurring reminders yet.</div>';
        } else {
            recurringTasks.forEach(todo => {
                const todoItem = this.createRecurringElement(todo);
                this.recurringList.appendChild(todoItem);
            });
        }
    }
    
    renderOneTimeTasks() {
        this.todoList.innerHTML = '';
        
        const oneTimeTasks = this.todos.filter(todo => {
            // Handle non-recurring tasks - show ALL of them in the list
            if (!todo.isRecurring) {
                return true; // Show all immediate and scheduled tasks
            }
            
            // Show recurring tasks that are due or completed
            if (todo.isRecurring && todo.completed) return true;
            if (todo.isRecurring && todo.nextDue) {
                const dueDate = new Date(todo.nextDue);
                const now = new Date();
                return dueDate <= now;
            }
            return false;
        });
        
        // Sort tasks: immediate tasks first, then by scheduled time
        oneTimeTasks.sort((a, b) => {
            // If one has scheduledFor and the other doesn't, prioritize immediate tasks
            if (a.scheduledFor && !b.scheduledFor) return 1;
            if (!a.scheduledFor && b.scheduledFor) return -1;
            
            // If both are scheduled, sort by time
            if (a.scheduledFor && b.scheduledFor) {
                return new Date(a.scheduledFor) - new Date(b.scheduledFor);
            }
            
            // Default sort by creation time
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        if (oneTimeTasks.length === 0) {
            this.todoList.innerHTML = '<div class="empty-message">No reminders yet.</div>';
        } else {
            oneTimeTasks.forEach(todo => {
                const todoItem = this.createTodoElement(todo);
                this.todoList.appendChild(todoItem);
            });
        }
    }
    
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        let typeInfo = '';
        if (todo.isRecurring) {
            const nextDue = todo.nextDue ? new Date(todo.nextDue) : null;
            const recurringText = this.getRecurringText(todo);
            
            typeInfo = `
                <div class="recurring-indicator">
                    ⟳ ${recurringText}
                </div>
                ${nextDue && !todo.completed ? `<div class="next-occurrence">Next: ${this.formatDate(nextDue)}</div>` : ''}
            `;
        } else if (todo.scheduledFor) {
            const scheduledDate = new Date(todo.scheduledFor);
            const now = new Date();
            const isOverdue = scheduledDate < now && !todo.completed;
            
            typeInfo = `
                <div class="scheduled-indicator ${isOverdue ? 'overdue' : ''}">
                    📅 ${this.formatScheduledTime(scheduledDate)}
                </div>
            `;
        } else if (todo.type === 'now' || !todo.type) {
            typeInfo = `
                <div class="immediate-indicator">
                    ⚡ Immediate task
                </div>
            `;
        }
        
        const actions = todo.isRecurring ? `
            <button class="complete-recurring-btn" onclick="todoApp.completeRecurringTask(${todo.id})">
                Complete & Reschedule
            </button>
            <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                Delete
            </button>
        ` : `
            <button class="complete-btn" onclick="todoApp.toggleComplete(${todo.id})">
                ${todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                Delete
            </button>
        `;
        
        li.innerHTML = `
            <div class="todo-content">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                ${typeInfo}
            </div>
            <div class="todo-actions">
                ${actions}
            </div>
        `;
        
        return li;
    }

    formatScheduledTime(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (targetDate.getTime() === today.getTime()) {
            return `Today at ${timeStr}`;
        } else if (targetDate.getTime() === tomorrow.getTime()) {
            return `Tomorrow at ${timeStr}`;
        } else {
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            return `${dateStr} at ${timeStr}`;
        }
    }
    
    getRecurringText(todo) {
        if (todo.frequency === 'daily') {
            return 'Daily';
        } else if (todo.frequency === 'weekly') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            // Sort days chronologically (Sunday = 0, Monday = 1, etc.)
            const sortedDays = [...todo.days].sort((a, b) => a - b);
            const selectedDays = sortedDays.map(day => dayNames[day]).join(', ');
            return `Weekly on ${selectedDays}`;
        } else if (todo.frequency === 'monthly') {
            return 'Monthly';
        }
        return 'Recurring';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateStats() {
        const totalCount = this.todos.length;
        const completedCount = this.todos.filter(todo => todo.completed).length;
        const pendingCount = totalCount - completedCount;
        
        let statsText = '';
        if (totalCount === 0) {
            statsText = '0 reminders';
        } else if (totalCount === 1) {
            statsText = '1 reminder';
        } else {
            statsText = `${totalCount} reminders`;
        }
        
        if (completedCount > 0 && pendingCount > 0) {
            statsText += ` (${completedCount} completed, ${pendingCount} pending)`;
        } else if (completedCount > 0) {
            statsText += ` (all completed)`;
        }
        
        this.todoCount.textContent = statsText;
        this.clearAllBtn.disabled = totalCount === 0;
    }
    
    // Recurring task methods
    openRecurringModal() {
        // Pre-populate with main input text if it has content
        const mainInputText = this.todoInput.value.trim();
        if (mainInputText) {
            this.recurringText.value = mainInputText;
            // Clear the main input since we're moving it to recurring
            this.todoInput.value = '';
        }
        
        this.recurringModal.style.display = 'block';
        this.setDefaultStartDate();
        this.updateDaySelector();
        this.recurringText.focus();
        
        // If we pre-populated text, select it for easy editing
        if (mainInputText) {
            this.recurringText.select();
        }
    }
    
    closeRecurringModal() {
        this.recurringModal.style.display = 'none';
        this.resetRecurringForm();
    }
    
    resetRecurringForm() {
        this.recurringText.value = '';
        this.recurringFreq.value = 'weekly';
        this.recurringTime.value = '08:00';
        this.selectedDays = [];
        this.updateDaySelector();
    }
    
    setDefaultStartDate() {
        const today = new Date();
        this.startDate.value = today.toISOString().split('T')[0];
    }
    
    updateDaySelector() {
        const frequency = this.recurringFreq.value;
        this.daySelector.style.display = frequency === 'weekly' ? 'block' : 'none';
        
        // Don't auto-select any days - let user choose multiple days
        this.updateDayButtons();
    }
    
    updateDayButtons() {
        document.querySelectorAll('.day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            if (this.selectedDays.includes(day)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
    
    toggleDaySelection(btn) {
        const day = parseInt(btn.dataset.day);
        const index = this.selectedDays.indexOf(day);
        
        if (index > -1) {
            this.selectedDays.splice(index, 1);
        } else {
            this.selectedDays.push(day);
        }
        
        this.updateDayButtons();
    }
    
    createRecurringTask() {
        const text = this.recurringText.value.trim();
        if (text === '') {
            alert('Please enter a reminder text!');
            return;
        }
        
        const frequency = this.recurringFreq.value;
        const time = this.recurringTime.value;
        const startDate = new Date(this.startDate.value);
        
        if (frequency === 'weekly' && this.selectedDays.length === 0) {
            alert('Please select at least one day of the week!');
            return;
        }
        
        const recurringTask = {
            id: Date.now(),
            text: text,
            completed: false,
            isRecurring: true,
            frequency: frequency,
            time: time,
            days: frequency === 'weekly' ? [...this.selectedDays] : [],
            startDate: startDate.toISOString(),
            nextDue: this.calculateNextDue(frequency, this.selectedDays, startDate, time),
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(recurringTask);
        this.saveTodos();
        this.render();
        this.closeRecurringModal();
        
        this.showSuccessMessage(`Recurring reminder created! Next: ${this.formatDate(new Date(recurringTask.nextDue))}`);
    }
    
    calculateNextDue(frequency, days, startDate, time) {
        const [hours, minutes] = time.split(':').map(Number);
        let nextDue = new Date(startDate);
        nextDue.setHours(hours, minutes, 0, 0);
        
        if (frequency === 'daily') {
            const now = new Date();
            if (nextDue <= now) {
                nextDue.setDate(nextDue.getDate() + 1);
            }
        } else if (frequency === 'weekly') {
            const currentDay = nextDue.getDay();
            const sortedDays = [...days].sort((a, b) => a - b);
            
            let targetDay = sortedDays.find(day => day >= currentDay);
            if (!targetDay) {
                targetDay = sortedDays[0];
                nextDue.setDate(nextDue.getDate() + 7);
            }
            
            const daysToAdd = targetDay - currentDay;
            nextDue.setDate(nextDue.getDate() + daysToAdd);
            
            const now = new Date();
            if (nextDue <= now) {
                nextDue.setDate(nextDue.getDate() + 7);
            }
        } else if (frequency === 'monthly') {
            const now = new Date();
            if (nextDue <= now) {
                nextDue.setMonth(nextDue.getMonth() + 1);
            }
        }
        
        return nextDue.toISOString();
    }
    
    completeRecurringTask(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo || !todo.isRecurring) return;

        // Check if this task is already completed (prevent double-completion)
        if (todo.completed) {
            console.log('Task already completed, skipping duplicate completion');
            return;
        }

        todo.completed = true;
        todo.completedAt = new Date().toISOString();

        // Check if an uncompleted task with the same pattern already exists
        const existingActive = this.todos.find(t =>
            t.id !== id &&
            t.isRecurring &&
            !t.completed &&
            t.text === todo.text &&
            t.frequency === todo.frequency &&
            JSON.stringify(t.days) === JSON.stringify(todo.days) &&
            t.time === todo.time
        );

        if (existingActive) {
            console.log('Active recurring task already exists, not creating duplicate');
            this.saveTodos();
            this.render();
            this.showSuccessMessage('Task completed!');
            return;
        }

        const nextDue = this.calculateNextOccurrence(todo);
        const nextTask = {
            ...todo,
            id: Date.now(),
            completed: false,
            nextDue: nextDue.toISOString(),
            completedAt: null,
            createdAt: new Date().toISOString()
        };

        this.todos.push(nextTask);
        this.saveTodos();
        this.render();

        this.showSuccessMessage(`Task completed! Next: ${this.formatDate(nextDue)}`);
    }
    
    calculateNextOccurrence(todo) {
        const [hours, minutes] = todo.time.split(':').map(Number);
        const now = new Date();
        let nextDue = new Date(now);
        nextDue.setHours(hours, minutes, 0, 0);
        
        if (todo.frequency === 'daily') {
            nextDue.setDate(nextDue.getDate() + 1);
        } else if (todo.frequency === 'weekly') {
            const currentDay = nextDue.getDay();
            const sortedDays = [...todo.days].sort((a, b) => a - b);
            
            let targetDay = sortedDays.find(day => day > currentDay);
            if (!targetDay) {
                targetDay = sortedDays[0];
                nextDue.setDate(nextDue.getDate() + 7);
            }
            
            const daysToAdd = targetDay - currentDay;
            nextDue.setDate(nextDue.getDate() + daysToAdd);
        } else if (todo.frequency === 'monthly') {
            nextDue.setMonth(nextDue.getMonth() + 1);
        }
        
        return nextDue;
    }
    
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }
    
    createRecurringElement(todo) {
        const li = document.createElement('li');
        li.className = 'recurring-item';
        
        const nextDue = todo.nextDue ? new Date(todo.nextDue) : null;
        const recurringText = this.getRecurringText(todo);
        const isDue = nextDue && nextDue <= new Date();
        
        li.innerHTML = `
            <div class="recurring-content">
                <span class="recurring-text">${this.escapeHtml(todo.text)}</span>
                <div class="recurring-info">
                    <span class="recurring-pattern">⟳ ${recurringText}</span>
                    ${nextDue ? `<span class="next-due ${isDue ? 'due-now' : ''}">
                        Next: ${this.formatDate(nextDue)}
                    </span>` : ''}
                </div>
            </div>
            <div class="recurring-actions">
                <button class="edit-recurring-btn" onclick="todoApp.editRecurring(${todo.id})">
                    Edit
                </button>
                <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                    Delete
                </button>
            </div>
        `;
        
        return li;
    }
    
    editRecurring(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo || !todo.isRecurring) return;
        
        this.currentEditingId = id;
        this.editRecurringText.value = todo.text;
        this.editRecurringFreq.value = todo.frequency;
        this.editRecurringTime.value = todo.time;
        this.editSelectedDays = [...todo.days];
        
        this.updateEditDaySelector();
        this.editRecurringModal.style.display = 'block';
        this.editRecurringText.focus();
    }
    
    closeEditRecurringModal() {
        this.editRecurringModal.style.display = 'none';
        this.currentEditingId = null;
        this.editSelectedDays = [];
        
        // Reset form fields
        this.editRecurringText.value = '';
        this.editRecurringFreq.value = 'weekly';
        this.editRecurringTime.value = '08:00';
        this.updateEditDayButtons();
    }
    
    updateEditDaySelector() {
        const frequency = this.editRecurringFreq.value;
        this.editDaySelector.style.display = frequency === 'weekly' ? 'block' : 'none';
        
        // If switching to weekly and no days selected, don't auto-select
        if (frequency === 'weekly' && this.editSelectedDays.length === 0) {
            // Keep empty - user must manually select days
        }
        
        this.updateEditDayButtons();
    }
    
    updateEditDayButtons() {
        document.querySelectorAll('.edit-day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            if (this.editSelectedDays.includes(day)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
    
    toggleEditDaySelection(btn) {
        const day = parseInt(btn.dataset.day);
        const index = this.editSelectedDays.indexOf(day);
        
        if (index > -1) {
            this.editSelectedDays.splice(index, 1);
        } else {
            this.editSelectedDays.push(day);
        }
        
        this.updateEditDayButtons();
    }
    
    saveEditRecurring() {
        if (!this.currentEditingId) return;
        
        const text = this.editRecurringText.value.trim();
        if (text === '') {
            alert('Please enter a reminder text!');
            return;
        }
        
        const frequency = this.editRecurringFreq.value;
        const time = this.editRecurringTime.value;
        
        if (frequency === 'weekly' && this.editSelectedDays.length === 0) {
            alert('Please select at least one day of the week!');
            return;
        }
        
        const todo = this.todos.find(t => t.id === this.currentEditingId);
        if (!todo) return;
        
        // Update the recurring task
        todo.text = text;
        todo.frequency = frequency;
        todo.time = time;
        todo.days = frequency === 'weekly' ? [...this.editSelectedDays] : [];
        
        // Recalculate next due date using current date as starting point
        const now = new Date();
        // For weekly tasks, use the updated days array
        const daysToUse = frequency === 'weekly' ? [...this.editSelectedDays] : [];
        todo.nextDue = this.calculateNextDue(frequency, daysToUse, now, time);
        
        this.saveTodos();
        this.render();
        
        // Close modal before showing alert
        this.closeEditRecurringModal();
        
        // Show brief success feedback instead of alert
        this.showSuccessMessage('Recurring reminder updated!');
    }
    
    showSuccessMessage(message) {
        // Create or get existing success message element
        let successMsg = document.getElementById('successMessage');
        if (!successMsg) {
            successMsg = document.createElement('div');
            successMsg.id = 'successMessage';
            successMsg.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--success-color);
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                font-size: 14px;
                font-weight: 600;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(successMsg);
        }
        
        successMsg.textContent = message;
        successMsg.style.opacity = '1';
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            successMsg.style.opacity = '0';
        }, 2000);
    }
    
    adjustEditTime(minutes) {
        const timeInput = this.editRecurringTime;
        const currentTime = timeInput.value;
        
        if (!currentTime) return;
        
        // Parse current time
        const [hours, mins] = currentTime.split(':').map(Number);
        
        // Create date object for easier time manipulation
        const date = new Date();
        date.setHours(hours, mins, 0, 0);
        
        // Add/subtract minutes
        date.setMinutes(date.getMinutes() + minutes);
        
        // Format back to HH:MM
        const newHours = date.getHours().toString().padStart(2, '0');
        const newMins = date.getMinutes().toString().padStart(2, '0');
        
        timeInput.value = `${newHours}:${newMins}`;
        
        // Trigger change event for any listeners
        timeInput.dispatchEvent(new Event('change'));
    }
    
    // Viewer Mode Methods
    toggleViewerMode() {
        if (this.isViewerMode) {
            this.exitViewerMode();
        } else {
            this.enterViewerMode();
        }
    }
    
    enterViewerMode() {
        this.isViewerMode = true;
        this.viewerMode.classList.remove('hidden');
        document.body.classList.add('viewer-active'); // Add class to hide scrollbars
        document.documentElement.classList.add('viewer-active'); // Add to HTML element too
        this.updateViewerContent();
        this.startTimeUpdate();
        
    }
    
    exitViewerMode() {
        this.isViewerMode = false;
        this.viewerMode.classList.add('hidden');
        document.body.classList.remove('viewer-active'); // Remove class to restore scrollbars
        document.documentElement.classList.remove('viewer-active'); // Remove from HTML element too
        this.currentViewerTask = null;
        this.stopTimeUpdate();
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.log(`Error attempting to exit fullscreen: ${err.message}`);
            });
        }
    }

    
    updateViewerContent() {
        const nextTask = this.getNextTaskForToday();
        const reminderCard = this.nextReminder.querySelector('.reminder-card');
        const reminderText = this.nextReminder.querySelector('.reminder-text');
        const reminderTime = this.nextReminder.querySelector('.reminder-time');
        const reminderType = this.nextReminder.querySelector('.reminder-type');
        
        if (nextTask) {
            this.currentViewerTask = nextTask;
            this.nextReminder.style.display = 'flex';
            this.allDoneSection.classList.add('hidden');
            
            reminderText.textContent = nextTask.text;
            
            // Handle time display for both recurring (nextDue) and scheduled (scheduledFor) tasks
            const taskTime = nextTask.nextDue || nextTask.scheduledFor;
            
            if (taskTime) {
                const dueDate = new Date(taskTime);
                const now = new Date();
                const timeDiff = dueDate.getTime() - now.getTime();
                
                // Use appropriate formatting based on task type
                if (nextTask.scheduledFor) {
                    reminderTime.textContent = this.formatScheduledTime(dueDate);
                } else {
                    reminderTime.textContent = this.formatDate(dueDate);
                }
                
                if (nextTask.isRecurring) {
                    reminderType.textContent = `⟳ ${this.getRecurringText(nextTask)}`;
                } else {
                    reminderType.textContent = 'Scheduled';
                }
                
                // Apply progressive animation based on timing
                reminderCard.className = 'reminder-card';
                const animationLevel = this.calculateAnimationLevel(timeDiff);
                reminderCard.classList.add(`level-${animationLevel}`);
                
                if (timeDiff <= 0) {
                    // Task is overdue - calculate overdue level
                    const overdueMinutes = Math.abs(timeDiff) / (1000 * 60);
                    const overdueLevel = this.calculateOverdueLevel(overdueMinutes);
                    reminderCard.classList.remove(`level-${animationLevel}`);
                    reminderCard.classList.add(`overdue-${overdueLevel}`);
                    this.doneBtn.classList.remove('hidden');
                } else if (timeDiff <= 600000) { // 10 minutes
                    this.doneBtn.classList.remove('hidden');
                } else {
                    this.doneBtn.classList.add('hidden');
                }
            } else {
                reminderTime.textContent = 'No specific time';
                reminderType.textContent = nextTask.isRecurring ? `⟳ ${this.getRecurringText(nextTask)}` : 'Immediate';
                reminderCard.className = 'reminder-card level-1';
                this.doneBtn.classList.remove('hidden'); // Always show for non-timed tasks
            }
        } else {
            // No tasks for today - show cat
            this.showAllDoneSection();
        }
    }
    
    async showAllDoneSection() {
        this.currentViewerTask = null;
        this.nextReminder.style.display = 'none';
        this.allDoneSection.classList.remove('hidden');
        this.doneBtn.classList.add('hidden');
        
        // Update quote display
        await this.updateDailyQuote();
    }

    async updateDailyQuote() {
        // Ensure quotes are loaded first
        await this.loadQuotes();
        
        const dailyQuote = this.getDailyQuote();
        
        console.log('Updating daily quote:', dailyQuote);
        
        // Update weather display instead of emoji
        await this.updateWeatherDisplay();
        
        
        // Remove the old static message
        const staticMessage = this.allDoneSection.querySelector('.all-done-text p');
        if (staticMessage && staticMessage.textContent.includes('Great job completing')) {
            staticMessage.remove();
        }
        
        // Find or create quote elements
        let quoteText = this.allDoneSection.querySelector('.daily-quote-text');
        let quoteAuthor = this.allDoneSection.querySelector('.daily-quote-author');
        
        if (!quoteText) {
            // Create quote elements if they don't exist
            const allDoneText = this.allDoneSection.querySelector('.all-done-text');
            if (allDoneText) {
                quoteText = document.createElement('div');
                quoteText.className = 'daily-quote-text';
                quoteAuthor = document.createElement('div');
                quoteAuthor.className = 'daily-quote-author';
                
                allDoneText.appendChild(quoteText);
                allDoneText.appendChild(quoteAuthor);
            }
        }
        
        if (quoteText && quoteAuthor) {
            quoteText.textContent = `"${dailyQuote.text}"`;
            quoteAuthor.textContent = `— ${dailyQuote.author} (${dailyQuote.year})`;
        }
    }
    
    getNextTaskForToday() {
        // In test mode, return demo task with simulated overdue time
        if (this.isTestMode && this.demoTask) {
            const demoTaskCopy = { ...this.demoTask };
            // Simulate the task being overdue by the current demo stage minutes
            const overdueMinutes = this.demoStages[this.demoStage];
            const scheduledTime = new Date();
            scheduledTime.setMinutes(scheduledTime.getMinutes() - overdueMinutes);
            demoTaskCopy.scheduledFor = scheduledTime.toISOString();
            return demoTaskCopy;
        }
        
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayTasks = this.todos.filter(todo => {
            if (todo.completed) return false;
            
            if (todo.isRecurring && todo.nextDue) {
                const dueDate = new Date(todo.nextDue);
                // Only show recurring tasks at or after their due time (never before)
                return dueDate <= now;
            }
            
            // Handle non-recurring tasks
            if (!todo.isRecurring) {
                // If it has a scheduled time, only show if due
                if (todo.scheduledFor) {
                    const scheduledDate = new Date(todo.scheduledFor);
                    return scheduledDate <= now;
                }
                // Show immediate tasks right away
                return true;
            }
            
            return false;
        });
        
        // Sort by next due date or creation date
        todayTasks.sort((a, b) => {
            if (a.nextDue && b.nextDue) {
                return new Date(a.nextDue) - new Date(b.nextDue);
            }
            if (a.nextDue) return -1;
            if (b.nextDue) return 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        return todayTasks[0] || null;
    }
    
    getNextUpcomingTask() {
        const now = new Date();
        const upcomingTasks = this.todos.filter(todo => {
            if (todo.completed) return false;
            
            if (todo.isRecurring && todo.nextDue) {
                return new Date(todo.nextDue) > now;
            }
            
            return !todo.isRecurring;
        });
        
        // Sort by next due date or creation date
        upcomingTasks.sort((a, b) => {
            if (a.nextDue && b.nextDue) {
                return new Date(a.nextDue) - new Date(b.nextDue);
            }
            if (a.nextDue) return -1;
            if (b.nextDue) return 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        return upcomingTasks[0] || null;
    }
    
    completeViewerTask() {
        if (!this.currentViewerTask) return;

        // Prevent multiple rapid clicks - check if already completing
        if (this.isCompletingTask) {
            console.log('Already completing a task, ignoring click');
            return;
        }
        this.isCompletingTask = true;

        const taskToComplete = this.currentViewerTask;
        const reminderCard = this.nextReminder.querySelector('.reminder-card');

        // Add completion animation
        reminderCard.classList.add('completing');

        // Complete the task after animation
        setTimeout(() => {
            if (taskToComplete.isRecurring) {
                this.completeRecurringTask(taskToComplete.id);
            } else {
                this.toggleComplete(taskToComplete.id);
            }

            // Update viewer content after completion
            setTimeout(() => {
                reminderCard.classList.remove('completing');
                this.updateViewerContent();
                this.isCompletingTask = false; // Allow new completions

                // Add entrance animation to next task
                const newReminderCard = this.nextReminder.querySelector('.reminder-card');
                if (newReminderCard && !this.allDoneSection.classList.contains('hidden')) {
                    // If showing cat, no entrance animation needed
                } else if (newReminderCard) {
                    newReminderCard.classList.add('entering');
                    setTimeout(() => {
                        newReminderCard.classList.remove('entering');
                    }, 500);
                }
            }, 100);
        }, 600);
    }
    
    startTimeUpdate() {
        this.updateViewerDateTime(); // Initial update
        this.timeInterval = setInterval(() => {
            this.updateViewerContent(); // Refresh task status
            this.updateViewerDateTime(); // Update date/time display
        }, 1000);
    }

    stopTimeUpdate() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }

    updateViewerDateTime() {
        const dateTimeElement = document.getElementById('viewerDateTime');
        if (!dateTimeElement) return;

        const now = new Date();
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        dateTimeElement.textContent = now.toLocaleString('en-US', options);
    }
    
    calculateAnimationLevel(timeDiff) {
        // Progressive animation levels based on time remaining (not overdue)
        if (timeDiff <= 600000) return 3; // 10 minutes - more urgent
        if (timeDiff <= 1800000) return 2; // 30 minutes - moderate
        return 1; // More than 30 minutes - normal
    }
    
    calculateOverdueLevel(overdueMinutes) {
        // Progressive overdue animation levels - most extreme at 60+ minutes
        if (overdueMinutes >= 60) return 6; // 60+ minutes - most extreme (red, intense shaking)
        if (overdueMinutes >= 50) return 5; // 50-59 minutes
        if (overdueMinutes >= 40) return 4; // 40-49 minutes  
        if (overdueMinutes >= 30) return 3; // 30-39 minutes
        if (overdueMinutes >= 20) return 2; // 20-29 minutes
        if (overdueMinutes >= 10) return 1; // 10-19 minutes
        return 0; // 0-9 minutes - minimal overdue styling
    }
    
    // Test Mode Methods
    toggleTestMode() {
        if (this.isTestMode) {
            this.exitTestMode();
        } else {
            this.enterTestMode();
        }
    }
    
    enterTestMode() {
        this.isTestMode = true;
        this.testMode.textContent = '🧪';
        this.testMode.style.backgroundColor = 'var(--success-color)';
        
        // Save original todos
        this.originalTodos = [...this.todos];
        
        // Create a demo task that simulates overdue progression
        this.demoTask = {
            id: 'demo-task',
            text: 'Take out the bins!',
            completed: false,
            isRecurring: false,
            scheduledFor: new Date().toISOString(), // Due now
            type: 'scheduled',
            createdAt: new Date().toISOString()
        };
        
        // Set demo progression stage
        this.demoStage = 0; // Start at 0 minutes overdue
        this.demoStages = [0, 10, 20, 30, 40, 50, 60]; // Minutes overdue progression
        
        // Start progressing through overdue stages every 5 seconds
        this.testInterval = setInterval(() => {
            this.demoStage = (this.demoStage + 1) % this.demoStages.length;
            this.updateViewerContent();
        }, 5000);
        
        this.updateViewerContent();
        this.showSuccessMessage('Demo mode: Overdue animation progression every 5 seconds!');
    }
    
    exitTestMode() {
        this.isTestMode = false;
        this.testMode.textContent = '🧪';
        this.testMode.style.backgroundColor = 'var(--warning-color)';
        
        // Clear the progression interval
        if (this.testInterval) {
            clearInterval(this.testInterval);
            this.testInterval = null;
        }
        
        // Clear demo task and progression
        this.demoTask = null;
        this.demoStage = 0;
        this.demoStages = null;
        
        // Restore original todos
        if (this.originalTodos) {
            this.todos = [...this.originalTodos];
            this.originalTodos = null;
        }
        
        this.updateViewerContent();
        this.showSuccessMessage('Demo mode deactivated. Back to normal viewer mode.');
    }





    // Quote system for "all done" state
    async loadQuotes() {
        if (this.quotes && this.quotes.length > 0) {
            console.log(`Using cached quotes: ${this.quotes.length} quotes available`);
            return this.quotes;
        }
        
        try {
            console.log('Attempting to load quotes.txt...');
            const response = await fetch('quotes.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            console.log(`Raw quote file content (first 200 chars): ${text.substring(0, 200)}`);
            
            this.quotes = text.trim().split('\n').map((line, index) => {
                const parts = line.split('|');
                if (parts.length !== 3) {
                    console.warn(`Line ${index + 1} has ${parts.length} parts instead of 3: ${line}`);
                }
                return {
                    author: parts[0]?.trim(),
                    text: parts[1]?.trim(),
                    year: parts[2]?.trim()
                };
            }).filter((quote, index) => {
                const isValid = quote.author && quote.text && quote.year;
                if (!isValid) {
                    console.warn(`Quote ${index + 1} is invalid:`, quote);
                }
                return isValid;
            });
            
            console.log(`Successfully loaded ${this.quotes.length} quotes from file`);
            return this.quotes;
        } catch (error) {
            console.error('Failed to load quotes from file, using expanded hardcoded fallback:', error);
            // Use a much larger set of hardcoded quotes as fallback
            this.quotes = [
                { author: 'Albert Einstein', text: 'Imagination is more important than knowledge.', year: '1929' },
                { author: 'Winston Churchill', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', year: '1942' },
                { author: 'Mark Twain', text: 'The secret of getting ahead is getting started.', year: '1894' },
                { author: 'Oscar Wilde', text: 'Be yourself; everyone else is already taken.', year: '1882' },
                { author: 'Maya Angelou', text: 'You alone are enough. You have nothing to prove to anybody.', year: '1969' },
                { author: 'Mahatma Gandhi', text: 'Be the change you wish to see in the world.', year: '1913' },
                { author: 'William Shakespeare', text: 'To be or not to be, that is the question.', year: '1603' },
                { author: 'Aristotle', text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', year: '335 BC' },
                { author: 'Confucius', text: 'It does not matter how slowly you go as long as you do not stop.', year: '500 BC' },
                { author: 'Socrates', text: 'The unexamined life is not worth living.', year: '399 BC' },
                { author: 'Franklin D. Roosevelt', text: 'The only thing we have to fear is fear itself.', year: '1933' },
                { author: 'John F. Kennedy', text: 'Ask not what your country can do for you, ask what you can do for your country.', year: '1961' },
                { author: 'Martin Luther King Jr.', text: 'I have a dream.', year: '1963' },
                { author: 'Nelson Mandela', text: 'It always seems impossible until it is done.', year: '1994' },
                { author: 'Steve Jobs', text: 'Stay hungry, stay foolish.', year: '2005' },
                { author: 'Walt Disney', text: 'All our dreams can come true if we have the courage to pursue them.', year: '1955' },
                { author: 'Henry Ford', text: 'Whether you think you can or you think you can not, you are right.', year: '1925' },
                { author: 'Theodore Roosevelt', text: 'Do what you can, with what you have, where you are.', year: '1900' },
                { author: 'Abraham Lincoln', text: 'Whatever you are, be a good one.', year: '1860' },
                { author: 'Benjamin Franklin', text: 'Tell me and I forget, teach me and I may remember, involve me and I learn.', year: '1750' },
                { author: 'Thomas Jefferson', text: 'I cannot live without books.', year: '1815' },
                { author: 'Ralph Waldo Emerson', text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', year: '1841' },
                { author: 'Henry David Thoreau', text: 'Go confidently in the direction of your dreams. Live the life you have imagined.', year: '1854' },
                { author: 'Emily Dickinson', text: 'Hope is the thing with feathers that perches in the soul.', year: '1891' },
                { author: 'Ernest Hemingway', text: 'The world breaks everyone, and afterward, some are strong at the broken places.', year: '1929' },
                { author: 'Pablo Picasso', text: 'Every child is an artist. The problem is how to remain an artist once we grow up.', year: '1946' },
                { author: 'Leonardo da Vinci', text: 'Simplicity is the ultimate sophistication.', year: '1500' },
                { author: 'Marie Curie', text: 'Nothing in life is to be feared, it is only to be understood.', year: '1903' },
                { author: 'Lao Tzu', text: 'The journey of a thousand miles begins with one step.', year: '600 BC' },
                { author: 'Buddha', text: 'What we think, we become.', year: '563 BC' }
            ];
            console.log(`Using ${this.quotes.length} hardcoded fallback quotes`);
            return this.quotes;
        }
    }

    getDailyQuote() {
        // Use current date as seed for consistent daily quote
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        if (!this.quotes || this.quotes.length === 0) {
            return {
                author: 'Unknown',
                text: 'Great work completing your tasks!',
                year: '2024'
            };
        }
        
        // Cycle through quotes based on day of year
        const quoteIndex = dayOfYear % this.quotes.length;
        return this.quotes[quoteIndex];
    }

    formatQuote(quote) {
        return `"${quote.text}" — ${quote.author} (${quote.year})`;
    }

    getThemeBasedEmoji(quote) {
        // Define emoji themes based on quote content and themes
        const themeMapping = {
            // Knowledge & Learning
            'knowledge': ['🧠', '📚', '💡', '🔬', '🎓'],
            'imagination': ['✨', '🌟', '💫', '🔮', '🎨'],  
            'wisdom': ['🦉', '🧙‍♂️', '📜', '⚖️', '🏛️'],
            'education': ['📖', '✏️', '🎓', '🍎', '📐'],
            
            // Success & Achievement
            'success': ['🏆', '👑', '💎', '🌟', '🎯'],
            'greatness': ['⛰️', '🗻', '🌄', '🦅', '🚀'],
            'victory': ['🏆', '🥇', '👑', '🎉', '🔥'],
            'achievement': ['🏅', '🎖️', '🏆', '💪', '⭐'],
            
            // Courage & Strength  
            'courage': ['🦁', '⚔️', '🛡️', '💪', '🔥'],
            'strength': ['💪', '🗻', '⚓', '🦾', '⛰️'],
            'brave': ['🦁', '🗡️', '🛡️', '🔥', '⚡'],
            'fearless': ['🦅', '⚡', '🔥', '💥', '🌪️'],
            
            // Time & Life
            'time': ['⏰', '⌛', '🕰️', '📅', '🌅'],
            'life': ['🌱', '🌳', '🌿', '🦋', '🌸'],
            'future': ['🔮', '🚀', '🌟', '🛸', '🔭'],
            'past': ['📜', '🏛️', '⚱️', '📰', '🗿'],
            
            // Peace & Hope
            'peace': ['🕊️', '☮️', '🌈', '🌸', '🧘‍♂️'],
            'hope': ['🌅', '🌟', '✨', '🕯️', '🌈'],
            'love': ['❤️', '💖', '🌹', '💝', '🥰'],
            'happiness': ['😊', '🌞', '🌈', '🎉', '🌻'],
            
            // Nature & Growth
            'nature': ['🌳', '🌿', '🦋', '🌸', '🌺'],
            'growth': ['🌱', '🌳', '📈', '🦋', '🌟'],
            'change': ['🦋', '🌊', '🔀', '🌱', '🌪️'],
            'journey': ['🗺️', '🧭', '🚶‍♂️', '⛰️', '🛤️']
        };
        
        const quoteText = quote.text.toLowerCase();
        const authorName = quote.author.toLowerCase();
        
        // Check for theme keywords in quote text and author
        for (const [theme, emojis] of Object.entries(themeMapping)) {
            if (quoteText.includes(theme) || 
                (theme === 'knowledge' && (quoteText.includes('learn') || quoteText.includes('know') || quoteText.includes('mind') || authorName.includes('einstein'))) ||
                (theme === 'imagination' && (quoteText.includes('imagine') || quoteText.includes('creative') || quoteText.includes('dream'))) ||
                (theme === 'courage' && (quoteText.includes('fear') || quoteText.includes('bold') || quoteText.includes('dare'))) ||
                (theme === 'time' && (quoteText.includes('moment') || quoteText.includes('today') || quoteText.includes('tomorrow'))) ||
                (theme === 'life' && (quoteText.includes('live') || quoteText.includes('exist') || quoteText.includes('being'))) ||
                (theme === 'wisdom' && (quoteText.includes('wise') || quoteText.includes('understand') || quoteText.includes('truth'))) ||
                (theme === 'peace' && (quoteText.includes('calm') || quoteText.includes('quiet') || quoteText.includes('serenity'))) ||
                (theme === 'hope' && (quoteText.includes('faith') || quoteText.includes('believe') || quoteText.includes('trust'))) ||
                (theme === 'success' && (quoteText.includes('succeed') || quoteText.includes('achieve') || quoteText.includes('accomplish'))) ||
                (theme === 'change' && (quoteText.includes('transform') || quoteText.includes('different') || quoteText.includes('new'))) ||
                (theme === 'journey' && (quoteText.includes('path') || quoteText.includes('way') || quoteText.includes('road')))
            ) {
                // Select emoji based on quote + day for some consistency
                const dayIndex = new Date().getDate() + this.testDayOffset;
                return emojis[dayIndex % emojis.length];
            }
        }
        
        // Fallback: Use general inspirational emojis if no theme matches
        const fallbackEmojis = ['💫', '🌟', '✨', '💡', '🔥', '🎯', '🏆', '💎', '🦋', '🌅'];
        const dayIndex = new Date().getDate() + this.testDayOffset;
        return fallbackEmojis[dayIndex % fallbackEmojis.length];
    }

    async fetchWeatherData() {
        try {
            // Check if we need to update (every 15 minutes)
            const now = Date.now();
            if (this.weatherData && (now - this.lastWeatherUpdate) < 15 * 60 * 1000) {
                return this.weatherData;
            }

            // Open-Meteo API call for London current weather and 5-day forecast
            const latitude = 51.5074;  // London latitude
            const longitude = -0.1278;  // London longitude
            
            // Regular forecast API
            const forecastResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&hourly=precipitation_probability&forecast_days=5&timezone=Europe/London`
            );
            
            // Ensemble API for current hour uncertainty
            const ensembleResponse = await fetch(
                `https://ensemble-api.open-meteo.com/v1/ensemble?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&forecast_days=1&timezone=Europe/London&models=ecmwf_aifs025`
            );
            
            if (!forecastResponse.ok) {
                throw new Error(`Weather API error: ${forecastResponse.status}`);
            }
            
            const data = await forecastResponse.json();
            
            // Get ensemble data for uncertainty
            let ensembleData = null;
            if (ensembleResponse.ok) {
                ensembleData = await ensembleResponse.json();
                console.log('Ensemble API response:', ensembleData);
            } else {
                console.warn('Ensemble API failed, continuing without uncertainty data');
            }
            
            // Debug: Log Open-Meteo API response
            console.log('Open-Meteo API response for London:', data);
            
            // Calculate max rain chance for remaining hours of today
            const currentHour = new Date().getHours();
            const todayHourlyData = data.hourly.precipitation_probability.slice(0, 24); // First 24 hours
            
            // Filter for remaining hours of the day
            const remainingHours = todayHourlyData.slice(currentHour);
            const maxRainChance = remainingHours.length > 0 ? Math.max(...remainingHours) : 0;
            
            // Debug: Log rain chances
            console.log('Current hour:', currentHour);
            console.log('Remaining hours rain chances:', remainingHours);
            console.log('Max rain chance for remaining hours:', maxRainChance);
            
            // Weather code to condition mapping (WMO codes)
            const getWeatherCondition = (code) => {
                if (code === 0) return 'Clear sky';
                if (code <= 3) return 'Partly Cloudy';
                if (code <= 48) return 'Foggy';
                if (code <= 67) return 'Rain';
                if (code <= 77) return 'Snow';
                if (code <= 86) return 'Rain showers';
                if (code <= 99) return 'Thunderstorms';
                return 'Unknown';
            };

            // Weather code to icon URL mapping (using WeatherAPI icons for consistency)
            const getWeatherIcon = (code) => {
                if (code === 0) return 'https://cdn.weatherapi.com/weather/64x64/day/113.png'; // Clear
                if (code <= 3) return 'https://cdn.weatherapi.com/weather/64x64/day/116.png'; // Partly cloudy
                if (code <= 48) return 'https://cdn.weatherapi.com/weather/64x64/day/248.png'; // Fog
                if (code <= 67) return 'https://cdn.weatherapi.com/weather/64x64/day/296.png'; // Rain
                if (code <= 77) return 'https://cdn.weatherapi.com/weather/64x64/day/338.png'; // Snow
                if (code <= 86) return 'https://cdn.weatherapi.com/weather/64x64/day/353.png'; // Showers
                if (code <= 99) return 'https://cdn.weatherapi.com/weather/64x64/day/389.png'; // Thunder
                return 'https://cdn.weatherapi.com/weather/64x64/day/113.png';
            };
            
            // Process 5-day forecast
            const forecast = data.daily.time.map((date, index) => ({
                date: date,
                dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                condition: getWeatherCondition(data.daily.weather_code[index]),
                icon: getWeatherIcon(data.daily.weather_code[index]),
                maxTemp: Math.round(data.daily.temperature_2m_max[index]),
                minTemp: Math.round(data.daily.temperature_2m_min[index]),
                rainChance: 0 // Open-Meteo doesn't provide daily rain chance directly
            }));

            // Calculate ensemble range from ensemble data for current hour
            console.log('🔥 NEW ENSEMBLE CODE RUNNING - if you see this, code updated successfully');
            let ensembleRange = null;
            if (ensembleData && ensembleData.hourly) {
                console.log('Ensemble data structure:', Object.keys(ensembleData.hourly));
                
                const currentHour = new Date().getHours();
                const hourlyData = ensembleData.hourly;
                
                // Find the correct hour index by matching the time array
                let hourIndex = currentHour;
                if (hourlyData.time) {
                    const currentTime = new Date();
                    const todayStr = currentTime.toISOString().split('T')[0]; // YYYY-MM-DD
                    const targetHour = `${todayStr}T${currentHour.toString().padStart(2, '0')}:00`;
                    
                    hourIndex = hourlyData.time.findIndex(timeStr => timeStr === targetHour);
                    if (hourIndex === -1) {
                        // Fallback to current hour if exact match not found
                        hourIndex = Math.min(currentHour, hourlyData.time.length - 1);
                    }
                    console.log(`Looking for time: ${targetHour}, found at index: ${hourIndex}`);
                }
                
                // Collect temperatures from all ensemble members
                const memberTemps = [];
                Object.keys(hourlyData).forEach(key => {
                    if (key.startsWith('temperature_2m_member') && Array.isArray(hourlyData[key])) {
                        const temp = hourlyData[key][hourIndex];
                        if (temp !== undefined && temp !== null && !isNaN(temp)) {
                            memberTemps.push(parseFloat(temp));
                        }
                    }
                });
                
                console.log(`Found ${memberTemps.length} ensemble members for hour index ${hourIndex}`);
                
                if (memberTemps.length >= 10) { // Require reasonable number of members
                    const tempMin = Math.min(...memberTemps);
                    const tempMax = Math.max(...memberTemps);
                    
                    ensembleRange = {
                        tempLow: Math.round(tempMin),
                        tempHigh: Math.round(tempMax)
                    };
                    console.log(`Ensemble range: ${tempMin.toFixed(1)}°C - ${tempMax.toFixed(1)}°C from ${memberTemps.length} members`);
                } else {
                    console.log(`Insufficient ensemble members (${memberTemps.length}), skipping range display`);
                }
            } else {
                console.log('No ensemble data available');
            }

            this.weatherData = {
                temperature: Math.round(data.current.temperature_2m),
                feelsLike: Math.round(data.current.apparent_temperature),
                condition: getWeatherCondition(data.current.weather_code),
                icon: getWeatherIcon(data.current.weather_code),
                windSpeed: Math.round(data.current.wind_speed_10m),
                humidity: data.current.relative_humidity_2m,
                rainChance: maxRainChance,
                unit: '°C',
                forecast: forecast,
                ensembleRange: ensembleRange
            };
            
            this.lastWeatherUpdate = now;
            return this.weatherData;
            
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            // Return fallback data
            return {
                temperature: '--',
                feelsLike: '--',
                condition: 'Weather unavailable',
                icon: '',
                windSpeed: '--',
                humidity: '--',
                rainChance: 0,
                unit: '°C',
                forecast: []
            };
        }
    }

    async updateWeatherDisplay() {
        const weather = await this.fetchWeatherData();
        
        const iconElement = this.allDoneSection.querySelector('.weather-icon');
        const tempElement = this.allDoneSection.querySelector('.weather-temp');
        const conditionElement = this.allDoneSection.querySelector('.weather-condition');
        const detailsElement = this.allDoneSection.querySelector('.weather-details');
        const rainElement = this.allDoneSection.querySelector('.weather-rain');
        
        if (iconElement && weather.icon) {
            iconElement.src = weather.icon;
            iconElement.style.display = 'block';
            iconElement.alt = weather.condition;
        }
        
        if (tempElement) {
            tempElement.textContent = `${weather.temperature}${weather.unit}`;
        }
        
        if (conditionElement) {
            conditionElement.textContent = weather.condition;
        }
        
        if (detailsElement) {
            const todayForecast = weather.forecast && weather.forecast[0];
            if (todayForecast) {
                detailsElement.textContent = `Feels ${weather.feelsLike}° | Max ${todayForecast.maxTemp}° | Low ${todayForecast.minTemp}°`;
            } else {
                detailsElement.textContent = `Feels like ${weather.feelsLike}${weather.unit}`;
            }
        }
        
        // Show rain probability only if there's a chance of rain
        if (rainElement && weather.rainChance && weather.rainChance > 0) {
            rainElement.textContent = `🌧️ ${weather.rainChance}% chance of rain`;
            rainElement.style.display = 'block';
        } else if (rainElement) {
            rainElement.style.display = 'none';
        }

        // Show ensemble range if available
        this.updateEnsembleRangeDisplay(weather);
        
        // Populate 5-day forecast
        if (weather.forecast) {
            this.populate5DayForecast(weather.forecast);
        }
        
        console.log('Weather updated:', weather);
    }

    updateEnsembleRangeDisplay(weather) {
        const uncertaintyElement = this.allDoneSection.querySelector('.weather-uncertainty');
        const tempRangeElement = this.allDoneSection.querySelector('.temp-range');
        
        if (weather.ensembleRange && uncertaintyElement) {
            const { tempLow, tempHigh } = weather.ensembleRange;
            
            // Update temperature range
            if (tempRangeElement) {
                tempRangeElement.textContent = `${tempLow}° - ${tempHigh}°`;
            }
            
            uncertaintyElement.style.display = 'block';
            console.log('Ensemble range displayed:', weather.ensembleRange);
        } else if (uncertaintyElement) {
            uncertaintyElement.style.display = 'none';
        }
    }

    populate5DayForecast(forecastData) {
        const forecastContainer = this.allDoneSection.querySelector('#forecastDaysContainer');
        if (!forecastContainer) return;

        forecastContainer.innerHTML = '';
        
        forecastData.forEach((day, index) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'forecast-day';
            
            const dayName = index === 0 ? 'Today' : day.dayName;
            
            dayElement.innerHTML = `
                <div class="forecast-day-name">${dayName}</div>
                <div class="forecast-day-condition">
                    <img class="forecast-day-icon" src="${day.icon}" alt="${day.condition}">
                    <span>${day.condition}</span>
                </div>
                <div class="forecast-day-temp">
                    <span class="temp-high">${day.maxTemp}°</span>
                    <span class="temp-low">${day.minTemp}°</span>
                </div>
            `;
            
            forecastContainer.appendChild(dayElement);
        });
    }

    getDailyQuote() {
        // Use current date (or test offset) as seed for consistent daily quote
        const dayOfYear = this.isTestMode ? 
            this.testDayOffset : 
            Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        // Ensure quotes are loaded before using them
        if (!this.quotes || this.quotes.length === 0) {
            console.warn('Quotes not loaded yet, using fallback');
            return {
                author: 'Albert Einstein',
                text: 'Imagination is more important than knowledge.',
                year: '1929'
            };
        }
        
        // Cycle through quotes based on day of year
        const quoteIndex = dayOfYear % this.quotes.length;
        console.log(`Day ${dayOfYear}, Total quotes: ${this.quotes.length}, Quote index: ${quoteIndex}`);
        console.log(`Selected quote: "${this.quotes[quoteIndex].text}" — ${this.quotes[quoteIndex].author}`);
        return this.quotes[quoteIndex];
    }

    // Server synchronization methods
    async syncWithServer() {
        if (this.syncInProgress) return;
        this.syncInProgress = true;

        try {
            // Get server data
            const response = await fetch('/api/reminders');
            const serverData = await response.json();
            
            // Simple conflict resolution: merge by last modified
            const localLastModified = parseInt(this.lastSyncTime);
            const serverLastModified = serverData.lastModified || 0;
            
            if (serverLastModified > localLastModified) {
                // Server data is newer, use it
                this.todos = serverData.todos || [];
                this.lastSyncTime = serverLastModified;
                localStorage.setItem('lastSyncTime', this.lastSyncTime.toString());
                this.saveTodos();
                this.render();
                console.log('Synced from server: received newer data');
            } else if (localLastModified > serverLastModified) {
                // Local data is newer, push to server
                await this.pushToServer();
                console.log('Synced to server: pushed newer local data');
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async pushToServer() {
        try {
            const dataToSend = {
                todos: this.todos,
                lastModified: Date.now()
            };

            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();
            if (result.success) {
                this.lastSyncTime = result.lastModified;
                localStorage.setItem('lastSyncTime', this.lastSyncTime.toString());
            }
        } catch (error) {
            console.error('Failed to push to server:', error);
        }
    }
}

let todoApp;

document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
    
    // Auto-load viewer mode only on desktop (not mobile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                  || window.innerWidth <= 768;
    
    if (!isMobile) {
        todoApp.enterViewerMode();
    }
});