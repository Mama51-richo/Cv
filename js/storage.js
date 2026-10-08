// ===== STORAGE LAYER - Local persistence via localStorage =====

const Storage = {
    PREFIX: 'lcf_',
    KEYS: {
        PROFILE: 'lcf_profile',
        CVS: 'lcf_cvs',
        JOBS: 'lcf_jobs',
        APPLICATIONS: 'lcf_applications',
        INTERVIEWS: 'lcf_interviews',
        SETTINGS: 'lcf_settings',
        TAILORED: 'lcf_tailored',
    },

    init() {
        // Initialize default profile if none exists
        if (!this.get(this.KEYS.PROFILE)) {
            this.set(this.KEYS.PROFILE, this.defaultProfile());
        }
        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, this.defaultSettings());
        }
        if (!this.get(this.KEYS.CVS)) this.set(this.KEYS.CVS, []);
        if (!this.get(this.KEYS.JOBS)) this.set(this.KEYS.JOBS, []);
        if (!this.get(this.KEYS.APPLICATIONS)) this.set(this.KEYS.APPLICATIONS, []);
        if (!this.get(this.KEYS.INTERVIEWS)) this.set(this.KEYS.INTERVIEWS, []);
        if (!this.get(this.KEYS.TAILORED)) this.set(this.KEYS.TAILORED, []);
    },

    // ===== CORE =====
    get(key, defaultValue = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : defaultValue;
        } catch (e) {
            console.error('Storage.get error:', key, e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage.set error:', key, e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    uuid() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    },

    // ===== DEFAULTS =====
    defaultProfile() {
        return {
            fullName: '',
            professionalTitle: '',
            phone: '',
            email: '',
            location: '',
            linkedin: '',
            portfolio: '',
            yearsOfExperience: '',
            education: [],
            skills: [],
            certifications: [],
            languages: [],
            careerInterests: '',
            summary: '',
            createdAt: new Date().toISOString(),
        };
    },

    defaultSettings() {
        return {
            darkMode: false,
            language: 'en',
            fontSize: 'medium',
            notifications: true,
        };
    },

    defaultCVData() {
        return {
            personalInfo: { fullName: '', headline: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
            summary: '',
            workExperience: [],
            education: [],
            skills: [],
            certifications: [],
            languages: [],
            achievements: [],
            projects: [],
            professionalDevelopment: [],
            references: [],
        };
    },

    // ===== PROFILE =====
    getProfile() { return this.get(this.KEYS.PROFILE, this.defaultProfile()); },
    saveProfile(data) {
        const profile = { ...this.getProfile(), ...data, updatedAt: new Date().toISOString() };
        this.set(this.KEYS.PROFILE, profile);
        return profile;
    },

    // ===== CVS =====
    getAllCVs() { return this.get(this.KEYS.CVS, []); },
    getCV(id) { return this.getAllCVs().find(c => c.id === id); },

    saveCV(cv) {
        const cvs = this.getAllCVs();
        const idx = cvs.findIndex(c => c.id === cv.id);
        cv.updatedAt = new Date().toISOString();
        if (idx >= 0) cvs[idx] = cv;
        else { cv.createdAt = new Date().toISOString(); cvs.push(cv); }
        this.set(this.KEYS.CVS, cvs);
        return cv;
    },

    deleteCV(id) {
        this.set(this.KEYS.CVS, this.getAllCVs().filter(c => c.id !== id));
    },

    duplicateCV(id) {
        const cv = this.getCV(id);
        if (!cv) return null;
        const copy = JSON.parse(JSON.stringify(cv));
        copy.id = this.uuid();
        copy.name = cv.name + ' (Copy)';
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = new Date().toISOString();
        return this.saveCV(copy);
    },

    createCV(name, template) {
        const profile = this.getProfile();
        const data = this.defaultCVData();
        // Pre-fill from profile
        data.personalInfo = {
            fullName: profile.fullName || '',
            headline: profile.professionalTitle || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            linkedin: profile.linkedin || '',
            portfolio: profile.portfolio || '',
        };
        data.summary = profile.summary || '';
        data.skills = profile.skills ? profile.skills.map(s => ({ name: s, level: 'Intermediate' })) : [];
        data.education = profile.education || [];
        data.certifications = profile.certifications || [];
        data.languages = profile.languages || [];

        const cv = {
            id: this.uuid(),
            name: name || 'New CV',
            template: template || 'executive',
            data,
            sectionOrder: ['personalInfo', 'headline', 'summary', 'workExperience', 'education', 'skills', 'certifications', 'languages', 'achievements', 'projects', 'professionalDevelopment', 'references'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return this.saveCV(cv);
    },

    // ===== JOBS =====
    getAllJobs() { return this.get(this.KEYS.JOBS, []); },
    getJob(id) { return this.getAllJobs().find(j => j.id === id); },

    saveJob(job) {
        const jobs = this.getAllJobs();
        const idx = jobs.findIndex(j => j.id === job.id);
        job.updatedAt = new Date().toISOString();
        if (idx >= 0) jobs[idx] = job;
        else { job.createdAt = new Date().toISOString(); jobs.push(job); }
        this.set(this.KEYS.JOBS, jobs);
        return job;
    },

    deleteJob(id) {
        this.set(this.KEYS.JOBS, this.getAllJobs().filter(j => j.id !== id));
    },

    // ===== APPLICATIONS =====
    getAllApplications() { return this.get(this.KEYS.APPLICATIONS, []); },
    getApplication(id) { return this.getAllApplications().find(a => a.id === id); },

    saveApplication(app) {
        const apps = this.getAllApplications();
        const idx = apps.findIndex(a => a.id === app.id);
        app.updatedAt = new Date().toISOString();
        if (idx >= 0) apps[idx] = app;
        else { app.createdAt = new Date().toISOString(); apps.push(app); }
        this.set(this.KEYS.APPLICATIONS, apps);
        return app;
    },

    deleteApplication(id) {
        this.set(this.KEYS.APPLICATIONS, this.getAllApplications().filter(a => a.id !== id));
    },

    // ===== INTERVIEWS =====
    getAllInterviews() { return this.get(this.KEYS.INTERVIEWS, []); },
    getInterview(id) { return this.getAllInterviews().find(i => i.id === id); },
    getInterviewByJob(jobId) { return this.getAllInterviews().find(i => i.jobId === jobId); },

    saveInterview(interview) {
        const all = this.getAllInterviews();
        const idx = all.findIndex(i => i.id === interview.id);
        if (idx >= 0) all[idx] = interview;
        else all.push(interview);
        this.set(this.KEYS.INTERVIEWS, all);
        return interview;
    },

    // ===== TAILORED CVS =====
    getAllTailored() { return this.get(this.KEYS.TAILORED, []); },
    saveTailored(tailored) {
        const all = this.getAllTailored();
        const idx = all.findIndex(t => t.id === tailored.id);
        if (idx >= 0) all[idx] = tailored;
        else all.push(tailored);
        this.set(this.KEYS.TAILORED, all);
        return tailored;
    },

    // ===== SETTINGS =====
    getSettings() { return this.get(this.KEYS.SETTINGS, this.defaultSettings()); },
    saveSettings(settings) {
        this.set(this.KEYS.SETTINGS, { ...this.getSettings(), ...settings });
        return this.getSettings();
    },

    // ===== BACKUP =====
    exportBackup() {
        return {
            app: 'Libra CareerForge',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: {
                profile: this.getProfile(),
                cvs: this.getAllCVs(),
                jobs: this.getAllJobs(),
                applications: this.getAllApplications(),
                interviews: this.getAllInterviews(),
                tailored: this.getAllTailored(),
                settings: this.getSettings(),
            }
        };
    },

    importBackup(json) {
        try {
            const backup = typeof json === 'string' ? JSON.parse(json) : json;
            if (!backup.data) throw new Error('Invalid backup format');
            const d = backup.data;
            if (d.profile) this.set(this.KEYS.PROFILE, d.profile);
            if (d.cvs) this.set(this.KEYS.CVS, d.cvs);
            if (d.jobs) this.set(this.KEYS.JOBS, d.jobs);
            if (d.applications) this.set(this.KEYS.APPLICATIONS, d.applications);
            if (d.interviews) this.set(this.KEYS.INTERVIEWS, d.interviews);
            if (d.tailored) this.set(this.KEYS.TAILORED, d.tailored);
            if (d.settings) this.set(this.KEYS.SETTINGS, d.settings);
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    resetData() {
        Object.values(this.KEYS).forEach(k => this.remove(k));
        this.init();
    },

    // ===== STATS =====
    getStats() {
        const apps = this.getAllApplications();
        const cvs = this.getAllCVs();
        const jobs = this.getAllJobs();
        const profile = this.getProfile();
        
        const profileCompletion = this.calcProfileCompletion(profile);
        const activeApps = apps.filter(a => !['rejected', 'withdrawn', 'offer'].includes(a.status)).length;
        const interviews = apps.filter(a => a.status === 'interview' || a.status === 'final').length;
        const savedJobs = jobs.length;
        
        // Upcoming deadlines
        const now = new Date();
        const upcomingDeadlines = apps.filter(a => {
            if (!a.deadline) return false;
            const d = new Date(a.deadline);
            return d >= now && !['rejected', 'withdrawn'].includes(a.status);
        }).length;

        // Best ATS score from CVs
        const bestATS = cvs.length > 0 ? Math.max(...cvs.map(c => c.atsScore || 0)) : 0;

        return {
            profileCompletion,
            activeApplications: activeApps,
            interviews,
            savedJobs,
            upcomingDeadlines,
            bestATS,
            totalCVs: cvs.length,
        };
    },

    calcProfileCompletion(profile) {
        const fields = ['fullName', 'professionalTitle', 'email', 'phone', 'location', 'yearsOfExperience', 'summary'];
        let filled = 0;
        fields.forEach(f => { if (profile[f] && profile[f].toString().trim()) filled++; });
        if (profile.skills && profile.skills.length > 0) filled++;
        if (profile.education && profile.education.length > 0) filled++;
        if (profile.certifications && profile.certifications.length > 0) filled++;
        if (profile.languages && profile.languages.length > 0) filled++;
        if (profile.linkedin) filled++;
        const total = fields.length + 4;
        return Math.round((filled / total) * 100);
    },
};

// Initialize on load
Storage.init();
