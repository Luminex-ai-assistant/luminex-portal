// Luminex Command Portal v2 - Multi-User Dashboard
// Handles project management, notifications, cron jobs, and audit mode

class Dashboard {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.projects = [];
        this.notifications = [];
        this.cronJobs = [];
        this.tasks = [];
        this.currentView = 'board';
        this.currentProject = 'all';
        this.auditMode = false;
        this.auditAsUser = null;
        
        this.spreadsheetId = null;
        
        this.init();
    }

    async init() {
        // Check authentication
        const session = localStorage.getItem('luminex_session');
        if (!session) {
            window.location.href = '/landing.html';
            return;
        }
        
        this.currentUser = JSON.parse(session);
        
        // Load config
        await this.loadConfig();
        
        // Load data
        await this.loadAllData();
        
        // Setup UI
        this.setupUI();
        this.setupEventListeners();
        this.render();
    }

    async loadConfig() {
        try {
            const response = await fetch('portal-config.json');
            const config = await response.json();
            this.spreadsheetId = config.spreadsheet_id;
        } catch (e) {
            console.error('Failed to load config:', e);
        }
    }

    async loadAllData() {
        // In production, these would fetch from Google Sheets
        // For now, using localStorage with sample data
        
        this.users = JSON.parse(localStorage.getItem('luminex_users') || '[]');
        this.projects = JSON.parse(localStorage.getItem('luminex_projects') || '[]');
        this.tasks = JSON.parse(localStorage.getItem('luminex_tasks') || '[]');
        this.notifications = JSON.parse(localStorage.getItem('luminex_notifications') || '[]');
        this.cronJobs = JSON.parse(localStorage.getItem('luminex_cronjobs') || '[]');
        
        // Load sample data if empty
        if (this.projects.length === 0 || this.tasks.length === 0) {
            this.loadSampleData();
        }
    }

    loadSampleData() {
        this.projects = [
            { id: 'apartment-hunt', name: 'Apartment Hunt', description: 'Finding a new apartment in Halifax', owner: 'tag', members: ['tag', 'krista'], status: 'active', icon: '🏠', color: '#58a6ff' },
            { id: 'luminex-dev', name: 'Luminex Development', description: 'AI assistant improvements', owner: 'tag', members: ['tag'], status: 'active', icon: '⚡', color: '#d29922' },
            { id: 'airbnb-mgmt', name: 'Airbnb Management', description: 'Cape Breton property management', owner: 'tag', members: ['tag'], status: 'active', icon: '🏡', color: '#3fb950' },
        ];
        
        this.cronJobs = [
            { id: 'cron-001', name: 'Apartment Hunt Daily Scan', project_id: 'apartment-hunt', schedule: '0 16 * * *', status: 'ok', last_run: '2026-02-14', next_run: '2026-02-15 16:00', description: 'Daily scan for new Halifax apartment listings', enabled: true },
            { id: 'cron-002', name: 'Quarterly Gmail Review', project_id: 'luminex-dev', schedule: 'every 90 days', status: 'pending', last_run: 'N/A', next_run: '2026-04-15', description: 'Review and cleanup Luminex Gmail trash', enabled: true },
        ];
        
        this.tasks = [
            { id: '1', title: 'Review Larry Uteck listings', description: 'Check new apartment listings in Bedford area', project: 'apartment-hunt', status: 'inprogress', priority: 'P1', assignee: 'luminex', dueDate: '2026-02-16', tags: 'research, urgent', created: new Date().toISOString() },
            { id: '2', title: 'Set up calendar booking permissions', description: 'Krista requested calendar access for scheduling', project: 'luminex-dev', status: 'todo', priority: 'P1', assignee: 'tag', dueDate: '2026-02-17', tags: 'config, permissions', created: new Date().toISOString() },
            { id: '3', title: 'Vacation planning call with Krista', description: '30 min discussion on logistics', project: 'apartment-hunt', status: 'todo', priority: 'P0', assignee: 'tag', dueDate: '2026-02-16', tags: 'call, planning', created: new Date().toISOString() },
        ];
        
        this.notifications = [
            { id: '1', type: 'mention', from_user: 'krista', to_user: 'tag', message: '@tag check out this new Lotus Point listing', project_id: 'apartment-hunt', read: false, created_at: new Date().toISOString() },
            { id: '2', type: 'assignment', from_user: 'system', to_user: 'tag', message: 'You have been assigned to "Review Larry Uteck listings"', project_id: 'apartment-hunt', task_id: '1', read: false, created_at: new Date().toISOString() },
        ];
        
        this.saveToStorage();
    }

    saveToStorage() {
        localStorage.setItem('luminex_projects', JSON.stringify(this.projects));
        localStorage.setItem('luminex_cronjobs', JSON.stringify(this.cronJobs));
        localStorage.setItem('luminex_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('luminex_notifications', JSON.stringify(this.notifications));
    }

    setupUI() {
        // Update user info
        document.getElementById('userAvatar').textContent = this.currentUser.avatar || this.currentUser.username.substring(0, 2).toUpperCase();
        document.getElementById('userName').textContent = this.currentUser.displayName || this.currentUser.username;
        
        // Show admin features if admin
        if (this.currentUser.role === 'admin') {
            document.getElementById('adminMenu').classList.remove('hidden');
        }
        
        // Update notification count
        this.updateNotificationBadge();
        
        // Setup audit mode if active
        if (this.auditMode && this.auditAsUser) {
            document.getElementById('auditBanner').classList.remove('hidden');
            document.getElementById('auditUserName').textContent = this.auditAsUser.displayName;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });
        
        // Project filter
        document.getElementById('projectFilter').addEventListener('change', (e) => {
            this.currentProject = e.target.value;
            this.render();
        });
        
        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', () => {
            document.getElementById('userDropdown').classList.toggle('hidden');
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Profile
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfileModal());
        
        // Notifications
        document.getElementById('notificationBtn').addEventListener('click', () => this.showNotifications());
        
        // Add task
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());
        
        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Close modals
        document.querySelectorAll('.btn-close, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Audit mode
        document.getElementById('auditModeBtn').addEventListener('click', () => this.showAuditModal());
        document.getElementById('exitAuditBtn').addEventListener('click', () => this.exitAuditMode());
        
        // Click outside to close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.add('hidden');
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        
        // Show/hide views
        document.getElementById('kanbanView').classList.toggle('hidden', view !== 'board');
        document.getElementById('projectsView').classList.toggle('hidden', view !== 'projects');
        document.getElementById('cronView').classList.toggle('hidden', view !== 'cron');
        document.getElementById('notificationsView').classList.toggle('hidden', view !== 'notifications');
        
        // Render appropriate view
        if (view === 'projects') this.renderProjectsView();
        if (view === 'cron') this.renderCronView();
        if (view === 'notifications') this.renderNotificationsView();
        if (view === 'board') this.renderBoard();
    }

    getVisibleProjects() {
        if (this.currentUser.role === 'admin' && !this.auditMode) {
            return this.projects;
        }
        
        const effectiveUser = this.auditMode ? this.auditAsUser : this.currentUser;
        
        if (effectiveUser.projects.includes('all')) {
            return this.projects;
        }
        
        return this.projects.filter(p => effectiveUser.projects.includes(p.id));
    }

    getVisibleTasks() {
        const visibleProjects = this.getVisibleProjects().map(p => p.id);
        let tasks = this.tasks.filter(t => visibleProjects.includes(t.project));
        
        if (this.currentProject !== 'all') {
            tasks = tasks.filter(t => t.project === this.currentProject);
        }
        
        return tasks;
    }

    render() {
        if (this.currentView === 'board') {
            this.renderBoard();
        }
    }

    renderBoard() {
        const tasks = this.getVisibleTasks();
        const columns = ['backlog', 'todo', 'inprogress', 'review', 'done'];
        
        columns.forEach(status => {
            const column = document.getElementById(status + 'Column');
            column.innerHTML = '';
            
            const statusTasks = tasks.filter(t => t.status === status);
            document.querySelector(`[data-status="${status}"] .count`).textContent = statusTasks.length;
            
            statusTasks.forEach(task => {
                column.appendChild(this.createTaskCard(task));
            });
        });
        
        // Update stats
        document.getElementById('totalTasks').textContent = tasks.length;
        const overdue = tasks.filter(t => this.isOverdue(t.dueDate) && t.status !== 'done').length;
        document.getElementById('overdueTasks').textContent = overdue;
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = `task-card ${task.priority.toLowerCase()}`;
        card.draggable = true;
        card.dataset.taskId = task.id;
        
        const project = this.projects.find(p => p.id === task.project);
        const isOverdue = this.isOverdue(task.dueDate) && task.status !== 'done';
        const assignee = task.assignee === 'tag' ? 'OT' : (task.assignee === 'luminex' ? 'LX' : task.assignee.substring(0, 2).toUpperCase());
        
        card.innerHTML = `
            <div class="task-header">
                <span class="task-title">${this.escapeHtml(task.title)}</span>
                <button class="task-menu" onclick="dashboard.editTask('${task.id}')">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            <div class="task-meta">
                <span class="task-tag" style="background: ${project?.color || '#58a6ff'}20; color: ${project?.color || '#58a6ff'}">${project?.name || task.project}</span>
                ${task.priority !== 'P2' ? `<span class="task-tag priority-${task.priority.toLowerCase()}">${task.priority}</span>` : ''}
                ${task.dueDate ? `
                    <span class="task-date ${isOverdue ? 'overdue' : ''}">
                        <i class="far fa-clock"></i>
                        ${this.formatDate(task.dueDate)}
                    </span>
                ` : ''}
                <span class="task-assignee">${assignee}</span>
            </div>
        `;
        
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
        
        return card;
    }

    renderProjectsView() {
        const container = document.getElementById('projectsGrid');
        container.innerHTML = '';
        
        const visibleProjects = this.getVisibleProjects();
        
        visibleProjects.forEach(project => {
            const projectTasks = this.tasks.filter(t => t.project === project.id);
            const doneCount = projectTasks.filter(t => t.status === 'done').length;
            const memberCount = project.members.length;
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.borderLeftColor = project.color;
            card.innerHTML = `
                <div class="project-icon">${project.icon}</div>
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <div class="project-stats">
                    <span><strong>${projectTasks.length}</strong> tasks</span>
                    <span><strong>${doneCount}</strong> done</span>
                    <span><strong>${memberCount}</strong> members</span>
                </div>
                <div class="project-members">
                    ${project.members.map(m => `<span class="member-avatar">${m.substring(0, 2).toUpperCase()}</span>`).join('')}
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderCronView() {
        const container = document.getElementById('cronList');
        container.innerHTML = '';
        
        const visibleProjects = this.getVisibleProjects().map(p => p.id);
        let jobs = this.cronJobs.filter(j => visibleProjects.includes(j.project_id));
        
        if (this.currentProject !== 'all') {
            jobs = jobs.filter(j => j.project_id === this.currentProject);
        }
        
        if (jobs.length === 0) {
            container.innerHTML = '<div class="empty-state">No scheduled jobs for visible projects</div>';
            return;
        }
        
        jobs.forEach(job => {
            const project = this.projects.find(p => p.id === job.project_id);
            const item = document.createElement('div');
            item.className = `cron-item ${job.status}`;
            item.innerHTML = `
                <div class="cron-status">
                    <span class="status-dot ${job.enabled ? 'active' : 'inactive'}"></span>
                </div>
                <div class="cron-info">
                    <h4>${job.name}</h4>
                    <p>${job.description}</p>
                    <div class="cron-meta">
                        <span class="cron-project" style="color: ${project?.color || '#58a6ff'}">${project?.name || job.project_id}</span>
                        <span class="cron-schedule"><i class="far fa-clock"></i> ${job.schedule}</span>
                    </div>
                </div>
                <div class="cron-stats">
                    <div class="cron-stat">
                        <label>Last Run</label>
                        <span>${job.last_run}</span>
                    </div>
                    <div class="cron-stat">
                        <label>Next Run</label>
                        <span>${job.next_run}</span>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderNotificationsView() {
        const container = document.getElementById('notificationsList');
        container.innerHTML = '';
        
        const effectiveUser = this.auditMode ? this.auditAsUser : this.currentUser;
        const userNotifications = this.notifications
            .filter(n => n.to_user === effectiveUser.username)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        if (userNotifications.length === 0) {
            container.innerHTML = '<div class="empty-state">No notifications</div>';
            return;
        }
        
        userNotifications.forEach(notif => {
            const project = this.projects.find(p => p.id === notif.project_id);
            const item = document.createElement('div');
            item.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
            item.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(notif.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <span class="notification-from">${notif.from_user}</span>
                        <span class="notification-time">${this.formatTimeAgo(notif.created_at)}</span>
                    </div>
                    <p class="notification-message">${this.escapeHtml(notif.message)}</p>
                    ${project ? `<span class="notification-project" style="color: ${project.color}">${project.name}</span>` : ''}
                </div>
                ${!notif.read ? '<span class="notification-unread"></span>' : ''}
            `;
            container.appendChild(item);
        });
        
        // Mark all as read when viewed
        userNotifications.forEach(n => n.read = true);
        this.saveToStorage();
        this.updateNotificationBadge();
    }

    getNotificationIcon(type) {
        const icons = {
            mention: 'fa-at',
            assignment: 'fa-tasks',
            reminder: 'fa-bell',
            system: 'fa-info-circle'
        };
        return icons[type] || 'fa-bell';
    }

    updateNotificationBadge() {
        const effectiveUser = this.auditMode ? this.auditAsUser : this.currentUser;
        const unread = this.notifications.filter(n => n.to_user === effectiveUser.username && !n.read).length;
        const badge = document.getElementById('notificationCount');
        badge.textContent = unread;
        badge.classList.toggle('hidden', unread === 0);
    }

    showNotifications() {
        this.switchView('notifications');
    }

    showProfileModal() {
        document.getElementById('profileModal').classList.remove('hidden');
        document.getElementById('profileUsername').value = this.currentUser.username;
        document.getElementById('profileDisplayName').value = this.currentUser.displayName || '';
    }

    showAuditModal() {
        if (this.currentUser.role !== 'admin') return;
        
        const modal = document.getElementById('auditModal');
        const select = document.getElementById('auditUserSelect');
        select.innerHTML = '<option value="">Select user to audit...</option>';
        
        this.users.forEach(user => {
            if (user.username !== this.currentUser.username) {
                select.innerHTML += `<option value="${user.username}">${user.display_name || user.username}</option>`;
            }
        });
        
        modal.classList.remove('hidden');
        
        document.getElementById('startAuditBtn').onclick = () => {
            const username = select.value;
            if (!username) return;
            
            const user = this.users.find(u => u.username === username);
            if (user) {
                this.auditMode = true;
                this.auditAsUser = user;
                location.reload();
            }
        };
    }

    exitAuditMode() {
        this.auditMode = false;
        this.auditAsUser = null;
        location.reload();
    }

    logout() {
        localStorage.removeItem('luminex_session');
        window.location.href = 'landing.html';
    }

    // Utility functions
    isOverdue(dateString) {
        if (!dateString) return false;
        return new Date(dateString) < new Date().setHours(0, 0, 0, 0);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const diff = Math.floor((date - today) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
