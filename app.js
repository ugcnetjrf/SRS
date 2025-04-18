function getCurrentDate() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function loadTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || {};
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadRevisionStatus() {
  return JSON.parse(localStorage.getItem('revisionStatus')) || {};
}

function saveRevisionStatus(status) {
  localStorage.setItem('revisionStatus', JSON.stringify(status));
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function displayTasks() {
  const container = document.getElementById('task-container');
  if (!container) return;

  container.innerHTML = '';
  const tasks = loadTasks();
  const dates = Object.keys(tasks).sort().reverse();

  for (const date of dates) {
    const section = document.createElement('div');
    section.innerHTML = `<strong>${date}</strong>`;
    container.appendChild(section);

    tasks[date].forEach((task) => {
      const item = document.createElement('div');
      item.className = 'task-item';
      if (task.done) item.classList.add('completed');

      const textSpan = document.createElement('span');
      textSpan.textContent = task.text;
      textSpan.style.flexGrow = '1';

      textSpan.addEventListener('click', () => {
        alert(`Task: ${task.text}\nDate: ${date}`);
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️';
      deleteBtn.style.marginLeft = '10px';
      deleteBtn.onclick = () => {
        if (confirm("Delete this task completely?")) {
          deleteSpecificTask(date, task.text);
        }
      };

      item.appendChild(textSpan);
      item.appendChild(deleteBtn);
      container.appendChild(item);
    });
  }
}

function displayRevisionTasks() {
  const container = document.getElementById('revision-container');
  if (!container) return;

  container.innerHTML = '';
  const today = getCurrentDate();
  const intervals = [1, 3, 7, 14, 21];
  const tasks = loadTasks();
  const revisionStatus = loadRevisionStatus();

  for (const date in tasks) {
    for (const task of tasks[date]) {
      for (const interval of intervals) {
        const dueDate = addDays(date, interval);
        const taskId = `${date}::${task.text}::${interval}`;

        if (dueDate === today) {
          const item = document.createElement('div');
          item.className = 'revision-item';

          const label = document.createElement('label');
          label.textContent = task.text;

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'checkbox';
          checkbox.checked = !!revisionStatus[taskId];

          checkbox.addEventListener('change', () => {
            revisionStatus[taskId] = checkbox.checked;
            saveRevisionStatus(revisionStatus);
          });

          item.appendChild(label);
          item.appendChild(checkbox);
          container.appendChild(item);
        }
      }
    }
  }
}

function setupEventHandlers() {
  const addTaskBtn = document.getElementById('add-task');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      const taskInput = document.getElementById('task-input');
      const dateInput = document.getElementById('task-date');
      const taskText = taskInput.value.trim();
      const selectedDate = dateInput.value || getCurrentDate();

      if (!taskText) return;

      const tasks = loadTasks();
      if (!tasks[selectedDate]) tasks[selectedDate] = [];
      tasks[selectedDate].push({ text: taskText, done: false });

      saveTasks(tasks);
      taskInput.value = '';
      displayTasks();
      displayRevisionTasks();
    });

    document.getElementById('task-date').value = getCurrentDate();
  }
}

function downloadTasks() {
  const tasks = loadTasks();
  let output = 'All Tasks (Grouped by Date)\n\n';

  for (const date in tasks) {
    output += `Date: ${date}\n`;
    tasks[date].forEach(task => {
      output += `- ${task.text}\n`;
    });
    output += '\n';
  }

  const blob = new Blob([output], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tasks_backup.txt';
  a.click();
}

function resetAll() {
  if (confirm("Are you sure you want to delete ALL tasks?")) {
    localStorage.removeItem('tasks');
    localStorage.removeItem('revisionStatus');
    displayTasks();
  }
}

function deleteSpecificTask(date, taskText) {
  const tasks = loadTasks();
  const revisionStatus = loadRevisionStatus();

  // Remove from tasks
  tasks[date] = tasks[date].filter(task => task.text !== taskText);
  if (tasks[date].length === 0) delete tasks[date];

  // Remove from spaced repetition schedule
  const intervals = [1, 3, 7, 14, 21];
  intervals.forEach(interval => {
    const id = `${date}::${taskText}::${interval}`;
    delete revisionStatus[id];
  });

  saveTasks(tasks);
  saveRevisionStatus(revisionStatus);
  displayTasks();
}

setupEventHandlers();
displayTasks();
displayRevisionTasks();
