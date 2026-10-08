// ===== CV MANAGER - Builder, Editor, Preview, ATS Check =====

const CVMgr = {
    currentCV: null,
    openSections: new Set(['personalInfo', 'summary']),

    SECTIONS: {
        personalInfo: {
            title: 'Personal Information', icon: 'id-card', type: 'object',
            fields: [
                { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { key: 'headline', label: 'Professional Headline', type: 'text', placeholder: 'Senior Software Engineer' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
                { key: 'phone', label: 'Phone', type: 'text', placeholder: '+1 234 567 890' },
                { key: 'location', label: 'Location', type: 'text', placeholder: 'New York, USA' },
                { key: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: 'linkedin.com/in/johndoe' },
                { key: 'portfolio', label: 'Portfolio', type: 'text', placeholder: 'johndoe.com' },
            ],
        },
        summary: {
            title: 'Professional Summary', icon: 'align-left', type: 'text', field: 'summary',
            placeholder: 'A brief summary of your professional background, key skills, and career goals...',
        },
        workExperience: {
            title: 'Work Experience', icon: 'briefcase', type: 'array',
            fields: [
                { key: 'title', label: 'Job Title', type: 'text', placeholder: 'Software Engineer' },
                { key: 'company', label: 'Company', type: 'text', placeholder: 'Tech Corp' },
                { key: 'location', label: 'Location', type: 'text', placeholder: 'New York, USA' },
                { key: 'startDate', label: 'Start Date', type: 'text', placeholder: 'Jan 2020' },
                { key: 'endDate', label: 'End Date', type: 'text', placeholder: 'Present' },
                { key: 'description', label: 'Description (one bullet per line)', type: 'textarea', placeholder: 'Led development of...\nImplemented...\nAchieved...' },
            ],
        },
        education: {
            title: 'Education', icon: 'graduation-cap', type: 'array',
            fields: [
                { key: 'degree', label: 'Degree', type: 'text', placeholder: 'B.Sc. Computer Science' },
                { key: 'institution', label: 'Institution', type: 'text', placeholder: 'University Name' },
                { key: 'field', label: 'Field of Study', type: 'text', placeholder: 'Computer Science' },
                { key: 'startDate', label: 'Start Date', type: 'text', placeholder: '2016' },
                { key: 'endDate', label: 'End Date', type: 'text', placeholder: '2020' },
                { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Relevant coursework, honors, activities...' },
            ],
        },
        skills: {
            title: 'Skills', icon: 'wrench', type: 'array',
            fields: [
                { key: 'name', label: 'Skill Name', type: 'text', placeholder: 'JavaScript' },
                { key: 'level', label: 'Proficiency', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
            ],
        },
        certifications: {
            title: 'Certifications', icon: 'certificate', type: 'array',
            fields: [
                { key: 'name', label: 'Certification Name', type: 'text', placeholder: 'AWS Certified Solutions Architect' },
                { key: 'issuer', label: 'Issuing Organization', type: 'text', placeholder: 'Amazon Web Services' },
                { key: 'date', label: 'Date Obtained', type: 'text', placeholder: 'Jan 2023' },
                { key: 'expiry', label: 'Expiry Date', type: 'text', placeholder: 'Jan 2026' },
            ],
        },
        languages: {
            title: 'Languages', icon: 'language', type: 'array',
            fields: [
                { key: 'name', label: 'Language', type: 'text', placeholder: 'English' },
                { key: 'proficiency', label: 'Proficiency', type: 'select', options: ['Basic', 'Conversational', 'Professional', 'Fluent', 'Native'] },
            ],
        },
        achievements: {
            title: 'Achievements', icon: 'trophy', type: 'array',
            fields: [
                { key: 'title', label: 'Achievement', type: 'text', placeholder: 'Employee of the Year' },
                { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Recognized for...' },
                { key: 'date', label: 'Date', type: 'text', placeholder: '2023' },
            ],
        },
        projects: {
            title: 'Projects', icon: 'folder', type: 'array',
            fields: [
                { key: 'name', label: 'Project Name', type: 'text', placeholder: 'E-commerce Platform' },
                { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Built a full-stack...' },
                { key: 'url', label: 'URL', type: 'text', placeholder: 'github.com/...' },
                { key: 'technologies', label: 'Technologies', type: 'text', placeholder: 'React, Node.js, PostgreSQL' },
            ],
        },
        professionalDevelopment: {
            title: 'Professional Development', icon: 'chalkboard-user', type: 'array',
            fields: [
                { key: 'title', label: 'Title', type: 'text', placeholder: 'Leadership Training' },
                { key: 'provider', label: 'Provider', type: 'text', placeholder: 'Coursera' },
                { key: 'date', label: 'Date', type: 'text', placeholder: '2023' },
                { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Completed a 6-week...' },
            ],
        },
        references: {
            title: 'References', icon: 'users', type: 'array',
            fields: [
                { key: 'name', label: 'Name', type: 'text', placeholder: 'Jane Smith' },
                { key: 'title', label: 'Title', type: 'text', placeholder: 'Engineering Director' },
                { key: 'company', label: 'Company', type: 'text', placeholder: 'Tech Corp' },
                { key: 'contact', label: 'Contact', type: 'text', placeholder: 'jane@example.com' },
            ],
        },
    },

    esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },

    // ===== LIST VIEW =====
    renderList() {
        const cvs = Storage.getAllCVs();
        let html = `
            <div class="flex-between mb-16">
                <div>
                    <h2 style="font-size:1.25rem;font-weight:700">My CVs</h2>
                    <p class="text-light" style="font-size:0.8125rem">Create and manage your CV versions</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="CVMgr.createCV()"><i class="fas fa-plus"></i> New CV</button>
            </div>`;
        if (cvs.length === 0) {
            html += `<div class="empty-state">
                <i class="fas fa-file-lines"></i>
                <h3>No CVs yet</h3>
                <p>Create your first CV to get started</p>
                <button class="btn btn-primary" onclick="CVMgr.createCV()"><i class="fas fa-plus"></i> Create CV</button>
            </div>`;
        } else {
            cvs.forEach(cv => {
                const atsScore = this.calcATSScore(cv);
                html += `<div class="card card-tappable" onclick="App.navigate('cv/edit/${cv.id}')">
                    <div class="flex-between">
                        <div style="flex:1">
                            <h3 style="font-size:1rem;font-weight:600">${this.esc(cv.name)}</h3>
                            <p class="text-light" style="font-size:0.75rem;margin-top:2px">${this.getTemplateName(cv.template)} • Updated ${new Date(cv.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div class="text-center" style="margin-left:12px">
                            <div class="stat-value ${atsScore >= 70 ? 'success' : atsScore >= 50 ? 'gold' : ''}" style="font-size:1.25rem">${atsScore}%</div>
                            <div class="stat-label">ATS</div>
                        </div>
                    </div>
                    <div class="btn-group mt-8" onclick="event.stopPropagation()">
                        <button class="btn btn-ghost btn-sm" onclick="App.navigate('cv/preview/${cv.id}')"><i class="fas fa-eye"></i> Preview</button>
                        <button class="btn btn-ghost btn-sm" onclick="App.navigate('cv/ats/${cv.id}')"><i class="fas fa-check-circle"></i> ATS</button>
                        <button class="btn btn-ghost btn-sm" onclick="CVMgr.duplicateCV('${cv.id}')"><i class="fas fa-copy"></i> Duplicate</button>
                        <button class="btn btn-danger btn-sm" onclick="CVMgr.deleteCV('${cv.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            });
        }
        document.getElementById('view-container').innerHTML = html;
        App.setTitle('My CV');
        App.setBackButton(false);
    },

    getTemplateName(t) {
        const names = { executive: 'Executive', modern: 'Modern Professional', ats: 'ATS Minimal', ngo: 'NGO / Development', finance: 'Finance & Management' };
        return names[t] || 'Executive';
    },

    calcATSScore(cv) {
        return Scoring.atsFormattingScore(cv).score;
    },

    // ===== EDITOR VIEW =====
    renderEditor(id) {
        const cv = Storage.getCV(id);
        if (!cv) { App.navigate('cv'); return; }
        this.currentCV = cv;
        this.openSections = new Set(['personalInfo', 'summary']);

        let html = `<div>
            <div class="card">
                <div class="form-group">
                    <label class="form-label">CV Name</label>
                    <input class="form-input" value="${this.esc(cv.name)}" oninput="CVMgr.updateName(this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Template</label>
                    <select class="form-select" onchange="CVMgr.changeTemplate(this.value)">
                        ${Object.entries({ executive: 'Executive', modern: 'Modern Professional', ats: 'ATS Minimal', ngo: 'NGO / Development', finance: 'Finance & Management' }).map(([v, l]) => `<option value="${v}" ${cv.template === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="btn-group">
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('cv/preview/${cv.id}')"><i class="fas fa-eye"></i> Preview</button>
                    <button class="btn btn-secondary btn-sm" onclick="App.navigate('cv/ats/${cv.id}')"><i class="fas fa-check-circle"></i> ATS</button>
                </div>
            </div>`;

        for (const [key, def] of Object.entries(this.SECTIONS)) {
            html += this.renderAccordion(key, def, cv.data);
        }

        html += `<button class="btn btn-danger btn-block mt-16" onclick="CVMgr.deleteCV('${cv.id}')"><i class="fas fa-trash"></i> Delete CV</button></div>`;
        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Edit CV');
        App.setBackButton(true);
    },

    renderAccordion(key, def, data) {
        const isOpen = this.openSections.has(key);
        let html = `<div class="accordion ${isOpen ? 'open' : ''}" data-section="${key}">
            <div class="accordion-header" onclick="CVMgr.toggleSection('${key}')">
                <span><i class="fas fa-${def.icon}" style="margin-right:8px;color:var(--accent)"></i> ${def.title}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content">`;

        if (def.type === 'object') {
            html += this.renderObjectFields(key, def.fields, data[key] || {});
        } else if (def.type === 'text') {
            html += `<textarea class="form-textarea" placeholder="${def.placeholder || ''}" style="min-height:100px" oninput="CVMgr.fieldChanged('${def.field || key}', this.value)">${this.esc(data[key] || '')}</textarea>`;
        } else if (def.type === 'array') {
            html += this.renderArraySection(key, def, data[key] || []);
        }

        html += '</div></div>';
        return html;
    },

    renderObjectFields(key, fields, data) {
        let html = '';
        fields.forEach(f => {
            const val = data[f.key] || '';
            html += `<div class="form-group">
                <label class="form-label">${f.label}</label>
                <input type="${f.type}" class="form-input" value="${this.esc(val)}" placeholder="${f.placeholder || ''}"
                    oninput="CVMgr.objectFieldChanged('${key}', '${f.key}', this.value)">
            </div>`;
        });
        return html;
    },

    renderArraySection(key, def, items) {
        let html = '';
        if (!items || items.length === 0) {
            html += '<p class="text-light" style="font-size:0.8125rem;text-align:center;padding:8px">No entries yet</p>';
        } else {
            items.forEach((item, idx) => {
                html += `<div class="card" style="margin-bottom:8px;padding:12px;border:1px solid var(--border)">
                    <div class="flex-between mb-8">
                        <span class="pill badge-gray">#${idx + 1}</span>
                        <div class="flex gap-8">
                            <button class="btn btn-ghost btn-sm" style="padding:6px 8px" onclick="CVMgr.moveItem('${key}', '${item.id}', -1)" ${idx === 0 ? 'disabled' : ''}><i class="fas fa-arrow-up"></i></button>
                            <button class="btn btn-ghost btn-sm" style="padding:6px 8px" onclick="CVMgr.moveItem('${key}', '${item.id}', 1)" ${idx === items.length - 1 ? 'disabled' : ''}><i class="fas fa-arrow-down"></i></button>
                            <button class="btn btn-danger btn-sm" style="padding:6px 8px" onclick="CVMgr.deleteArrayItem('${key}', '${item.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>`;
                html += this.renderArrayItemFields(key, def.fields, item);
                html += '</div>';
            });
        }
        const singular = def.title.replace(/s$/, '').replace(/ie$/, 'y');
        html += `<button class="btn btn-secondary btn-block btn-sm" onclick="CVMgr.addArrayItem('${key}')"><i class="fas fa-plus"></i> Add ${singular}</button>`;
        return html;
    },

    renderArrayItemFields(sectionKey, fields, item) {
        let html = '';
        fields.forEach(f => {
            const val = item[f.key] || '';
            if (f.type === 'textarea') {
                html += `<div class="form-group">
                    <label class="form-label">${f.label}</label>
                    <textarea class="form-textarea" placeholder="${f.placeholder || ''}"
                        oninput="CVMgr.arrayFieldChanged('${sectionKey}', '${item.id}', '${f.key}', this.value)">${this.esc(val)}</textarea>
                </div>`;
            } else if (f.type === 'select') {
                html += `<div class="form-group">
                    <label class="form-label">${f.label}</label>
                    <select class="form-select" onchange="CVMgr.arrayFieldChanged('${sectionKey}', '${item.id}', '${f.key}', this.value)">
                        ${f.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>
                </div>`;
            } else {
                html += `<div class="form-group">
                    <label class="form-label">${f.label}</label>
                    <input type="${f.type}" class="form-input" value="${this.esc(val)}" placeholder="${f.placeholder || ''}"
                        oninput="CVMgr.arrayFieldChanged('${sectionKey}', '${item.id}', '${f.key}', this.value)">
                </div>`;
            }
        });
        return html;
    },

    // ===== FIELD HANDLERS =====
    toggleSection(key) {
        if (this.openSections.has(key)) this.openSections.delete(key);
        else this.openSections.add(key);
        const acc = document.querySelector(`[data-section="${key}"]`);
        if (acc) acc.classList.toggle('open');
    },

    updateName(val) {
        if (!this.currentCV) return;
        this.currentCV.name = val;
        this.saveCurrent();
    },

    changeTemplate(template) {
        if (!this.currentCV) return;
        this.currentCV.template = template;
        this.saveCurrent();
        App.toast('Template updated', 'success');
    },

    objectFieldChanged(section, field, value) {
        if (!this.currentCV) return;
        this.currentCV.data[section] = this.currentCV.data[section] || {};
        this.currentCV.data[section][field] = value;
        this.saveCurrent();
    },

    fieldChanged(field, value) {
        if (!this.currentCV) return;
        this.currentCV.data[field] = value;
        this.saveCurrent();
    },

    arrayFieldChanged(section, id, field, value) {
        if (!this.currentCV) return;
        const items = this.currentCV.data[section] || [];
        const item = items.find(i => i.id === id);
        if (item) { item[field] = value; this.saveCurrent(); }
    },

    addArrayItem(section) {
        if (!this.currentCV) return;
        const def = this.SECTIONS[section];
        const newItem = { id: Storage.uuid() };
        def.fields.forEach(f => { newItem[f.key] = f.type === 'select' ? (f.options && f.options[0]) : ''; });
        this.currentCV.data[section] = this.currentCV.data[section] || [];
        this.currentCV.data[section].push(newItem);
        this.saveCurrent();
        this.openSections.add(section);
        this.renderEditor(this.currentCV.id);
    },

    deleteArrayItem(section, id) {
        if (!this.currentCV) return;
        this.currentCV.data[section] = (this.currentCV.data[section] || []).filter(i => i.id !== id);
        this.saveCurrent();
        this.renderEditor(this.currentCV.id);
    },

    moveItem(section, id, dir) {
        if (!this.currentCV) return;
        const items = this.currentCV.data[section] || [];
        const idx = items.findIndex(i => i.id === id);
        if (idx < 0) return;
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= items.length) return;
        [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
        this.saveCurrent();
        this.renderEditor(this.currentCV.id);
    },

    saveCurrent() {
        if (!this.currentCV) return;
        Storage.saveCV(this.currentCV);
    },

    // ===== CRUD =====
    createCV() {
        const cv = Storage.createCV('New CV', 'executive');
        App.navigate(`cv/edit/${cv.id}`);
    },

    duplicateCV(id) {
        const copy = Storage.duplicateCV(id);
        if (copy) { App.toast('CV duplicated', 'success'); this.renderList(); }
    },

    deleteCV(id) {
        App.confirm('Delete this CV?', 'This action cannot be undone.', () => {
            Storage.deleteCV(id);
            App.toast('CV deleted', 'success');
            App.navigate('cv');
        });
    },

    // ===== PREVIEW VIEW =====
    renderPreview(id) {
        const cv = Storage.getCV(id);
        if (!cv) { App.navigate('cv'); return; }
        this.currentCV = cv;

        let html = `
            <div class="flex-between mb-16">
                <h2 style="font-size:1.125rem;font-weight:700">${this.esc(cv.name)}</h2>
                <span class="badge badge-gold">${this.getTemplateName(cv.template)}</span>
            </div>
            <div class="card">
                <div class="form-group">
                    <label class="form-label">Template</label>
                    <select class="form-select" onchange="CVMgr.previewTemplate('${cv.id}', this.value)">
                        ${Object.entries({ executive: 'Executive', modern: 'Modern Professional', ats: 'ATS Minimal', ngo: 'NGO / Development', finance: 'Finance & Management' }).map(([v, l]) => `<option value="${v}" ${cv.template === v ? 'selected' : ''}>${l}</option>`).join('')}
                    </select>
                </div>
                <div class="btn-group">
                    <button class="btn btn-primary btn-sm" onclick="Exporter.exportPDF('${cv.id}')"><i class="fas fa-file-pdf"></i> PDF</button>
                    <button class="btn btn-secondary btn-sm" onclick="Exporter.exportDOCX('${cv.id}')"><i class="fas fa-file-word"></i> DOCX</button>
                    <button class="btn btn-secondary btn-sm" onclick="Exporter.printCV('${cv.id}')"><i class="fas fa-print"></i> Print</button>
                    <button class="btn btn-secondary btn-sm" onclick="Exporter.shareCV('${cv.id}')"><i class="fas fa-share"></i> Share</button>
                </div>
            </div>
            <div class="cv-preview-container" id="cv-preview-area">
                ${this.renderCVHTML(cv)}
            </div>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('CV Preview');
        App.setBackButton(true);
    },

    previewTemplate(id, template) {
        const cv = Storage.getCV(id);
        if (!cv) return;
        cv.template = template;
        Storage.saveCV(cv);
        this.currentCV = cv;
        document.getElementById('cv-preview-area').innerHTML = this.renderCVHTML(cv);
    },

    renderCVHTML(cv) {
        const d = cv.data || {};
        const tmpl = cv.template || 'executive';
        let html = `<div class="cv-page cv-template-${tmpl}">`;

        // Header
        const p = d.personalInfo || {};
        html += `<div style="margin-bottom:16px">
            <div class="cv-name">${this.esc(p.fullName) || 'Your Name'}</div>`;
        if (p.headline) html += `<div class="cv-headline">${this.esc(p.headline)}</div>`;
        const contacts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
        if (contacts.length) html += `<div class="cv-contact">${contacts.map(c => this.esc(c)).join(' • ')}</div>`;
        html += '</div>';

        // Sections
        if (d.summary) html += `<h4>Professional Summary</h4><p class="cv-summary">${this.esc(d.summary)}</p>`;

        if (d.workExperience && d.workExperience.length) {
            html += '<h4>Work Experience</h4>';
            d.workExperience.forEach(e => {
                html += `<div class="cv-entry">
                    <div class="cv-entry-title">${this.esc(e.title)}</div>
                    <div class="cv-entry-meta">${this.esc(e.company)}${e.location ? ' • ' + this.esc(e.location) : ''} | ${this.esc(e.startDate) || ''} - ${this.esc(e.endDate) || 'Present'}</div>`;
                if (e.description) {
                    e.description.split('\n').filter(l => l.trim()).forEach(line => {
                        html += `<div class="cv-bullet">${this.esc(line.replace(/^[\-\*\•]\s*/, ''))}</div>`;
                    });
                }
                html += '</div>';
            });
        }

        if (d.education && d.education.length) {
            html += '<h4>Education</h4>';
            d.education.forEach(e => {
                html += `<div class="cv-entry">
                    <div class="cv-entry-title">${this.esc(e.degree)}</div>
                    <div class="cv-entry-meta">${this.esc(e.institution)}${e.field ? ' • ' + this.esc(e.field) : ''} | ${this.esc(e.startDate) || ''} - ${this.esc(e.endDate) || ''}</div>`;
                if (e.description) html += `<div class="cv-bullet">${this.esc(e.description)}</div>`;
                html += '</div>';
            });
        }

        if (d.skills && d.skills.length) {
            html += '<h4>Skills</h4><div style="margin-bottom:8px">';
            d.skills.forEach(s => { html += `<span class="tag">${this.esc(s.name)}${s.level ? ' — ' + this.esc(s.level) : ''}</span>`; });
            html += '</div>';
        }

        if (d.certifications && d.certifications.length) {
            html += '<h4>Certifications</h4>';
            d.certifications.forEach(c => {
                html += `<div class="cv-entry"><div class="cv-entry-title">${this.esc(c.name)}</div>`;
                if (c.issuer || c.date) html += `<div class="cv-entry-meta">${this.esc(c.issuer)}${c.date ? ' • ' + this.esc(c.date) : ''}</div>`;
                html += '</div>';
            });
        }

        if (d.languages && d.languages.length) {
            html += '<h4>Languages</h4><div style="margin-bottom:8px">';
            d.languages.forEach(l => { html += `<span class="tag">${this.esc(l.name)}${l.proficiency ? ' — ' + this.esc(l.proficiency) : ''}</span>`; });
            html += '</div>';
        }

        if (d.achievements && d.achievements.length) {
            html += '<h4>Achievements</h4>';
            d.achievements.forEach(a => {
                html += `<div class="cv-entry"><div class="cv-entry-title">${this.esc(a.title)}</div>`;
                if (a.description) html += `<div class="cv-bullet">${this.esc(a.description)}</div>`;
                if (a.date) html += `<div class="cv-entry-meta">${this.esc(a.date)}</div>`;
                html += '</div>';
            });
        }

        if (d.projects && d.projects.length) {
            html += '<h4>Projects</h4>';
            d.projects.forEach(p => {
                html += `<div class="cv-entry"><div class="cv-entry-title">${this.esc(p.name)}</div>`;
                if (p.description) html += `<div class="cv-bullet">${this.esc(p.description)}</div>`;
                if (p.technologies) html += `<div class="cv-entry-meta">Tech: ${this.esc(p.technologies)}</div>`;
                if (p.url) html += `<div class="cv-entry-meta">${this.esc(p.url)}</div>`;
                html += '</div>';
            });
        }

        if (d.professionalDevelopment && d.professionalDevelopment.length) {
            html += '<h4>Professional Development</h4>';
            d.professionalDevelopment.forEach(p => {
                html += `<div class="cv-entry"><div class="cv-entry-title">${this.esc(p.title)}</div>`;
                if (p.provider || p.date) html += `<div class="cv-entry-meta">${this.esc(p.provider)}${p.date ? ' • ' + this.esc(p.date) : ''}</div>`;
                if (p.description) html += `<div class="cv-bullet">${this.esc(p.description)}</div>`;
                html += '</div>';
            });
        }

        if (d.references && d.references.length) {
            html += '<h4>References</h4>';
            d.references.forEach(r => {
                html += `<div class="cv-entry"><div class="cv-entry-title">${this.esc(r.name)}</div>`;
                if (r.title || r.company) html += `<div class="cv-entry-meta">${this.esc(r.title)}${r.company ? ' • ' + this.esc(r.company) : ''}</div>`;
                if (r.contact) html += `<div class="cv-entry-meta">${this.esc(r.contact)}</div>`;
                html += '</div>';
            });
        }

        // Footer
        if (p.fullName) html += `<div style="text-align:center;font-size:0.6875rem;color:#94a3b8;margin-top:24px;padding-top:8px;border-top:1px solid #e2e8f0">${this.esc(p.fullName)} • Confidential CV</div>`;
        html += '</div>';
        return html;
    },

    // ===== ATS CHECK VIEW =====
    renderATS(id) {
        const cv = Storage.getCV(id);
        if (!cv) { App.navigate('cv'); return; }
        const result = Scoring.atsFormattingScore(cv);

        let html = `
            <div class="flex-between mb-16">
                <h2 style="font-size:1.125rem;font-weight:700">ATS Compatibility Check</h2>
                <button class="btn btn-ghost btn-sm" onclick="App.navigate('cv/edit/${cv.id}')"><i class="fas fa-pen"></i> Edit CV</button>
            </div>
            <div class="card text-center">
                <div class="score-circle" style="background: conic-gradient(${result.score >= 70 ? 'var(--success)' : result.score >= 50 ? 'var(--warning)' : 'var(--danger)'} ${result.score * 3.6}deg, var(--border) 0deg);border-radius:50%;width:120px;height:120px;margin:0 auto;display:flex;align-items:center;justify-content:center">
                    <div style="background:var(--card-bg);width:96px;height:96px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center">
                        <div class="score-num" style="font-size:1.75rem;font-weight:700;color:${result.score >= 70 ? 'var(--success)' : result.score >= 50 ? 'var(--warning)' : 'var(--danger)'}">${result.score}%</div>
                        <div class="score-label">ATS Score</div>
                    </div>
                </div>
                <p class="text-light mt-8" style="font-size:0.8125rem">${result.score >= 70 ? 'Good ATS compatibility' : result.score >= 50 ? 'Moderate — some improvements needed' : 'Needs improvement'}</p>
            </div>
            <h3 class="section-title">Detailed Checks</h3>`;

        result.checks.forEach(c => {
            const color = c.status === 'pass' ? 'success' : c.status === 'warning' ? 'warning' : 'danger';
            const icon = c.status === 'pass' ? 'check-circle' : c.status === 'warning' ? 'exclamation-triangle' : 'times-circle';
            html += `<div class="card" style="padding:12px 16px">
                <div class="flex gap-12">
                    <i class="fas fa-${icon} text-${color}" style="font-size:1.125rem;margin-top:2px"></i>
                    <div style="flex:1">
                        <div style="font-weight:600;font-size:0.9375rem">${c.name}</div>
                        <div class="text-light" style="font-size:0.8125rem;margin-top:2px">${c.detail}</div>
                    </div>
                    <span class="badge badge-${color}">${c.status}</span>
                </div>
            </div>`;
        });

        html += `<div class="card" style="background:rgba(212,167,44,0.08);border:1px solid rgba(212,167,44,0.2)">
            <p style="font-size:0.8125rem;color:var(--text)"><i class="fas fa-info-circle text-gold"></i> The ATS score reflects how well your CV is structured for automated parsing systems. Use the ATS Minimal template for maximum compatibility. This score does not guarantee your CV will pass all ATS systems.</p>
        </div>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('ATS Check');
        App.setBackButton(true);
    },
};
