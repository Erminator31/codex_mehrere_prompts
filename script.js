'use strict';

// Array zum Speichern aller Aufgaben
const tasks = [];

// Placeholder-Element fuer Drag-and-Drop
const placeholder = document.createElement('li');
placeholder.className = 'placeholder';

let draggedItem = null;
let keyboardMode = false;

// Speichert das Aufgaben-Array in localStorage
function saveTasks() {
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Laedt Aufgaben aus localStorage und befuellt das Array
function loadTasks() {
  const data = localStorage.getItem('todoTasks');
  if (!data) return;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      parsed.forEach(t => {
        if (!t.priority) t.priority = 'low';
        if (typeof t.order !== 'number') t.order = tasks.length;
        tasks.push(t);
      });
      tasks.sort((a, b) => a.order - b.order);
    }
  } catch (err) {
    console.error('Fehler beim Laden der Aufgaben', err);
  }
}

// DOM-Referenzen
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const prioritySelect = document.getElementById('priority-select');
const addButton = document.getElementById('add-button');
const list = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');
const linkOpen = document.getElementById('link-open');
const linkDone = document.getElementById('link-done');

list.addEventListener('dragover', (e) => {
  e.preventDefault();
  const target = e.target.closest('.task-item');
  if (!target || target === placeholder || target === draggedItem) return;
  const rect = target.getBoundingClientRect();
  const offset = e.clientY - rect.top;
  if (offset > rect.height / 2) {
    target.after(placeholder);
  } else {
    target.before(placeholder);
  }
});

list.addEventListener('drop', (e) => {
  e.preventDefault();
  if (!draggedItem) return;
  placeholder.replaceWith(draggedItem);
  draggedItem.classList.remove('dragging');
  updateOrder();
  saveTasks();
  draggedItem = null;
});

// Aktiviert/Deaktiviert den Button je nach Eingabefeldinhalt
input.addEventListener('input', () => {
  addButton.disabled = input.value.trim().length === 0;
});

// Erstellt eine neue Aufgabe im vorgegebenen Datenmodell
function createTask(text, priority) {
  return {
    id: crypto.randomUUID(), // uuid-v4 erzeugen
    text,
    priority,
    createdAt: new Date().toISOString(),
    doneAt: null,
    isDone: false,
    order: tasks.length
  };
}

// Erstellt ein Listenelement mit Checkbox und Event-Handler
function renderTask(task) {
  const item = document.createElement('li');
  item.className = 'task-item';
  item.draggable = true;
  item.dataset.id = task.id;
  item.tabIndex = 0;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';

  item.addEventListener('dragstart', (e) => {
    draggedItem = item;
    placeholder.style.height = `${item.offsetHeight}px`;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    if (placeholder.parentNode) placeholder.remove();
    draggedItem = null;
  });

  item.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!keyboardMode) {
        keyboardMode = true;
        draggedItem = item;
        placeholder.style.height = `${item.offsetHeight}px`;
        item.after(placeholder);
        item.classList.add('dragging');
      } else {
        const moveTarget = e.key === 'ArrowUp' ? placeholder.previousElementSibling : placeholder.nextElementSibling;
        if (moveTarget && moveTarget !== item) {
          if (e.key === 'ArrowUp') {
            moveTarget.before(placeholder);
          } else {
            moveTarget.after(placeholder);
          }
        }
      }
    } else if (e.key === 'Enter' && keyboardMode) {
      e.preventDefault();
      placeholder.replaceWith(item);
      item.classList.remove('dragging');
      keyboardMode = false;
      draggedItem = null;
      updateOrder();
      saveTasks();
      item.focus();
    }
  });

  // Reagiert auf das Abhaken einer Aufgabe
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      task.isDone = true;
      task.doneAt = new Date().toISOString();
      item.remove();

      saveTasks();

      // Custom-Event ausloesen
      document.dispatchEvent(new CustomEvent('task:done', { detail: task }));
    }
  });

  const span = document.createElement('span');
  span.textContent = task.text;
  span.setAttribute('aria-label', 'Tasktext');

  span.addEventListener('dblclick', () => {
    const edit = document.createElement('input');
    edit.type = 'text';
    edit.value = task.text;
    edit.maxLength = 200;
    edit.className = 'edit-input';
    edit.setAttribute('aria-label', 'Task bearbeiten');

    const finish = () => {
      const newText = edit.value.trim();
      if (newText) {
        task.text = newText;
        saveTasks();
        span.textContent = task.text;
      }
      edit.replaceWith(span);
      span.focus();
    };

    const cancel = () => {
      edit.replaceWith(span);
      span.focus();
    };

    edit.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finish();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    });

    span.replaceWith(edit);
    edit.focus();
    edit.select();
  });

  const badge = document.createElement('span');
  badge.className = `priority-badge priority-${task.priority}`;
  badge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  item.append(checkbox, span, badge);
  return item;
}

