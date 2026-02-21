document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('add-task-form');
    const pendingTasksList = document.getElementById('pending-tasks-list');
    const completedTasksList = document.getElementById('completed-tasks-list');
    let tasks = [];

    // --- Main Function to Fetch and Display Tasks ---
    const loadTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            tasks = await response.json();
            displayTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    // --- Function to Render Tasks ---
    const displayTasks = () => {
        pendingTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';
        const now = new Date();

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            const dueDate = new Date(task.due_date);
            const isOverdue = !task.completed && dueDate < now;

            taskElement.className = `bg-white p-4 rounded-lg shadow-sm flex items-center justify-between transition-all ${isOverdue ? 'border-l-4 border-red-500' : ''}`;
            
            taskElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <input type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <div>
                        <p class="font-medium text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}">${task.description}</p>
                        <p class="text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}">
                            <i class="fa-regular fa-clock mr-1"></i>
                            ${dueDate.toLocaleString()}
                        </p>
                    </div>
                </div>
                <button class="text-gray-400 hover:text-red-600 delete-task-btn" data-id="${task.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            if (task.completed) {
                completedTasksList.appendChild(taskElement);
            } else {
                pendingTasksList.appendChild(taskElement);
            }
        });
    };

    // --- Add a New Task ---
    addTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const description = document.getElementById('task-description').value;
        const dueDate = document.getElementById('task-datetime').value;

        if (!description || !dueDate) {
            alert('Please fill out all fields.');
            return;
        }

        try {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, due_date: dueDate })
            });
            addTaskForm.reset();
            loadTasks();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    });

    // --- Update Task (Complete/Incomplete) ---
    document.addEventListener('change', async (event) => {
        if (event.target.classList.contains('task-checkbox')) {
            const taskId = event.target.dataset.id;
            const completed = event.target.checked;
            try {
                await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed })
                });
                loadTasks();
            } catch (error) {
                console.error('Failed to update task:', error);
            }
        }
    });

    // --- Delete a Task ---
    document.addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('.delete-task-btn');
        if (deleteButton) {
            const taskId = deleteButton.dataset.id;
            if (confirm('Are you sure you want to delete this task?')) {
                try {
                    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
                    loadTasks();
                } catch (error) {
                    console.error('Failed to delete task:', error);
                }
            }
        }
    });

    // --- Initial Load ---
    loadTasks();
});