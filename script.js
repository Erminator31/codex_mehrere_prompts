'use strict';

// Array zum Speichern aller Aufgaben
const tasks = [];

// DOM-Referenzen
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const list = document.getElementById('todo-list');
const doneList = document.getElementById('done-list');
const linkOpen = document.getElementById('link-open');
const linkDone = document.getElementById('link-done');

// Aktiviert/Deaktiviert den Button je nach Eingabefeldinhalt
input.addEventListener('input', () => {
  addButton.disabled = input.value.trim().length === 0;
});

// Erstellt eine neue Aufgabe im vorgegebenen Datenmodell
function createTask(text) {
  return {
    id: crypto.randomUUID(), // uuid-v4 erzeugen
    text,
    priority: 0,
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

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';

  // Reagiert auf das Abhaken einer Aufgabe
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      task.isDone = true;
      task.doneAt = new Date().toISOString();
      item.remove();

      // Custom-Event ausloesen
      document.dispatchEvent(new CustomEvent('task:done', { detail: task }));
    }
  });

  const span = document.createElement('span');
  span.textContent = task.text;

  item.append(checkbox, span);
  return item;
}

function addTask(task) {
  tasks.push(task);
  const item = renderTask(task);
  list.appendChild(item);
}

// Zeigt alle offenen Aufgaben an
function renderOpenTasks() {
  list.innerHTML = '';
  tasks.filter(t => !t.isDone).forEach(t => list.appendChild(renderTask(t)));
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

        // Custom-Event ausloesen
        document.dispatchEvent(new CustomEvent('task:restore', { detail: t }));
      });

      li.append(text, created, done, restore);
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
window.addEventListener('load', handleRoute);

// Verhindert das Standardverhalten des Formulars und erstellt eine Aufgabe
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  const task = createTask(text);
  addTask(task);

  // Eingabefeld leeren und Button deaktivieren
  input.value = '';
  addButton.disabled = true;
});