function addTask(task) {
  tasks.push(task);
  const item = renderTask(task);
  list.appendChild(item);
  saveTasks();
}

// Aktualisiert die order-Eigenschaft aller offenen Aufgaben nach DOM-Reihenfolge
function updateOrder() {
  const items = Array.from(list.children);
  items.forEach((li, idx) => {
    const id = li.dataset.id;
    const t = tasks.find(task => task.id === id);
    if (t) t.order = idx;
  });
}

// Zeigt alle offenen Aufgaben an
function renderOpenTasks() {
  list.innerHTML = '';
  tasks
    .filter(t => !t.isDone)
    .sort((a, b) => a.order - b.order)
    .forEach(t => list.appendChild(renderTask(t)));
}

// Zeigt erledigte Aufgaben sortiert nach doneAt absteigend
function renderDoneTasks() {
  doneList.innerHTML = '';
  tasks
    .filter(t => t.isDone)
    .sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt))
    .forEach(t => {
      const li = document.createElement('li');
      li.className = 'done-item';
      const text = document.createElement('span');
      text.textContent = t.text;
      const badge = document.createElement('span');
      badge.className = `priority-badge priority-${t.priority}`;
      badge.textContent = t.priority.charAt(0).toUpperCase() + t.priority.slice(1);
      const created = document.createElement('time');
      created.dateTime = t.createdAt;
      created.textContent = `erstellt: ${t.createdAt}`;
      const done = document.createElement('time');
      done.dateTime = t.doneAt;
      done.textContent = `erledigt: ${t.doneAt}`;
      // Icon zum Wiederherstellen der Aufgabe
      const restore = document.createElement('button');
      restore.type = 'button';
      restore.className = 'restore-button';
      restore.title = 'Wiederherstellen';
      restore.textContent = '\u21BA'; // Pfeilsymbol

      restore.addEventListener('click', () => {
        t.isDone = false;
        t.doneAt = null;

        saveTasks();

        // Custom-Event ausloesen
        document.dispatchEvent(new CustomEvent('task:restore', { detail: t }));
      });

      li.append(text, badge, created, done, restore);
      doneList.appendChild(li);
    });
}

// Navigation zwischen den Routen
function showRoute(route) {
  if (route === '#/done') {
    form.style.display = 'none';
    list.hidden = true;
    doneList.hidden = false;
    linkOpen.classList.remove('active');
    linkDone.classList.add('active');
    renderDoneTasks();
  } else {
    form.style.display = 'flex';
    list.hidden = false;
    doneList.hidden = true;
    linkOpen.classList.add('active');
    linkDone.classList.remove('active');
    renderOpenTasks();
  }
}

function handleRoute() {
  const route = location.hash || '#/';
  showRoute(route);
}

// Rueckmeldung bei erledigten Aufgaben
document.addEventListener('task:done', () => {
  if (location.hash === '#/done') {
    renderDoneTasks();
  }
});

// Rueckmeldung bei wiederhergestellten Aufgaben
document.addEventListener('task:restore', () => {
  if (location.hash === '#/done') {
    renderDoneTasks();
  } else {
    renderOpenTasks();
  }
});

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', () => {
  loadTasks();
  handleRoute();
});

// Verhindert das Standardverhalten des Formulars und erstellt eine Aufgabe
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const priority = prioritySelect.value;
  const task = createTask(text, priority);
  addTask(task);

  // Eingabefeld leeren und Button deaktivieren
  input.value = '';
  prioritySelect.value = 'low';
  addButton.disabled = true;
});
