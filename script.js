'use strict';

// Array zum Speichern aller Aufgaben
const tasks = [];

// DOM-Referenzen
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const list = document.getElementById('todo-list');

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

// Fügt eine Aufgabe der Liste und dem DOM hinzu
function addTask(task) {
  tasks.push(task);

  const item = document.createElement('li');
  item.textContent = task.text;
  list.appendChild(item);
}

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
