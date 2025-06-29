
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');
const clearCompletedBtn = document.getElementById('clear-completed');
const sortSelect = document.getElementById('sort-select');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');


const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const progressPercentageEl = document.getElementById('progress-percentage');
const progressFillEl = document.getElementById('progress-fill');


let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let currentSort = 'date';


function initApp() {
  loadTheme();
  renderTodos();
  updateStats();
  setupEventListeners();
}


function setupEventListeners() {
  // Input events
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });


  themeToggle.addEventListener('click', toggleTheme);


  clearCompletedBtn.addEventListener('click', clearCompleted);


  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTodos();
  });

 
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });
}


function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}


function addTodo() {
  const task = input.value.trim();
  if (task === '') {
    showToast('Please enter a task!', 'error');
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 1000);
    return;
  }

  const newTodo = {
    id: Date.now(),
    text: task,
    completed: false,
    createdAt: new Date().toISOString(),
    priority: 'medium'
  };

  todos.unshift(newTodo);
  saveTodos();
  renderTodos();
  updateStats();
  input.value = '';
  input.classList.remove('error');
  showToast('Task added successfully!', 'success');
}

function toggleTodo(id) {
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex !== -1) {
    todos[todoIndex].completed = !todos[todoIndex].completed;
    saveTodos();
    renderTodos();
    updateStats();
    showToast(
      todos[todoIndex].completed ? 'Task completed!' : 'Task marked as pending',
      'success'
    );
  }
}

function deleteTodo(id) {
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex !== -1) {
    const deletedTodo = todos[todoIndex];
    todos.splice(todoIndex, 1);
    saveTodos();
    renderTodos();
    updateStats();
    showToast('Task deleted!', 'success');
  }
}

function clearCompleted() {
  const completedCount = todos.filter(todo => todo.completed).length;
  if (completedCount === 0) {
    showToast('No completed tasks to clear!', 'error');
    return;
  }
  
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  renderTodos();
  updateStats();
  showToast(`${completedCount} completed tasks cleared!`, 'success');
}


function renderTodos() {
  const filteredTodos = filterTodos();
  const sortedTodos = sortTodos(filteredTodos);
  
  list.innerHTML = '';
  
  if (sortedTodos.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  sortedTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';
    
    li.innerHTML = `
      <div class="task-content">
        <span class="task-text">${escapeHtml(todo.text)}</span>
        <div class="task-actions">
          <button class="task-btn" onclick="toggleTodo(${todo.id})">
            <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
          </button>
          <button class="task-btn delete" onclick="deleteTodo(${todo.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    
    list.appendChild(li);
  });
}

function filterTodos() {
  switch (currentFilter) {
    case 'completed':
      return todos.filter(todo => todo.completed);
    case 'pending':
      return todos.filter(todo => !todo.completed);
    default:
      return todos;
  }
}

function sortTodos(todos) {
  switch (currentSort) {
    case 'name':
      return [...todos].sort((a, b) => a.text.localeCompare(b.text));
    case 'priority':
      return [...todos].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    case 'date':
    default:
      return [...todos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}


function updateStats() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const pending = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
  progressPercentageEl.textContent = `${progress}%`;
  progressFillEl.style.width = `${progress}%`;
}


function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  const toastContent = toast.querySelector('.toast-content');
  const toastIcon = toastContent.querySelector('.toast-icon');
  const toastMessage = toastContent.querySelector('.toast-message');
  
 
  toastIcon.className = `fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
  
  
  toastMessage.textContent = message;
  
  
  toast.className = `toast ${type}`;
  
 
  toast.classList.add('show');
  
 
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


document.addEventListener('DOMContentLoaded', initApp);
