// Select elements
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const revisionList = document.getElementById('revision-list');
const downloadButton = document.getElementById('download-tasks');

// Function to get today's date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
}

// Load tasks from Local Storage (date-wise)
let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

// Function to add tasks
addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const today = getCurrentDate();
        const task = {
            text: taskText,
            dateAdded: today,
            revisionDates: getRevisionDates(),
            completed: false
        };

        // If no tasks exist for today's date, initialize an empty array
        if (!tasks[today]) {
            tasks[today] = [];
        }

        tasks[today].push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskInput.value = '';  // Clear input field
        displayTasks(today);
    }
});

// Function to get revision dates for spaced repetition
function getRevisionDates() {
    const today = new Date();
    return [
        new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 days
        new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
        new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000) // +14 days
    ];
}

// Function to display all tasks for a given date (both daily and revision)
function displayTasks(date) {
    taskList.innerHTML = '';
    revisionList.innerHTML = '';

    // Display daily tasks for the given date
    if (tasks[date]) {
        tasks[date].forEach(task => {
            const li = document.createElement('li');
            li.textContent = `Task: ${task.text}`;
            taskList.appendChild(li);
        });
    }

    // Display revision tasks due for today or in the upcoming days
    const today = new Date();
    Object.keys(tasks).forEach(dateKey => {
        tasks[dateKey].forEach(task => {
            task.revisionDates.forEach(revisionDate => {
                if (isSameDay(revisionDate, today) || revisionDate > today) {
                    const li = document.createElement('li');
                    li.textContent = `Revision: ${task.text} (Due: ${revisionDate.toDateString()})`;
                    li.classList.add('revision');
                    revisionList.appendChild(li);
                }
            });
        });
    });
}

// Function to check if two dates are the same day
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Function to download all tasks as a text file
downloadButton.addEventListener('click', () => {
    const today = new Date();
    let textContent = '';

    // Loop through all tasks sorted by date
    Object.keys(tasks).forEach(dateKey => {
        const dateText = `Tasks for ${dateKey}:\n`;
        textContent += dateText;

        tasks[dateKey].forEach(task => {
            textContent += `Task: ${task.text}\n`;
            textContent += `Revision Dates: ${task.revisionDates.map(date => date.toDateString()).join(', ')}\n\n`;
        });
    });

    // If there are tasks, create the download link
    if (textContent) {
        const blob = new Blob([textContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tasks_backup.txt';  // Name of the file to download
        link.click();
    } else {
        alert("No tasks available to download!");
    }
});

// Initial call to display tasks for today's date
displayTasks(getCurrentDate());
