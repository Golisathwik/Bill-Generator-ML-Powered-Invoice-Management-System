document.addEventListener('DOMContentLoaded', () => {
    const notificationToast = document.getElementById('notification-toast');
    const notificationText = document.getElementById('notification-text');
    
    // --- Main Function to Fetch Tasks and Set Alarms ---
    const initializeReminders = async () => {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) return;
            
            const tasks = await response.json();
            const now = new Date();

            // --- Overdue Task Logic ---
            const overdueTasks = tasks.filter(task => !task.completed && new Date(task.due_date) < now);
            if (overdueTasks.length > 0) {
                // Check if we are on the todo page by looking for its main container ID
                const isTodoPage = document.getElementById('todo-page');
                
                if (isTodoPage) {
                    // On the To-Do page, show a detailed list of overdue tasks
                    const taskDescriptions = overdueTasks.map(t => t.description).join(', ');
                    showNotification(`You have overdue tasks: ${taskDescriptions}`, true);
                } else {
                    // On all other pages (like the home page), just show the count
                    showNotification(`You have ${overdueTasks.length} overdue task(s).`, true);
                }
            }

            // --- Precise Future Task Logic ---
            tasks.forEach(task => {
                if (!task.completed) {
                    const dueDate = new Date(task.due_date);
                    const timeDiff = dueDate.getTime() - now.getTime();
                    
                    if (timeDiff > 0) {
                        setTimeout(() => {
                            checkAndNotifySingleTask(task.id);
                        }, timeDiff);
                    }
                }
            });

        } catch (error) {
            console.log("Could not fetch tasks for notification check.");
        }
    };

    // Function to check a single task's status before firing the alarm
    const checkAndNotifySingleTask = async (taskId) => {
        try {
            const response = await fetch('/api/tasks'); // Fetch latest status
            const tasks = await response.json();
            const task = tasks.find(t => t.id === taskId);

            if (task && !task.completed) {
                showNotification(`Task due: ${task.description}`, false);
            }
        } catch (error) {
            console.error("Failed to check single task status:", error);
        }
    };

    // Universal function to show notifications
    const showNotification = (message, isOverdue = false) => {
        // Play sound for on-time reminders
        if (!isOverdue) {
            let alarmSound = new Audio('/static/sounds/notification.mp3');
            alarmSound.play().catch(e => console.error("Audio play failed:", e));
        }

        // Browser Notification
        if (Notification.permission === 'granted') {
            new Notification('Task Reminder', { body: message });
        }
        
        // On-page Toast (only if the element exists on the current page)
        if (notificationToast && notificationText) {
            notificationText.textContent = message;
            notificationToast.classList.remove('hidden');
            
            setTimeout(() => {
                notificationToast.classList.add('hidden');
            }, 10000);
        }
    };

    // Request permission and initialize
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    initializeReminders();
});