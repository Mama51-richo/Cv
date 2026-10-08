// ===== APPLICATION TRACKER - Full application management =====

const AppTracker = {
    esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },

    STATUSES: [
        { value: 'saved', label: 'Saved', color: 'badge-gray' },
        { value: 'preparing', label: 'Preparing', color: 'badge-info' },
        { value: 'applied', label: 'Applied', color: 'badge-navy' },
        { value: 'screening', label: 'Screening', color: 'badge-info' },
        { value: 'interview', label: 'Interview', color: 'badge-gold' },
        { value: 'assessment', label: 'Assessment', color: 'badge-warning' },
        { value: 'final', label: 'Final Stage', color: 'badge-info' },
        { value: 'offer', label: 'Offer', color: 'badge-success' },
        { value: 'rejected', label: 'Rejected', color: 'badge-danger' },
        { value: 'withdrawn', label: 'Withdrawn', color: 'badge-gray' },
    ],

    getStatusColor(s) { return (this.STATUSES.find(x => x.value === s) || {}).color || 'badge-gray'; },
    getStatusLabel(s) { return (this.STATUSES.find(x => x.value === s) || {}).label || s; },

    filterStatus: 'all',
    sortBy: 'date-desc',
    searchQuery: '',

    renderList() {
        const apps = this.getFilteredApps();
        const allApps = Storage.getAllApplications();

        let html = `<div class="flex-between mb-16">
            <div><h2 style="font-size:1.25rem;font-weight:700">Applications</h2>
            <p class="text-light" style="font-size:0.8125rem">${allApps.length} total applications</p></div>
            <button class="btn btn-primary btn-sm" onclick="AppTracker.renderEdit()"><i class="fas fa-plus"></i> Add</button>
        </div>`;

        // Stats
        const active = allApps.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length;
        const interviews = allApps.filter(a => ['interview', 'final', 'assessment'].includes(a.status)).length;
        const offers = allApps.filter(a => a.status === 'offer').length;
        html += `<div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
            <div class="stat-card"><div class="stat-value">${active}</div><div class="stat-label">Active</div></div>
            <div class="stat-card"><div class="stat-value gold">${interviews}</div><div class="stat-label">Interviews</div></div>
            <div class="stat-card"><div class="stat-value success">${offers}</div><div class="stat-label">Offers</div></div>
        </div>`;

        // Search & filters
        html += `<div class="card">
            <div class="search-input-wrap" style="margin-bottom:8px">
                <i class="fas fa-search"></i>
                <input class="form-input search-input" placeholder="Search applications..." value="${this.esc(this.searchQuery)}"
                    oninput="AppTracker.search(this.value)">
            </div>
            <div class="form-row">
                <select class="form-select" onchange="AppTracker.setFilter(this.value)">
                    <option value="all">All Statuses</option>
                    ${this.STATUSES.map(s => `<option value="${s.value}" ${this.filterStatus === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
                </select>
                <select class="form-select" onchange="AppTracker.setSort(this.value)">
                    <option value="date-desc" ${this.sortBy === 'date-desc' ? 'selected' : ''}>Newest First</option>
                    <option value="date-asc" ${this.sortBy === 'date-asc' ? 'selected' : ''}>Oldest First</option>
                    <option value="company" ${this.sortBy === 'company' ? 'selected' : ''}>Company A-Z</option>
                    <option value="position" ${this.sortBy === 'position' ? 'selected' : ''}>Position A-Z</option>
                    <option value="ats-desc" ${this.sortBy === 'ats-desc' ? 'selected' : ''}>Best ATS Match</option>
                    <option value="status" ${this.sortBy === 'status' ? 'selected' : ''}>Status</option>
                </select>
            </div>
        </div>`;

        if (apps.length === 0) {
            html += `<div class="empty-state"><i class="fas fa-briefcase"></i>
                <h3>No applications found</h3>
                <p>${this.searchQuery || this.filterStatus !== 'all' ? 'Try adjusting your filters' : 'Add your first application'}</p>
                ${!this.searchQuery && this.filterStatus === 'all' ? '<button class="btn btn-primary" onclick="AppTracker.renderEdit()"><i class="fas fa-plus"></i> Add Application</button>' : ''}
            </div>`;
        } else {
            apps.forEach(a => {
                html += `<div class="card card-tappable" onclick="AppTracker.renderDetail('${a.id}')">
                    <div class="flex-between">
                        <div style="flex:1">
                            <h3 style="font-size:0.9375rem;font-weight:600">${this.esc(a.position || 'Untitled Position')}</h3>
                            <p class="text-light" style="font-size:0.75rem;margin-top:2px">${this.esc(a.company || 'Unknown')} ${a.location ? '• ' + this.esc(a.location) : ''}</p>
                        </div>
                        <span class="badge ${this.getStatusColor(a.status)}">${this.getStatusLabel(a.status)}</span>
                    </div>
                    <div class="flex-between mt-8">
                        <span class="text-light" style="font-size:0.75rem">${a.applicationDate ? 'Applied ' + new Date(a.applicationDate).toLocaleDateString() : 'Saved ' + new Date(a.createdAt).toLocaleDateString()}</span>
                        ${a.atsMatch ? `<span class="pill badge-gold">ATS ${a.atsMatch}%</span>` : ''}
                    </div>
                </div>`;
            });
        }

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Applications'); App.setBackButton(false);
    },

    getFilteredApps() {
        let apps = Storage.getAllApplications();
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            apps = apps.filter(a => (a.position || '').toLowerCase().includes(q) || (a.company || '').toLowerCase().includes(q) || (a.location || '').toLowerCase().includes(q) || (a.notes || '').toLowerCase().includes(q));
        }
        if (this.filterStatus !== 'all') apps = apps.filter(a => a.status === this.filterStatus);
        switch (this.sortBy) {
            case 'date-desc': apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
            case 'date-asc': apps.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'company': apps.sort((a, b) => (a.company || '').localeCompare(b.company || '')); break;
            case 'position': apps.sort((a, b) => (a.position || '').localeCompare(b.position || '')); break;
            case 'ats-desc': apps.sort((a, b) => (b.atsMatch || 0) - (a.atsMatch || 0)); break;
            case 'status': apps.sort((a, b) => (a.status || '').localeCompare(b.status || '')); break;
        }
        return apps;
    },

    search(q) { this.searchQuery = q; this.renderList(); },
    setFilter(s) { this.filterStatus = s; this.renderList(); },
    setSort(s) { this.sortBy = s; this.renderList(); },

    renderEdit(id) {
        const app = id ? Storage.getApplication(id) : null;
        const cvs = Storage.getAllCVs();
        const a = app || {};

        let html = `<div class="card">
            <h3 style="font-size:1.0625rem;font-weight:600;margin-bottom:12px">${app ? 'Edit Application' : 'New Application'}</h3>
            <div class="form-group"><label class="form-label">Position <span class="req">*</span></label>
                <input class="form-input" id="app-position" value="${this.esc(a.position || '')}" placeholder="Job Title"></div>
            <div class="form-group"><label class="form-label">Company <span class="req">*</span></label>
                <input class="form-input" id="app-company" value="${this.esc(a.company || '')}" placeholder="Company Name"></div>
            <div class="form-group"><label class="form-label">Location</label>
                <input class="form-input" id="app-location" value="${this.esc(a.location || '')}" placeholder="City, Country"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Salary Range</label>
                    <input class="form-input" id="app-salary" value="${this.esc(a.salary || '')}" placeholder="$80k-$100k"></div>
                <div class="form-group"><label class="form-label">ATS Match %</label>
                    <input type="number" class="form-input" id="app-ats" value="${a.atsMatch || ''}" placeholder="0-100"></div>
            </div>
            <div class="form-group"><label class="form-label">Job URL</label>
                <input class="form-input" id="app-url" value="${this.esc(a.jobUrl || '')}" placeholder="https://..."></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Application Date</label>
                    <input type="date" class="form-input" id="app-appdate" value="${a.applicationDate ? a.applicationDate.split('T')[0] : ''}"></div>
                <div class="form-group"><label class="form-label">Deadline</label>
                    <input type="date" class="form-input" id="app-deadline" value="${a.deadline || ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Contact Person</label>
                    <input class="form-input" id="app-contact" value="${this.esc(a.contactPerson || '')}" placeholder="Recruiter name"></div>
                <div class="form-group"><label class="form-label">Contact Email</label>
                    <input type="email" class="form-input" id="app-contactemail" value="${this.esc(a.contactEmail || '')}" placeholder="recruiter@company.com"></div>
            </div>
            <div class="form-group"><label class="form-label">Status</label>
                <select class="form-select" id="app-status">
                    ${this.STATUSES.map(s => `<option value="${s.value}" ${a.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
                </select></div>
            <div class="form-group"><label class="form-label">Interview Date</label>
                <input type="datetime-local" class="form-input" id="app-interviewdate" value="${a.interviewDate || ''}"></div>
            <div class="form-group"><label class="form-label">CV Version Used</label>
                <select class="form-select" id="app-cvversion">
                    <option value="">None</option>
                    ${cvs.map(c => `<option value="${c.id}" ${a.cvVersionId === c.id ? 'selected' : ''}>${this.esc(c.name)}</option>`).join('')}
                </select></div>
            <div class="form-group"><label class="form-label">Cover Letter</label>
                <textarea class="form-textarea" id="app-coverletter" placeholder="Paste or type cover letter...">${this.esc(a.coverLetter || '')}</textarea></div>
            <div class="form-group"><label class="form-label">Notes</label>
                <textarea class="form-textarea" id="app-notes" placeholder="Any additional notes...">${this.esc(a.notes || '')}</textarea></div>
            <div class="btn-group">
                <button class="btn btn-primary btn-block" onclick="AppTracker.save('${id || ''}')"><i class="fas fa-save"></i> Save</button>
                ${app ? `<button class="btn btn-danger" onclick="AppTracker.delete('${id}')"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        </div>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle(app ? 'Edit Application' : 'New Application'); App.setBackButton(true);
    },

    save(id) {
        const position = document.getElementById('app-position').value.trim();
        const company = document.getElementById('app-company').value.trim();
        if (!position || !company) { App.toast('Position and company are required', 'danger'); return; }

        const app = id ? Storage.getApplication(id) : { id: Storage.uuid(), dateSaved: new Date().toISOString(), createdAt: new Date().toISOString() };
        app.position = position;
        app.company = company;
        app.location = document.getElementById('app-location').value;
        app.salary = document.getElementById('app-salary').value;
        app.atsMatch = parseInt(document.getElementById('app-ats').value) || 0;
        app.jobUrl = document.getElementById('app-url').value;
        app.applicationDate = document.getElementById('app-appdate').value || null;
        app.deadline = document.getElementById('app-deadline').value || null;
        app.contactPerson = document.getElementById('app-contact').value;
        app.contactEmail = document.getElementById('app-contactemail').value;
        app.status = document.getElementById('app-status').value;
        app.interviewDate = document.getElementById('app-interviewdate').value || null;
        app.cvVersionId = document.getElementById('app-cvversion').value || null;
        app.coverLetter = document.getElementById('app-coverletter').value;
        app.notes = document.getElementById('app-notes').value;

        Storage.saveApplication(app);
        App.toast('Application saved', 'success');
        App.navigate('applications');
    },

    delete(id) {
        App.confirm('Delete this application?', 'This action cannot be undone.', () => {
            Storage.deleteApplication(id); App.toast('Deleted', 'success'); App.navigate('applications');
        });
    },

    renderDetail(id) {
        const a = Storage.getApplication(id);
        if (!a) { App.navigate('applications'); return; }

        let html = `<div class="card">
            <div class="flex-between">
                <div style="flex:1">
                    <h2 style="font-size:1.125rem;font-weight:700">${this.esc(a.position)}</h2>
                    <p class="text-light" style="font-size:0.875rem">${this.esc(a.company)} ${a.location ? '• ' + this.esc(a.location) : ''}</p>
                </div>
                <span class="badge ${this.getStatusColor(a.status)}">${this.getStatusLabel(a.status)}</span>
            </div>
        </div>`;

        if (a.atsMatch) html += `<div class="card"><div class="flex-between"><span style="font-size:0.875rem">ATS Match Score</span><span class="badge badge-gold">${a.atsMatch}%</span></div></div>`;
        if (a.salary) html += `<div class="card"><div class="flex-between"><span style="font-size:0.875rem">Salary Range</span><span>${this.esc(a.salary)}</span></div></div>`;
        if (a.jobUrl) html += `<div class="card"><a href="${this.esc(a.jobUrl)}" target="_blank" style="font-size:0.875rem;color:var(--accent)"><i class="fas fa-external-link-alt"></i> View Job Posting</a></div>`;
        if (a.applicationDate) html += `<div class="card"><div class="flex-between"><span style="font-size:0.875rem">Applied Date</span><span>${new Date(a.applicationDate).toLocaleDateString()}</span></div></div>`;
        if (a.deadline) html += `<div class="card"><div class="flex-between"><span style="font-size:0.875rem">Deadline</span><span class="${new Date(a.deadline) < new Date() ? 'text-danger' : ''}">${new Date(a.deadline).toLocaleDateString()}</span></div></div>`;
        if (a.interviewDate) html += `<div class="card" style="background:rgba(212,167,44,0.08);border:1px solid rgba(212,167,44,0.2)"><div class="flex-between"><span style="font-size:0.875rem;font-weight:600"><i class="fas fa-calendar text-gold"></i> Interview</span><span>${new Date(a.interviewDate).toLocaleString()}</span></div></div>`;
        if (a.contactPerson || a.contactEmail) html += `<div class="card"><h4 style="font-size:0.8125rem;font-weight:600;margin-bottom:4px">Contact</h4>${a.contactPerson ? '<p style="font-size:0.8125rem">' + this.esc(a.contactPerson) + '</p>' : ''}${a.contactEmail ? '<p style="font-size:0.8125rem"><a href="mailto:' + this.esc(a.contactEmail) + '">' + this.esc(a.contactEmail) + '</a></p>' : ''}</div>`;
        if (a.cvVersionId) { const cv = Storage.getCV(a.cvVersionId); if (cv) html += `<div class="card"><div class="flex-between"><span style="font-size:0.875rem">CV Used</span><span>${this.esc(cv.name)}</span></div></div>`; }
        if (a.coverLetter) html += `<div class="card"><h4 style="font-size:0.8125rem;font-weight:600;margin-bottom:4px">Cover Letter</h4><p style="font-size:0.8125rem;white-space:pre-wrap">${this.esc(a.coverLetter)}</p></div>`;
        if (a.notes) html += `<div class="card"><h4 style="font-size:0.8125rem;font-weight:600;margin-bottom:4px">Notes</h4><p style="font-size:0.8125rem;white-space:pre-wrap">${this.esc(a.notes)}</p></div>`;

        // Quick status update
        html += `<div class="card"><label class="form-label">Quick Status Update</label>
            <select class="form-select" onchange="AppTracker.quickStatus('${id}', this.value)">
                ${this.STATUSES.map(s => `<option value="${s.value}" ${a.status === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
            </select></div>`;

        // Actions
        html += `<div class="btn-group mt-16">
            <button class="btn btn-primary" onclick="AppTracker.renderEdit('${id}')"><i class="fas fa-pen"></i> Edit</button>
            ${a.jobId ? `<button class="btn btn-secondary" onclick="App.navigate('job/results/${a.jobId}')"><i class="fas fa-chart-line"></i> Analysis</button>` : ''}
        </div>`;
        if (a.jobId) html += `<button class="btn btn-secondary btn-block mt-8" onclick="App.navigate('interview/${a.jobId}')"><i class="fas fa-microphone-lines"></i> Interview Prep</button>`;
        html += `<button class="btn btn-danger btn-block mt-8" onclick="AppTracker.delete('${id}')"><i class="fas fa-trash"></i> Delete</button>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Application Details'); App.setBackButton(true);
    },

    quickStatus(id, status) {
        const a = Storage.getApplication(id);
        if (!a) return;
        a.status = status;
        Storage.saveApplication(a);
        App.toast('Status updated', 'success');
    },
};
