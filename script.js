// Hilfsvariablen für DOM-Elemente
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

// Array für aktuell geladene Tasks
let tasks = [];

// ----- Persistence -----
function loadTasks() {
    const data = localStorage.getItem('todoTasks');
    tasks = data ? JSON.parse(data) : [];
}

function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// ----- Rendering -----
function render() {
    // Nur offene Aufgaben anzeigen
    taskList.innerHTML = '';
    tasks.filter(t => !t.isDone).forEach(task => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;
        li.appendChild(span);
        taskList.appendChild(li);
    });
}

// ----- Events -----
// Button aktivieren/deaktivieren je nach Input
taskInput.addEventListener('input', () => {
    addTaskBtn.disabled = taskInput.value.trim() === '';
});

// Neues Task-Objekt erzeugen und rendern
function createTask(text) {
    return {
        id: crypto.randomUUID(), // uuid-v4
        text,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        doneAt: null,
        isDone: false,
        order: tasks.length
    };
}

// Submit-Event fürs Formular
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const task = createTask(text);
    tasks.push(task);
    saveTasks();
    render();

    taskInput.value = '';
    addTaskBtn.disabled = true;
});

// Initialisierung
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    render();
});
