class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Recurring task elements
        this.recurringBtn = document.getElementById('recurringBtn');
        this.recurringModal = document.getElementById('recurringModal');
        this.recurringText = document.getElementById('recurringText');
        this.recurringFreq = document.getElementById('recurringFreq');
        this.daySelector = document.getElementById('daySelector');
        this.recurringTime = document.getElementById('recurringTime');
        this.startDate = document.getElementById('startDate');
        this.closeModal = document.getElementById('closeModal');
        this.cancelRecurring = document.getElementById('cancelRecurring');
        this.createRecurring = document.getElementById('createRecurring');
        
        this.selectedDays = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadTheme();
        this.render();
        // Initialize recurring task UI after DOM is ready
        setTimeout(() => {
            this.setDefaultStartDate();
            this.updateDaySelector();
            this.processRecurringTasks();
        }, 0);
    }
    
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Recurring task events
        this.recurringBtn.addEventListener('click', () => this.openRecurringModal());
        this.closeModal.addEventListener('click', () => this.closeRecurringModal());
        this.cancelRecurring.addEventListener('click', () => this.closeRecurringModal());
        this.createRecurring.addEventListener('click', () => this.createRecurringTask());
        this.recurringFreq.addEventListener('change', () => this.updateDaySelector());
        
        // Day selector events - delay to ensure DOM is ready
        setTimeout(() => {
            document.querySelectorAll('.day-btn').forEach(btn => {
                btn.addEventListener('click', () => this.toggleDaySelection(btn));
            });
        }, 0);
        
        // Close modal on outside click
        this.recurringModal.addEventListener('click', (e) => {
            if (e.target === this.recurringModal) {
                this.closeRecurringModal();
            }
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
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    
    render() {
        this.todoList.innerHTML = '';
        
        // Filter todos: show completed ones and non-recurring ones, hide future recurring tasks
        const visibleTodos = this.todos.filter(todo => {
            if (todo.completed) return true; // Show completed tasks
            if (!todo.isRecurring) return true; // Show regular tasks
            
            // For recurring tasks, only show if due or overdue
            if (todo.nextDue) {
                const dueDate = new Date(todo.nextDue);
                const now = new Date();
                return dueDate <= now;
            }
            return true;
        });
        
        if (visibleTodos.length === 0) {
            this.todoList.innerHTML = '<div class="empty-message">No reminders yet. Add one above!</div>';
        } else {
            visibleTodos.forEach(todo => {
                const todoItem = this.createTodoElement(todo);
                this.todoList.appendChild(todoItem);
            });
        }
        
        this.updateStats();
    }
    
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        let recurringInfo = '';
        if (todo.isRecurring) {
            const nextDue = todo.nextDue ? new Date(todo.nextDue) : null;
            const recurringText = this.getRecurringText(todo);
            
            recurringInfo = `
                <div class="recurring-indicator">
                    ⟳ ${recurringText}
                </div>
                ${nextDue && !todo.completed ? `<div class="next-occurrence">Next: ${this.formatDate(nextDue)}</div>` : ''}
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
                ${recurringInfo}
            </div>
            <div class="todo-actions">
                ${actions}
            </div>
        `;
        
        return li;
    }
    
    getRecurringText(todo) {
        if (todo.frequency === 'daily') {
            return 'Daily';
        } else if (todo.frequency === 'weekly') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const selectedDays = todo.days.map(day => dayNames[day]).join(', ');
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
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        this.themeToggle.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }
    
    // Recurring task methods
    openRecurringModal() {
        this.recurringModal.style.display = 'block';
        this.recurringText.focus();
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
        this.setDefaultStartDate();
    }
    
    setDefaultStartDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.startDate.value = tomorrow.toISOString().split('T')[0];
    }
    
    updateDaySelector() {
        const frequency = this.recurringFreq.value;
        this.daySelector.style.display = frequency === 'weekly' ? 'block' : 'none';
        
        if (frequency === 'weekly' && this.selectedDays.length === 0) {
            // Default to current day of week
            const today = new Date().getDay();
            this.selectedDays = [today];
        }
        
        this.updateDayButtons();
    }
    
    updateDayButtons() {
        const dayButtons = document.querySelectorAll('.day-btn');
        if (dayButtons.length === 0) return; // Skip if buttons not ready
        
        dayButtons.forEach(btn => {
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
        
        this.showFeedback(`Recurring reminder created! Next occurrence: ${this.formatDate(new Date(recurringTask.nextDue))}`);
    }
    
    calculateNextDue(frequency, days, startDate, time) {
        const [hours, minutes] = time.split(':').map(Number);
        let nextDue = new Date(startDate);
        nextDue.setHours(hours, minutes, 0, 0);
        
        if (frequency === 'daily') {
            // If start date is today and time has passed, start tomorrow
            const now = new Date();
            if (nextDue <= now) {
                nextDue.setDate(nextDue.getDate() + 1);
            }
        } else if (frequency === 'weekly') {
            // Find next occurrence of selected days
            const currentDay = nextDue.getDay();
            const sortedDays = [...days].sort((a, b) => a - b);
            
            let targetDay = sortedDays.find(day => day >= currentDay);
            if (!targetDay) {
                targetDay = sortedDays[0];
                nextDue.setDate(nextDue.getDate() + 7);
            }
            
            const daysToAdd = targetDay - currentDay;
            nextDue.setDate(nextDue.getDate() + daysToAdd);
            
            // If it's today but time has passed, move to next week
            const now = new Date();
            if (nextDue <= now) {
                nextDue.setDate(nextDue.getDate() + 7);
            }
        } else if (frequency === 'monthly') {
            // Monthly on the same date
            const now = new Date();
            if (nextDue <= now) {
                nextDue.setMonth(nextDue.getMonth() + 1);
            }
        }
        
        return nextDue.toISOString();
    }
    
    processRecurringTasks() {
        const now = new Date();
        this.todos.forEach(todo => {
            if (todo.isRecurring && todo.nextDue && new Date(todo.nextDue) <= now && !todo.completed) {
                // Task is due, make it visible
                todo.isDue = true;
            }
        });
    }
    
    completeRecurringTask(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo || !todo.isRecurring) return;
        
        // Mark current instance as completed
        todo.completed = true;
        todo.completedAt = new Date().toISOString();
        
        // Create next occurrence
        const nextDue = this.calculateNextOccurrence(todo);
        const nextTask = {
            ...todo,
            id: Date.now(),
            completed: false,
            isDue: false,
            nextDue: nextDue.toISOString(),
            completedAt: null,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(nextTask);
        this.saveTodos();
        this.render();
        
        this.showFeedback(`Task completed! Next occurrence: ${this.formatDate(nextDue)}`);
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
    
    showFeedback(message) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 3000);
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
    }"}
}

let todoApp;

document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});