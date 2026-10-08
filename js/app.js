// ===== MAIN APP CONTROLLER - Routing, Dashboard, Profile, Settings, Libra AI =====

const App = {
    _confirmAction: null,
    profileOpenSections: new Set(),

    esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },

    init() {
        this.applySettings();
        this.setupListeners();
        if (!window.location.hash) window.location.hash = '#/home';
        this.handleRoute();
    },

    setupListeners() {
        window.addEventListener('hashchange', () => this.handleRoute());
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => { e.preventDefault(); this.navigate(item.dataset.route); });
        });
        document.getElementById('back-btn').addEventListener('click', () => window.history.back());
        document.getElementById('search-btn').addEventListener('click', () => this.navigate('search'));
        document.getElementById('settings-btn').addEventListener('click', () => this.navigate('settings'));
        document.getElementById('libra-ai-btn').addEventListener('click', () => this.openLibra());
    },

    // ===== ROUTING =====
    navigate(route) { window.location.hash = '#/' + route; },

    handleRoute() {
        const hash = window.location.hash.slice(2) || 'home';
        const parts = hash.split('/');
        const route = parts[0];
        const id = parts[1];
        const sub = parts[2];

        this.updateNav(route);
        this.closeLibra();
        this.closeModal();

        switch (route) {
            case 'home': this.renderHome(); break;
            case 'cv':
                if (id === 'edit') CVMgr.renderEditor(sub);
                else if (id === 'preview') CVMgr.renderPreview(sub);
                else if (id === 'ats') CVMgr.renderATS(sub);
                else CVMgr.renderList();
                break;
            case 'job':
                if (id === 'analyze') JobAnalyzer.renderAnalyzer();
                else if (id === 'results') JobAnalyzer.renderResults(sub);
                else if (id === 'gap') JobAnalyzer.renderGap(sub);
                else if (id === 'tailor') JobAnalyzer.renderTailor(sub);
                else if (id === 'pack') JobAnalyzer.renderPack(sub);
                else JobAnalyzer.renderHome();
                break;
            case 'applications':
                if (id === 'edit') AppTracker.renderEdit(sub);
                else if (id === 'detail') AppTracker.renderDetail(sub);
                else AppTracker.renderList();
                break;
            case 'profile': this.renderProfile(); break;
            case 'interview': Interview.render(id); break;
            case 'settings': this.renderSettings(); break;
            case 'reports': this.renderReports(); break;
            case 'search': this.renderSearch(); break;
            default: this.renderHome();
        }
        document.getElementById('view-container').scrollTop = 0;
        window.scrollTo(0, 0);
    },

    updateNav(route) {
        const navMap = { home: 'home', cv: 'cv', job: 'job', applications: 'applications', profile: 'profile', interview: 'job' };
        const active = navMap[route] || '';
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.route === active);
        });
    },

    setTitle(title) { document.getElementById('header-title').textContent = title; },
    setBackButton(show) { document.getElementById('back-btn').classList.toggle('hidden', !show); },

    // ===== TOAST =====
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'circle-exclamation' : 'info-circle';
        toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; setTimeout(() => toast.remove(), 300); }, 3000);
    },

    // ===== MODAL =====
    confirm(title, message, onConfirm) {
        document.getElementById('modal-container').innerHTML = `
            <div class="modal-overlay" onclick="if(event.target===this)App.closeModal()">
                <div class="modal-content">
                    <div class="modal-handle"></div>
                    <h3 class="modal-title">${this.esc(title)}</h3>
                    <p style="font-size:0.875rem;color:var(--text-light);margin-bottom:16px">${this.esc(message)}</p>
                    <div class="modal-actions">
                        <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
                        <button class="btn btn-danger" onclick="App.confirmAction()">Delete</button>
                    </div>
                </div>
            </div>`;
        this._confirmAction = onConfirm;
    },

    confirmAction() { if (this._confirmAction) this._confirmAction(); this.closeModal(); },
    closeModal() { document.getElementById('modal-container').innerHTML = ''; },

    // ===== SETTINGS =====
    applySettings() {
        const s = Storage.getSettings();
        document.documentElement.setAttribute('data-theme', s.darkMode ? 'dark' : 'light');
        document.documentElement.setAttribute('data-fontsize', s.fontSize || 'medium');
    },

    toggleSetting(key) {
        const s = Storage.getSettings();
        s[key] = !s[key];
        Storage.saveSettings(s);
        this.applySettings();
        this.renderSettings();
    },

    changeFontSize(size) { Storage.saveSettings({ fontSize: size }); this.applySettings(); },
    changeLanguage(lang) { Storage.saveSettings({ language: lang }); },

    renderSettings() {
        const s = Storage.getSettings();
        let html = `<h2 style="font-size:1.25rem;font-weight:700;margin-bottom:16px">Settings</h2>`;
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Appearance</h3>
            <div class="setting-row"><div><div class="setting-label">Dark Mode</div><div class="setting-desc">Switch to dark theme</div></div>
                <div class="toggle ${s.darkMode ? 'on' : ''}" onclick="App.toggleSetting('darkMode')"></div></div>
            <div class="setting-row"><div><div class="setting-label">Font Size</div><div class="setting-desc">Adjust text size</div></div>
                <select class="form-select" style="width:auto" onchange="App.changeFontSize(this.value)">
                    <option value="small" ${s.fontSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${s.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${s.fontSize === 'large' ? 'selected' : ''}>Large</option>
                </select></div>
        </div>`;
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Preferences</h3>
            <div class="setting-row"><div><div class="setting-label">Language</div><div class="setting-desc">App language</div></div>
                <select class="form-select" style="width:auto" onchange="App.changeLanguage(this.value)">
                    <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
                    <option value="fr" ${s.language === 'fr' ? 'selected' : ''}>Français</option>
                    <option value="es" ${s.language === 'es' ? 'selected' : ''}>Español</option>
                    <option value="ar" ${s.language === 'ar' ? 'selected' : ''}>العربية</option>
                </select></div>
            <div class="setting-row"><div><div class="setting-label">Notifications</div><div class="setting-desc">Deadline reminders</div></div>
                <div class="toggle ${s.notifications ? 'on' : ''}" onclick="App.toggleSetting('notifications')"></div></div>
        </div>`;
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Data Management</h3>
            <button class="btn btn-secondary btn-block" onclick="Exporter.exportBackup()"><i class="fas fa-download"></i> Export Backup</button>
            <input type="file" id="import-file" accept=".json" style="display:none" onchange="Exporter.importBackup(this)">
            <button class="btn btn-secondary btn-block mt-8" onclick="document.getElementById('import-file').click()"><i class="fas fa-upload"></i> Import Backup</button>
            <button class="btn btn-secondary btn-block mt-8" onclick="App.navigate('reports')"><i class="fas fa-chart-bar"></i> Reports</button>
            <button class="btn btn-danger btn-block mt-8" onclick="App.resetData()"><i class="fas fa-trash"></i> Clear All Data</button>
        </div>`;
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">About</h3>
            <p style="font-size:0.9375rem;font-weight:700">🗽 Libra CareerForge</p>
            <p class="text-light" style="font-size:0.8125rem;margin-top:4px">Build Better. Match Smarter. Apply Stronger.</p>
            <p class="text-light" style="font-size:0.75rem;margin-top:8px">Version 1.0.0</p>
            <p class="text-light" style="font-size:0.75rem;margin-top:4px">All data is stored locally on your device. No data is sent to any server unless you explicitly share it.</p>
        </div>`;
        document.getElementById('view-container').innerHTML = html;
        this.setTitle('Settings'); this.setBackButton(true);
    },

    resetData() {
        this.confirm('Clear All Data?', 'This permanently deletes all CVs, jobs, applications, and profile data.', () => {
            Storage.resetData(); this.applySettings(); this.toast('All data cleared', 'success'); this.navigate('home');
        });
    },

    // ===== HOME DASHBOARD =====
    getGreeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; },

    renderHome() {
        const stats = Storage.getStats();
        const profile = Storage.getProfile();
        const apps = Storage.getAllApplications();
        const name = profile.fullName ? profile.fullName.split(' ')[0] : 'Libra';

        let html = `<div class="dashboard-greeting">
            <h2>${this.getGreeting()}, ${this.esc(name)}</h2>
            <p>Your career command center</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-value ${stats.bestATS >= 70 ? 'success' : 'gold'}">${stats.bestATS}%</div><div class="stat-label">CV ATS</div></div>
            <div class="stat-card"><div class="stat-value">${stats.profileCompletion}%</div><div class="stat-label">Profile</div></div>
            <div class="stat-card"><div class="stat-value">${stats.activeApplications}</div><div class="stat-label">Active</div></div>
            <div class="stat-card"><div class="stat-value gold">${stats.interviews}</div><div class="stat-label">Interviews</div></div>
            <div class="stat-card"><div class="stat-value">${stats.savedJobs}</div><div class="stat-label">Jobs</div></div>
            <div class="stat-card"><div class="stat-value ${stats.upcomingDeadlines > 0 ? 'gold' : ''}">${stats.upcomingDeadlines}</div><div class="stat-label">Deadlines</div></div>
        </div>
        <div class="action-grid">
            <div class="action-card" onclick="App.navigate('cv')"><div class="icon-wrap navy"><i class="fas fa-file-lines"></i></div><h3>Build Your CV</h3><p>Create professional CVs</p></div>
            <div class="action-card" onclick="App.navigate('job/analyze')"><div class="icon-wrap gold"><i class="fas fa-bullseye"></i></div><h3>Analyze a Job</h3><p>Match your CV to jobs</p></div>
            <div class="action-card" onclick="App.navigate('job')"><div class="icon-wrap green"><i class="fas fa-wand-magic-sparkles"></i></div><h3>Tailor My CV</h3><p>Optimize for a job</p></div>
            <div class="action-card" onclick="AppTracker.renderEdit()"><div class="icon-wrap blue"><i class="fas fa-briefcase"></i></div><h3>Create Application</h3><p>Track a new role</p></div>
        </div>`;

        // Pipeline
        html += '<div class="section-header"><span class="section-title">Application Pipeline</span></div>';
        html += '<div class="pipeline-container"><div class="pipeline">';
        [['saved','Saved'],['preparing','Preparing'],['applied','Applied'],['interview','Interview'],['assessment','Assessment'],['offer','Offer'],['rejected','Rejected']].forEach(([status, label]) => {
            const count = apps.filter(a => a.status === status).length;
            const cls = count > 0 ? (status === 'rejected' ? 'rejected' : status === 'offer' ? 'done' : 'active') : 'empty';
            html += `<div class="pipeline-stage"><div class="dot ${cls}">${count}</div><div class="label">${label}</div></div>`;
        });
        html += '</div></div>';

        // Recent applications
        const recent = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        if (recent.length > 0) {
            html += '<div class="section-header"><span class="section-title">Recent Applications</span></div>';
            recent.forEach(a => {
                html += `<div class="card card-tappable" onclick="AppTracker.renderDetail('${a.id}')">
                    <div class="flex-between">
                        <div style="flex:1"><h3 style="font-size:0.9375rem;font-weight:600">${this.esc(a.position)}</h3>
                        <p class="text-light" style="font-size:0.75rem">${this.esc(a.company)}</p></div>
                        <div class="text-center">
                            <span class="badge ${AppTracker.getStatusColor(a.status)}">${AppTracker.getStatusLabel(a.status)}</span>
                            ${a.atsMatch ? `<div style="margin-top:4px"><span class="pill badge-gold">ATS ${a.atsMatch}%</span></div>` : ''}
                        </div></div></div>`;
            });
        }

        // Upcoming deadlines
        const now = new Date();
        const deadlines = apps.filter(a => a.deadline && new Date(a.deadline) >= now && !['rejected', 'withdrawn'].includes(a.status)).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);
        if (deadlines.length > 0) {
            html += '<div class="section-header"><span class="section-title">Upcoming Deadlines</span></div>';
            deadlines.forEach(a => {
                const days = Math.ceil((new Date(a.deadline) - now) / (86400000));
                html += `<div class="card card-tappable" onclick="AppTracker.renderDetail('${a.id}')">
                    <div class="flex-between">
                        <div><h3 style="font-size:0.875rem;font-weight:600">${this.esc(a.position)}</h3>
                        <p class="text-light" style="font-size:0.75rem">${this.esc(a.company)}</p></div>
                        <span class="badge ${days <= 3 ? 'badge-danger' : days <= 7 ? 'badge-warning' : 'badge-info'}">${days}d left</span>
                    </div></div>`;
            });
        }

        if (apps.length === 0) {
            html += `<div class="empty-state" style="padding:24px"><i class="fas fa-briefcase"></i>
                <h3>No applications yet</h3><p>Add an application or analyze a job to get started</p></div>`;
        }

        document.getElementById('view-container').innerHTML = html;
        this.setTitle('Libra CareerForge'); this.setBackButton(false);
    },

    // ===== PROFILE =====
    renderProfile() {
        const p = Storage.getProfile();
        const completion = Storage.calcProfileCompletion(p);
        let html = `<div class="flex-between mb-16">
            <div><h2 style="font-size:1.25rem;font-weight:700">Profile</h2>
            <p class="text-light" style="font-size:0.8125rem">Single source of truth for all CVs</p></div>
            <span class="badge badge-gold">${completion}% complete</span>
        </div>`;

        // Personal info
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Personal Information</h3>
            <div class="form-group"><label class="form-label">Full Name</label>
                <input class="form-input" value="${this.esc(p.fullName)}" placeholder="John Doe" oninput="App.saveProfileField('fullName', this.value)"></div>
            <div class="form-group"><label class="form-label">Professional Title</label>
                <input class="form-input" value="${this.esc(p.professionalTitle)}" placeholder="Senior Software Engineer" oninput="App.saveProfileField('professionalTitle', this.value)"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Phone</label>
                    <input class="form-input" value="${this.esc(p.phone)}" placeholder="+1 234 567 890" oninput="App.saveProfileField('phone', this.value)"></div>
                <div class="form-group"><label class="form-label">Email</label>
                    <input type="email" class="form-input" value="${this.esc(p.email)}" placeholder="john@example.com" oninput="App.saveProfileField('email', this.value)"></div>
            </div>
            <div class="form-group"><label class="form-label">Location</label>
                <input class="form-input" value="${this.esc(p.location)}" placeholder="New York, USA" oninput="App.saveProfileField('location', this.value)"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">LinkedIn</label>
                    <input class="form-input" value="${this.esc(p.linkedin)}" placeholder="linkedin.com/in/..." oninput="App.saveProfileField('linkedin', this.value)"></div>
                <div class="form-group"><label class="form-label">Portfolio</label>
                    <input class="form-input" value="${this.esc(p.portfolio)}" placeholder="johndoe.com" oninput="App.saveProfileField('portfolio', this.value)"></div>
            </div>
            <div class="form-group"><label class="form-label">Years of Experience</label>
                <input type="number" class="form-input" value="${this.esc(p.yearsOfExperience)}" placeholder="5" oninput="App.saveProfileField('yearsOfExperience', this.value)"></div>
        </div>`;

        // Summary
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Professional Summary</h3>
            <textarea class="form-textarea" placeholder="A brief summary of your professional background..." oninput="App.saveProfileField('summary', this.value)">${this.esc(p.summary)}</textarea>
        </div>`;

        // Skills (tag input)
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Skills</h3>
            <div id="profile-skills-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">`;
        (p.skills || []).forEach((s, i) => {
            html += `<span class="tag" style="background:rgba(212,167,44,0.12);color:var(--accent)">${this.esc(s)} <i class="fas fa-times" style="cursor:pointer;margin-left:4px" onclick="App.removeProfileSkill(${i})"></i></span>`;
        });
        html += `</div>
            <div class="form-row">
                <input class="form-input" id="profile-skill-input" placeholder="Type a skill and press +" onkeydown="if(event.key==='Enter'){App.addProfileSkill();event.preventDefault()}">
                <button class="btn btn-primary" onclick="App.addProfileSkill()"><i class="fas fa-plus"></i></button>
            </div>
        </div>`;

        // Education
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Education</h3>`;
        (p.education || []).forEach((e, i) => {
            html += `<div class="card" style="margin-bottom:8px;padding:12px;border:1px solid var(--border)">
                <div class="flex-between mb-8"><span class="pill badge-gray">#${i+1}</span>
                    <button class="btn btn-danger btn-sm" style="padding:6px 8px" onclick="App.deleteProfileArrayItem('education', ${i})"><i class="fas fa-trash"></i></button></div>
                <input class="form-input" placeholder="Degree" value="${this.esc(e.degree)}" oninput="App.saveProfileArrayField('education', ${i}, 'degree', this.value)">
                <input class="form-input mt-8" style="margin-top:8px" placeholder="Institution" value="${this.esc(e.institution)}" oninput="App.saveProfileArrayField('education', ${i}, 'institution', this.value)">
                <div class="form-row mt-8" style="margin-top:8px">
                    <input class="form-input" placeholder="Start Year" value="${this.esc(e.startDate)}" oninput="App.saveProfileArrayField('education', ${i}, 'startDate', this.value)">
                    <input class="form-input" placeholder="End Year" value="${this.esc(e.endDate)}" oninput="App.saveProfileArrayField('education', ${i}, 'endDate', this.value)">
                </div></div>`;
        });
        html += `<button class="btn btn-secondary btn-block btn-sm" onclick="App.addProfileArrayItem('education')"><i class="fas fa-plus"></i> Add Education</button></div>`;

        // Certifications
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Certifications</h3>`;
        (p.certifications || []).forEach((c, i) => {
            html += `<div class="card" style="margin-bottom:8px;padding:12px;border:1px solid var(--border)">
                <div class="flex-between mb-8"><span class="pill badge-gray">#${i+1}</span>
                    <button class="btn btn-danger btn-sm" style="padding:6px 8px" onclick="App.deleteProfileArrayItem('certifications', ${i})"><i class="fas fa-trash"></i></button></div>
                <input class="form-input" placeholder="Certification Name" value="${this.esc(c.name)}" oninput="App.saveProfileArrayField('certifications', ${i}, 'name', this.value)">
                <input class="form-input mt-8" style="margin-top:8px" placeholder="Issuing Organization" value="${this.esc(c.issuer)}" oninput="App.saveProfileArrayField('certifications', ${i}, 'issuer', this.value)">
                <input class="form-input mt-8" style="margin-top:8px" placeholder="Date" value="${this.esc(c.date)}" oninput="App.saveProfileArrayField('certifications', ${i}, 'date', this.value)">
            </div>`;
        });
        html += `<button class="btn btn-secondary btn-block btn-sm" onclick="App.addProfileArrayItem('certifications')"><i class="fas fa-plus"></i> Add Certification</button></div>`;

        // Languages
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Languages</h3>`;
        (p.languages || []).forEach((l, i) => {
            html += `<div class="card" style="margin-bottom:8px;padding:12px;border:1px solid var(--border)">
                <div class="flex-between mb-8"><span class="pill badge-gray">#${i+1}</span>
                    <button class="btn btn-danger btn-sm" style="padding:6px 8px" onclick="App.deleteProfileArrayItem('languages', ${i})"><i class="fas fa-trash"></i></button></div>
                <input class="form-input" placeholder="Language" value="${this.esc(l.name)}" oninput="App.saveProfileArrayField('languages', ${i}, 'name', this.value)">
                <select class="form-select mt-8" style="margin-top:8px" onchange="App.saveProfileArrayField('languages', ${i}, 'proficiency', this.value)">
                    ${['Basic','Conversational','Professional','Fluent','Native'].map(o => `<option value="${o}" ${l.proficiency === o ? 'selected' : ''}>${o}</option>`).join('')}
                </select></div>`;
        });
        html += `<button class="btn btn-secondary btn-block btn-sm" onclick="App.addProfileArrayItem('languages')"><i class="fas fa-plus"></i> Add Language</button></div>`;

        // Career interests
        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px">Career Interests</h3>
            <textarea class="form-textarea" placeholder="Describe your career goals and interests..." oninput="App.saveProfileField('careerInterests', this.value)">${this.esc(p.careerInterests)}</textarea>
        </div>`;

        document.getElementById('view-container').innerHTML = html;
        this.setTitle('Profile'); this.setBackButton(false);
    },

    saveProfileField(field, value) {
        const p = Storage.getProfile();
        p[field] = value;
        Storage.saveProfile(p);
    },

    addProfileSkill() {
        const input = document.getElementById('profile-skill-input');
        const skill = input.value.trim();
        if (!skill) return;
        const p = Storage.getProfile();
        p.skills = p.skills || [];
        p.skills.push(skill);
        Storage.saveProfile(p);
        input.value = '';
        this.renderProfile();
    },

    removeProfileSkill(index) {
        const p = Storage.getProfile();
        p.skills.splice(index, 1);
        Storage.saveProfile(p);
        this.renderProfile();
    },

    addProfileArrayItem(section) {
        const p = Storage.getProfile();
        p[section] = p[section] || [];
        const newItem = section === 'languages' ? { name: '', proficiency: 'Professional' } : section === 'certifications' ? { name: '', issuer: '', date: '' } : { degree: '', institution: '', startDate: '', endDate: '' };
        p[section].push(newItem);
        Storage.saveProfile(p);
        this.renderProfile();
    },

    saveProfileArrayField(section, index, field, value) {
        const p = Storage.getProfile();
        if (p[section] && p[section][index]) { p[section][index][field] = value; Storage.saveProfile(p); }
    },

    deleteProfileArrayItem(section, index) {
        const p = Storage.getProfile();
        p[section].splice(index, 1);
        Storage.saveProfile(p);
        this.renderProfile();
    },

    // ===== SEARCH =====
    renderSearch() {
        document.getElementById('view-container').innerHTML = `
            <div class="search-input-wrap"><i class="fas fa-search"></i>
                <input class="form-input search-input" id="global-search" placeholder="Search CVs, jobs, applications..." oninput="App.performSearch(this.value)" autofocus>
            </div>
            <div id="search-results"></div>`;
        this.setTitle('Search'); this.setBackButton(true);
    },

    performSearch(query) {
        const results = document.getElementById('search-results');
        if (!query || query.trim().length < 2) { results.innerHTML = ''; return; }
        const q = query.toLowerCase();
        let html = '';

        const cvs = Storage.getAllCVs().filter(c => c.name.toLowerCase().includes(q));
        if (cvs.length) {
            html += '<div class="search-result-section"><h4>CVs</h4>';
            cvs.forEach(c => html += `<div class="card card-tappable" onclick="App.navigate('cv/edit/${c.id}')"><div class="list-item"><div class="list-item-icon"><i class="fas fa-file-lines"></i></div><div class="list-item-body"><div class="list-item-title">${this.esc(c.name)}</div><div class="list-item-subtitle">${CVMgr.getTemplateName(c.template)}</div></div></div></div>`);
            html += '</div>';
        }

        const jobs = Storage.getAllJobs().filter(j => (j.jobTitle || '').toLowerCase().includes(q) || (j.company || '').toLowerCase().includes(q));
        if (jobs.length) {
            html += '<div class="search-result-section"><h4>Jobs</h4>';
            jobs.forEach(j => html += `<div class="card card-tappable" onclick="App.navigate('job/results/${j.id}')"><div class="list-item"><div class="list-item-icon"><i class="fas fa-bullseye"></i></div><div class="list-item-body"><div class="list-item-title">${this.esc(j.jobTitle)}</div><div class="list-item-subtitle">${this.esc(j.company)} • ${j.matchScore ? j.matchScore.overall + '% match' : 'No match'}</div></div></div></div>`);
            html += '</div>';
        }

        const apps = Storage.getAllApplications().filter(a => (a.position || '').toLowerCase().includes(q) || (a.company || '').toLowerCase().includes(q));
        if (apps.length) {
            html += '<div class="search-result-section"><h4>Applications</h4>';
            apps.forEach(a => html += `<div class="card card-tappable" onclick="AppTracker.renderDetail('${a.id}')"><div class="list-item"><div class="list-item-icon"><i class="fas fa-briefcase"></i></div><div class="list-item-body"><div class="list-item-title">${this.esc(a.position)}</div><div class="list-item-subtitle">${this.esc(a.company)} • ${AppTracker.getStatusLabel(a.status)}</div></div></div></div>`);
            html += '</div>';
        }

        const profile = Storage.getProfile();
        const skills = (profile.skills || []).filter(s => s.toLowerCase().includes(q));
        if (skills.length) {
            html += '<div class="search-result-section"><h4>Skills</h4><div class="card">';
            skills.forEach(s => html += `<span class="tag">${this.esc(s)}</span>`);
            html += '</div></div>';
        }

        if (!html) html = '<div class="empty-state"><i class="fas fa-search"></i><h3>No results found</h3><p>Try a different search term</p></div>';
        results.innerHTML = html;
    },

    // ===== REPORTS =====
    renderReports() {
        const reports = [
            { type: 'cv-health', icon: 'file-medical', title: 'CV Health Report', desc: 'Overview of all CVs and their ATS scores' },
            { type: 'ats', icon: 'circle-check', title: 'ATS Report', desc: 'Detailed ATS compatibility analysis' },
            { type: 'job-match', icon: 'bullseye', title: 'Job Match Report', desc: 'Match scores for analyzed jobs' },
            { type: 'application-activity', icon: 'chart-line', title: 'Application Activity', desc: 'Summary of your application pipeline' },
            { type: 'skills-gap', icon: 'gaps', title: 'Skills Gap Report', desc: 'Skills missing from your profile vs jobs' },
        ];
        let html = `<h2 style="font-size:1.25rem;font-weight:700;margin-bottom:16px">Reports</h2>
            <p class="text-light mb-16" style="font-size:0.8125rem">Generate and print career reports. Tap a report to print or save as PDF.</p>`;
        reports.forEach(r => {
            html += `<div class="report-card" onclick="Exporter.exportReport('${r.type}')">
                <div class="r-icon" style="background:rgba(212,167,44,0.12);color:var(--accent)"><i class="fas fa-${r.icon}"></i></div>
                <div class="r-body"><h3>${r.title}</h3><p>${r.desc}</p></div>
                <i class="fas fa-chevron-right text-light"></i></div>`;
        });
        document.getElementById('view-container').innerHTML = html;
        this.setTitle('Reports'); this.setBackButton(true);
    },

    // ===== LIBRA AI =====
    openLibra() {
        const panel = document.getElementById('libra-panel');
        panel.classList.add('open');
        panel.innerHTML = `
            <div class="libra-panel-header">
                <div><h3>🗽 Libra AI</h3><div class="sub">Your career assistant</div></div>
                <button class="libra-close" onclick="App.closeLibra()"><i class="fas fa-times"></i></button>
            </div>
            <div class="libra-messages" id="libra-messages">
                <div class="chat-msg ai">${this.libraFormat(this.libraGreeting())}</div>
            </div>
            <div class="libra-quick">
                <button class="libra-quick-btn" onclick="App.libraQuick('How can I improve my CV?')"><i class="fas fa-file-lines"></i> Improve CV</button>
                <button class="libra-quick-btn" onclick="App.libraQuick('How do I prepare for an interview?')"><i class="fas fa-microphone-lines"></i> Interview tips</button>
                <button class="libra-quick-btn" onclick="App.libraQuick('What is my ATS score?')"><i class="fas fa-check-circle"></i> ATS score</button>
                <button class="libra-quick-btn" onclick="App.libraQuick('Can you give me career advice?')"><i class="fas fa-lightbulb"></i> Career advice</button>
            </div>
            <div class="libra-input-area">
                <input class="libra-input" id="libra-input" placeholder="Ask Libra AI..." onkeydown="if(event.key==='Enter')App.libraSend()">
                <button class="libra-send" onclick="App.libraSend()"><i class="fas fa-paper-plane"></i></button>
            </div>`;
        document.body.classList.add('no-scroll');
    },

    closeLibra() {
        document.getElementById('libra-panel').classList.remove('open');
        document.body.classList.remove('no-scroll');
    },

    libraFormat(text) { return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); },

    libraSend() {
        const input = document.getElementById('libra-input');
        const text = input.value.trim();
        if (!text) return;
        const msgs = document.getElementById('libra-messages');
        msgs.innerHTML += `<div class="chat-msg user">${this.esc(text)}</div>`;
        input.value = '';
        msgs.scrollTop = msgs.scrollHeight;
        setTimeout(() => {
            msgs.innerHTML += `<div class="chat-msg ai">${this.libraFormat(this.libraRespond(text))}</div>`;
            msgs.scrollTop = msgs.scrollHeight;
        }, 500);
    },

    libraQuick(text) {
        const msgs = document.getElementById('libra-messages');
        msgs.innerHTML += `<div class="chat-msg user">${this.esc(text)}</div>`;
        msgs.scrollTop = msgs.scrollHeight;
        setTimeout(() => {
            msgs.innerHTML += `<div class="chat-msg ai">${this.libraFormat(this.libraRespond(text))}</div>`;
            msgs.scrollTop = msgs.scrollHeight;
        }, 500);
    },

    libraGreeting() {
        const p = Storage.getProfile();
        const name = p.fullName ? p.fullName.split(' ')[0] : 'there';
        const completion = Storage.calcProfileCompletion(p);
        return `Hello ${name}! 👋 I'm Libra AI, your career assistant.\n\nI can help with CV improvement, job matching, gap analysis, interview prep, and career guidance.\n\nYour profile is ${completion}% complete. ${completion < 80 ? 'Consider completing it for better CV generation.' : 'Great job keeping it up to date!'}\n\nWhat would you like help with?`;
    },

    libraRespond(message) {
        const msg = message.toLowerCase();
        const p = Storage.getProfile();
        const cvs = Storage.getAllCVs();
        const jobs = Storage.getAllJobs();
        const apps = Storage.getAllApplications();

        if (msg.includes('cv') || msg.includes('resume')) return this.libraCVResponse(cvs);
        if (msg.includes('skill')) return this.libraSkillResponse(p, jobs);
        if (msg.includes('interview')) return this.libraInterviewResponse();
        if (msg.includes('ats')) return this.libraATSResponse(cvs);
        if (msg.includes('gap')) return this.libraGapResponse(jobs);
        if (msg.includes('cover')) return this.libraCoverResponse();
        if (msg.includes('job') || msg.includes('match')) return this.libraJobResponse(jobs);
        if (msg.includes('career')) return this.libraCareerResponse(p);
        if (msg.includes('profile')) return this.libraProfileResponse(p);
        if (msg.includes('application') || msg.includes('track')) return this.libraAppResponse(apps);
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return this.libraGreeting();
        return `I can help you with:\n\n• **CV improvement** — Tips to strengthen your CV\n• **Job matching** — Analyze how well your CV matches a job\n• **Gap analysis** — Identify missing requirements\n• **Cover letters** — Tips for writing effective cover letters\n• **Interview prep** — Prepare for your interviews\n• **Career advice** — General career guidance\n• **ATS scores** — Check your ATS compatibility\n\nWhat would you like help with?`;
    },

    libraCVResponse(cvs) {
        if (cvs.length === 0) return "You don't have any CVs yet. Go to **My CV** to create your first CV. I'll help you build a strong, ATS-friendly resume.";
        let r = `You have ${cvs.length} CV${cvs.length > 1 ? 's' : ''}.\n\n`;
        cvs.forEach(cv => {
            const ats = Scoring.atsFormattingScore(cv);
            r += `**${cv.name}** — ATS Score: ${ats.score}%\n`;
            ats.checks.filter(c => c.status !== 'pass').forEach(c => { r += `• ${c.name}: ${c.detail}\n`; });
            r += '\n';
        });
        r += '**Tips to improve:**\n• Use the ATS Minimal template for maximum compatibility\n• Aim for 8+ skills in your skills section\n• Write a summary of 30+ words\n• Include detailed work experience with quantified achievements';
        return r;
    },

    libraSkillResponse(p, jobs) {
        const skills = p.skills || [];
        if (skills.length === 0) return "You haven't listed any skills in your profile yet. Go to **Profile** and add your skills — this helps with CV generation and job matching.";
        let r = `You have ${skills.length} skills in your profile:\n${skills.map(s => '• ' + s).join('\n')}\n\n`;
        if (jobs.length > 0) {
            const allJobSkills = new Set();
            jobs.forEach(j => { (j.extracted?.allSkills || []).forEach(s => allJobSkills.add(s)); });
            const missing = [...allJobSkills].filter(s => !skills.some(ps => ps.toLowerCase().includes(s) || s.includes(ps.toLowerCase())));
            if (missing.length > 0) r += `Based on your analyzed jobs, you may be missing:\n${missing.slice(0, 8).map(s => '• ' + s).join('\n')}\n\nOnly add skills you genuinely have — never fabricate.`;
        }
        return r;
    },

    libraInterviewResponse() {
        return `Here are my interview preparation tips:\n\n**1. Research** — Study the company, role, and recent news.\n**2. STAR stories** — Prepare 3-5 stories using Situation, Task, Action, Result.\n**3. Practice** — Rehearse common questions out loud.\n**4. Questions to ask** — Prepare 3-5 thoughtful questions.\n**5. Logistics** — Plan arrival, dress professionally, test tech for virtual interviews.\n\nUse the **Interview Prep** feature to generate job-specific questions and practice your answers. You can also use the STAR framework template and readiness checklist.`;
    },

    libraATSResponse(cvs) {
        if (cvs.length === 0) return "You don't have any CVs to check. Create a CV first, then run an ATS check.";
        let r = '';
        cvs.forEach(cv => {
            const ats = Scoring.atsFormattingScore(cv);
            r += `**${cv.name}**: ${ats.score}%\n`;
            ats.checks.forEach(c => { r += `${c.status === 'pass' ? '✓' : c.status === 'warning' ? '△' : '✗'} ${c.name}: ${c.detail}\n`; });
            r += '\n';
        });
        r += 'Use the **ATS Minimal** template for maximum compatibility with automated systems.';
        return r;
    },

    libraGapResponse(jobs) {
        if (jobs.length === 0) return "You haven't analyzed any jobs yet. Go to **Job Match** and paste a job description to see a detailed gap analysis.";
        const job = jobs[0];
        if (!job.matchScore) return "Your most recent job analysis doesn't have match data. Try re-analyzing with a CV selected.";
        const s = job.matchScore;
        return `Gap analysis for **${job.jobTitle} at ${job.company}**:\n\n**Overall Match:** ${s.overall}%\n• Skills: ${s.skills.score}% (${s.skills.matched.length} matched, ${s.skills.missing.length} missing)\n• Experience: ${s.experience.score}%\n• Education: ${s.education.score}%\n• Certifications: ${s.certification.score}%\n\n${s.skills.missing.length > 0 ? '**Missing skills:** ' + s.skills.missing.slice(0, 5).join(', ') : 'No missing skills detected.'}\n\nGo to **Gap Analysis** for detailed recommendations. Never fabricate experience — only highlight what you genuinely have.`;
    },

    libraCoverResponse() {
        return `Tips for writing effective cover letters:\n\n• **Address the hiring manager** by name if possible\n• **Open strong** — mention the role and why you're interested\n• **Match your skills** to the job requirements (only skills you actually have)\n• **Show, don't tell** — use specific examples from your experience\n• **Keep it concise** — 3-4 paragraphs maximum\n• **Close with a call to action** — request an interview\n\nUse the **Application Pack** feature to generate a tailored cover letter from your profile and job description.`;
    },

    libraJobResponse(jobs) {
        if (jobs.length === 0) return "You haven't analyzed any jobs yet. Go to **Job Match** → Analyze, paste a job description, and I'll calculate your match score.";
        let r = `You've analyzed ${jobs.length} job${jobs.length > 1 ? 's' : ''}:\n\n`;
        jobs.forEach(j => { r += `• **${j.jobTitle}** at ${j.company} — ${j.matchScore ? j.matchScore.overall + '% match' : 'No match data'}\n`; });
        r += '\nUse **Tailor CV** to optimize your CV for a specific job, or **Application Pack** to generate a cover letter and email.';
        return r;
    },

    libraCareerResponse(p) {
        let r = 'Here are some career tips based on your profile:\n\n';
        if (p.yearsOfExperience) r += `• You have ${p.yearsOfExperience} years of experience. Highlight quantified achievements in your CV.\n`;
        if ((p.skills || []).length > 0) r += `• Your top skills (${p.skills.slice(0, 3).join(', ')}) should be prominently featured.\n`;
        r += "• Tailor your CV for each application — don't use a one-size-fits-all approach.\n";
        r += '• Network actively on LinkedIn and at industry events.\n';
        r += '• Keep learning — identify skills in demand and pursue relevant training.\n';
        r += '• Track all applications and follow up within a week.\n';
        return r;
    },

    libraProfileResponse(p) {
        const completion = Storage.calcProfileCompletion(p);
        let r = `Your profile is ${completion}% complete.\n\n`;
        if (!p.fullName) r += '• Add your full name\n';
        if (!p.email) r += '• Add your email\n';
        if (!p.professionalTitle) r += '• Add your professional title\n';
        if (!p.summary) r += '• Add a professional summary\n';
        if (!p.linkedin) r += '• Add your LinkedIn profile\n';
        if ((p.skills || []).length < 5) r += `• Add more skills (you have ${p.skills?.length || 0}, recommend 8+)\n`;
        if ((p.education || []).length === 0) r += '• Add your education\n';
        if (completion >= 80) r += 'Your profile looks great! This helps generate better CVs and match scores.\n';
        return r;
    },

    libraAppResponse(apps) {
        if (apps.length === 0) return "You don't have any applications yet. Go to **Applications** → Add to start tracking your job applications.";
        const active = apps.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length;
        const interviews = apps.filter(a => ['interview', 'final', 'assessment'].includes(a.status)).length;
        return `You have ${apps.length} total applications:\n• ${active} active\n• ${interviews} in interview stage\n• ${apps.filter(a => a.status === 'offer').length} offers\n\nUse the **Applications** tab to track statuses, add notes, and manage your pipeline.`;
    },
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => App.init());
