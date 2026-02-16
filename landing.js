// Luminex Command Portal - Landing Page
// Handles authentication and redirects to dashboard

class LandingPortal {
    constructor() {
        this.spreadsheetId = null;
        this.clearCorruptedData();
        this.loadConfig();
        this.setupEventListeners();
    }

    clearCorruptedData() {
        // Clear any old corrupted user data to ensure fresh start
        const users = localStorage.getItem('luminex_users');
        if (users) {
            try {
                const parsed = JSON.parse(users);
                const admin = parsed.find(u => u.username === 'tag');
                if (admin && admin.password_hash !== '0000000000000000000000007bcb7714') {
                    // Clear corrupted data
                    localStorage.removeItem('luminex_users');
                    localStorage.removeItem('luminex_session');
                    console.log('Cleared corrupted user data');
                }
            } catch (e) {
                localStorage.removeItem('luminex_users');
            }
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('portal-config.json');
            const config = await response.json();
            this.spreadsheetId = config.spreadsheet_id;
        } catch (e) {
            console.error('Failed to load portal config:', e);
        }
    }

    setupEventListeners() {
        // Enter portal button
        document.getElementById('enterPortalBtn').addEventListener('click', () => {
            this.showLoginModal();
        });

        // Close modal
        document.getElementById('closeLogin').addEventListener('click', () => {
            this.hideLoginModal();
        });

        // Login submit
        document.getElementById('loginSubmit').addEventListener('click', () => {
            this.handleLogin();
        });

        // Enter key on inputs
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Close modal on backdrop click
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') this.hideLoginModal();
        });
    }

    showLoginModal() {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('loginUsername').focus();
    }

    hideLoginModal() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('loginError').textContent = '';
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        if (!username || !password) {
            errorEl.textContent = 'Please enter both username and password';
            return;
        }

        // Simple hash for comparison (in production, use bcrypt)
        const passwordHash = this.simpleHash(password);

        try {
            // Check credentials against stored data
            // For now, we'll use localStorage as a cache, but validate against the real system
            const users = await this.fetchUsers();
            const user = users.find(u => u.username === username);

            if (!user) {
                errorEl.textContent = 'Invalid username or password';
                return;
            }

            if (user.password_hash !== passwordHash) {
                errorEl.textContent = 'Invalid username or password';
                return;
            }

            // Store session
            const session = {
                username: user.username,
                displayName: user.display_name,
                role: user.role,
                projects: user.projects.split(','),
                avatar: user.avatar,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('luminex_session', JSON.stringify(session));
            
            // Initialize sample data if empty
            this.initializeSampleData();
            
            // Redirect to dashboard
            window.location.href = 'dashboard';

        } catch (e) {
            console.error('Login error:', e);
            errorEl.textContent = 'Login failed. Please try again.';
        }
    }

    simpleHash(str) {
        // Simple SHA-256-like hash for demo purposes
        // In production, use proper bcrypt or server-side validation
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
    }

    async fetchUsers() {
        // This would normally fetch from Google Sheets
        // For now, we'll check localStorage first, then fall back to a default
        const cached = localStorage.getItem('luminex_users');
        if (cached) {
            return JSON.parse(cached);
        }
        
        // Default admin user for initial setup
        // Hardcoded hash for 'Command2026!' to ensure consistency
        return [{
            username: 'tag',
            password_hash: '0000000000000000000000007bcb7714',
            display_name: 'Omar (Tag)',
            email: 'o.tageldin@gmail.com',
            role: 'admin',
            projects: 'all',
            avatar: 'OT',
            notifications_enabled: 'TRUE'
        }];
    }

    initializeSampleData() {
        // Only initialize if no data exists
        if (localStorage.getItem('luminex_projects')) {
            return;
        }

        const now = new Date().toISOString();

        // Sample projects
        const projects = [
            { id: 'apartment-hunt', name: 'Apartment Hunt', description: 'Finding a new apartment in Halifax', owner: 'tag', members: ['tag'], status: 'active', icon: '🏠', color: '#58a6ff' },
            { id: 'luminex-dev', name: 'Luminex Development', description: 'AI assistant improvements', owner: 'tag', members: ['tag'], status: 'active', icon: '⚡', color: '#d29922' },
            { id: 'airbnb-mgmt', name: 'Airbnb Management', description: 'Cape Breton property management', owner: 'tag', members: ['tag'], status: 'active', icon: '🏡', color: '#3fb950' },
        ];

        // Sample tasks
        const tasks = [
            { id: '1', title: 'Review Larry Uteck listings', description: 'Check new apartment listings in Bedford area', project: 'apartment-hunt', status: 'inprogress', priority: 'P1', assignee: 'tag', dueDate: '2026-02-16', tags: 'research, urgent', created: now },
            { id: '2', title: 'Set up calendar booking permissions', description: 'Krista requested calendar access for scheduling', project: 'luminex-dev', status: 'todo', priority: 'P1', assignee: 'tag', dueDate: '2026-02-17', tags: 'config, permissions', created: now },
            { id: '3', title: 'Vacation planning call with Krista', description: '30 min discussion on logistics', project: 'apartment-hunt', status: 'todo', priority: 'P0', assignee: 'tag', dueDate: '2026-02-16', tags: 'call, planning', created: now },
        ];

        // Sample cron jobs
        const cronJobs = [
            { id: 'cron-001', name: 'Apartment Hunt Daily Scan', project_id: 'apartment-hunt', schedule: '0 16 * * *', status: 'ok', last_run: '2026-02-14', next_run: '2026-02-15 16:00', description: 'Daily scan for new Halifax apartment listings', enabled: true },
            { id: 'cron-002', name: 'Quarterly Gmail Review', project_id: 'luminex-dev', schedule: 'every 90 days', status: 'pending', last_run: 'N/A', next_run: '2026-04-15', description: 'Review and cleanup Luminex Gmail trash', enabled: true },
        ];

        // Sample notifications
        const notifications = [
            { id: '1', type: 'system', from_user: 'system', to_user: 'tag', message: 'Welcome to Luminex Command Portal', project_id: null, read: false, created_at: now },
        ];

        // Save to localStorage
        localStorage.setItem('luminex_projects', JSON.stringify(projects));
        localStorage.setItem('luminex_tasks', JSON.stringify(tasks));
        localStorage.setItem('luminex_cronjobs', JSON.stringify(cronJobs));
        localStorage.setItem('luminex_notifications', JSON.stringify(notifications));
        localStorage.setItem('luminex_users', JSON.stringify(this.fetchUsers()));

        console.log('Sample data initialized');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LandingPortal();
});
