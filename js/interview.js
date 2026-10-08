// ===== INTERVIEW PREPARATION =====

const Interview = {
    currentInterview: null,
    activeTab: 'questions',

    esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },

    CHECKLIST_ITEMS: [
        { id: 'research', label: 'Research the company and role' },
        { id: 'jd', label: 'Review the job description thoroughly' },
        { id: 'star', label: 'Prepare 3-5 STAR stories' },
        { id: 'practice', label: 'Practice answering common questions' },
        { id: 'questions', label: 'Prepare 3-5 questions to ask' },
        { id: 'cv', label: 'Review your CV and be ready to discuss it' },
        { id: 'outfit', label: 'Plan your outfit (professional)' },
        { id: 'tech', label: 'Test technology (for virtual interviews)' },
        { id: 'copies', label: 'Prepare copies of your CV' },
        { id: 'arrival', label: 'Plan to arrive 10-15 minutes early' },
        { id: 'followup', label: 'Prepare a follow-up thank-you note' },
    ],

    render(jobId) {
        const job = jobId ? Storage.getJob(jobId) : null;
        let interview = jobId ? Storage.getInterviewByJob(jobId) : null;
        if (!interview) {
            interview = {
                id: Storage.uuid(),
                jobId: jobId || null,
                questions: this.generateQuestions(job),
                answers: {},
                checklist: {},
                createdAt: new Date().toISOString(),
            };
            Storage.saveInterview(interview);
        }
        this.currentInterview = interview;

        let html = `<div class="flex-between mb-16">
            <div><h2 style="font-size:1.125rem;font-weight:700">Interview Prep</h2>
            <p class="text-light" style="font-size:0.8125rem">${job ? this.esc(job.jobTitle) + ' at ' + this.esc(job.company) : 'General preparation'}</p></div>
            ${job ? `<button class="btn btn-secondary btn-sm" onclick="App.navigate('job/results/${jobId}')"><i class="fas fa-arrow-left"></i> Back</button>` : ''}
        </div>`;

        // Tabs
        html += `<div class="tabs">
            <div class="tab ${this.activeTab === 'questions' ? 'active' : ''}" onclick="Interview.setTab('questions')">Questions</div>
            <div class="tab ${this.activeTab === 'star' ? 'active' : ''}" onclick="Interview.setTab('star')">STAR Framework</div>
            <div class="tab ${this.activeTab === 'checklist' ? 'active' : ''}" onclick="Interview.setTab('checklist')">Checklist</div>
        </div>`;

        if (this.activeTab === 'questions') html += this.renderQuestions(interview);
        else if (this.activeTab === 'star') html += this.renderSTAR();
        else html += this.renderChecklist(interview);

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Interview Prep'); App.setBackButton(true);
    },

    setTab(tab) { this.activeTab = tab; if (this.currentInterview) this.render(this.currentInterview.jobId); },

    generateQuestions(job) {
        const ji = job?.extracted || job?.description ? Scoring.extractJobInfo(job.description) : {};
        const questions = {
            behavioral: [
                { id: 'b1', q: 'Tell me about yourself and why you are interested in this role.' },
                { id: 'b2', q: 'Describe a challenging project you worked on. What was your role and how did you overcome the challenges?' },
                { id: 'b3', q: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?' },
                { id: 'b4', q: 'Describe a situation where you had to meet a tight deadline. How did you manage your time?' },
                { id: 'b5', q: 'Tell me about a time when you had to learn a new skill quickly. How did you approach it?' },
                { id: 'b6', q: 'Describe a situation where you took initiative to improve a process or solve a problem.' },
                { id: 'b7', q: 'Tell me about a time when you received critical feedback. How did you respond?' },
                { id: 'b8', q: 'Describe a situation where you had to make a difficult decision with limited information.' },
            ],
            technical: [],
            roleSpecific: [],
            ask: [
                { id: 'a1', q: 'What does a typical day look like in this role?' },
                { id: 'a2', q: 'What are the biggest challenges the team is currently facing?' },
                { id: 'a3', q: 'How do you measure success in this position?' },
                { id: 'a4', q: 'What opportunities are there for professional development?' },
                { id: 'a5', q: 'Can you tell me about the team I would be working with?' },
                { id: 'a6', q: 'What are the next steps in the interview process?' },
            ],
        };

        (ji.technicalSkills || []).slice(0, 6).forEach((s, i) => {
            questions.technical.push({ id: `t${i}`, q: `Describe your experience with ${s}. What projects have you worked on using it?` });
            questions.technical.push({ id: `t${i}b`, q: `How do you stay current with ${s} best practices and new developments?` });
        });
        if (questions.technical.length === 0) {
            questions.technical.push({ id: 't0', q: 'Describe a technical skill you are most proud of and how you have applied it.' });
        }

        if (ji.jobTitle || job?.jobTitle) {
            questions.roleSpecific.push({ id: 'r1', q: `Why are you interested in the ${ji.jobTitle || job.jobTitle} position specifically?` });
            questions.roleSpecific.push({ id: 'r2', q: `What do you think are the most important qualities for a successful ${ji.jobTitle || job.jobTitle}?` });
            questions.roleSpecific.push({ id: 'r3', q: 'How does your previous experience prepare you for this role?' });
        } else {
            questions.roleSpecific.push({ id: 'r1', q: 'Why are you interested in this position?' });
            questions.roleSpecific.push({ id: 'r2', q: 'How does your previous experience prepare you for this role?' });
        }

        return questions;
    },

    renderQuestions(interview) {
        const cats = [
            { key: 'behavioral', label: 'Behavioral Questions', icon: 'user-group', badge: 'badge-gold' },
            { key: 'technical', label: 'Technical Questions', icon: 'code', badge: 'badge-info' },
            { key: 'roleSpecific', label: 'Role-Specific Questions', icon: 'briefcase', badge: 'badge-navy' },
            { key: 'ask', label: 'Questions to Ask the Employer', icon: 'question-circle', badge: 'badge-success' },
        ];
        let html = '';
        cats.forEach(cat => {
            const qs = interview.questions[cat.key] || [];
            if (qs.length === 0) return;
            html += `<h3 class="section-title"><i class="fas fa-${cat.icon}"></i> ${cat.label}</h3>`;
            qs.forEach(q => {
                const answer = interview.answers[q.id] || '';
                html += `<div class="question-card">
                    <div class="q"><span class="q-badge badge ${cat.badge}">${cat.label.charAt(0)}</span> ${this.esc(q.q)}</div>
                    <textarea class="form-textarea" placeholder="Type your answer here..." style="margin-top:8px;min-height:80px"
                        oninput="Interview.saveAnswer('${q.id}', this.value)">${this.esc(answer)}</textarea>
                </div>`;
            });
        });
        return html;
    },

    saveAnswer(qId, answer) {
        if (!this.currentInterview) return;
        this.currentInterview.answers[qId] = answer;
        Storage.saveInterview(this.currentInterview);
    },

    renderSTAR() {
        return `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:12px"><i class="fas fa-star text-gold"></i> STAR Framework</h3>
            <p class="text-light mb-16" style="font-size:0.8125rem">Use STAR to structure your answers to behavioral interview questions.</p>
            
            <div class="card" style="background:rgba(24,166,115,0.08);border:1px solid rgba(24,166,115,0.2);margin-bottom:10px">
                <h4 style="font-weight:700;color:var(--success);margin-bottom:4px">S — Situation</h4>
                <p style="font-size:0.8125rem">Describe the specific situation or context you were in. Set the scene with relevant details.</p>
            </div>
            <div class="card" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);margin-bottom:10px">
                <h4 style="font-weight:700;color:#3b82f6;margin-bottom:4px">T — Task</h4>
                <p style="font-size:0.8125rem">Explain what you were trying to achieve or what your responsibility was in that situation.</p>
            </div>
            <div class="card" style="background:rgba(212,167,44,0.08);border:1px solid rgba(212,167,44,0.2);margin-bottom:10px">
                <h4 style="font-weight:700;color:var(--accent);margin-bottom:4px">A — Action</h4>
                <p style="font-size:0.8125rem">Describe the specific steps YOU took to address the situation. Focus on your individual contribution.</p>
            </div>
            <div class="card" style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);margin-bottom:16px">
                <h4 style="font-weight:700;color:#a855f7;margin-bottom:4px">R — Result</h4>
                <p style="font-size:0.8125rem">Share the outcome of your actions. Use quantifiable metrics when possible (%, $, time saved, etc.).</p>
            </div>

            <h4 style="font-size:0.9375rem;font-weight:600;margin-bottom:8px">Example Answer:</h4>
            <div class="card" style="background:var(--bg);border:1px solid var(--border)">
                <p style="font-size:0.8125rem"><strong>S:</strong> In my previous role, our team was facing a critical deadline for a client deliverable.</p>
                <p style="font-size:0.8125rem;margin-top:6px"><strong>T:</strong> I was responsible for ensuring the deliverable was completed on time and met quality standards.</p>
                <p style="font-size:0.8125rem;margin-top:6px"><strong>A:</strong> I organized daily stand-ups, prioritized tasks by impact, and coordinated directly with stakeholders to manage expectations.</p>
                <p style="font-size:0.8125rem;margin-top:6px"><strong>R:</strong> We delivered the project 2 days early, achieving a 95% client satisfaction score and securing a contract renewal.</p>
            </div>
        </div>
        <div class="card" style="background:rgba(212,167,44,0.08);border:1px solid rgba(212,167,44,0.2)">
            <p style="font-size:0.8125rem"><i class="fas fa-lightbulb text-gold"></i> <strong>Pro tip:</strong> Focus on YOUR actions using "I" instead of "we". Prepare 3-5 STAR stories that can be adapted to different questions.</p>
        </div>`;
    },

    renderChecklist(interview) {
        const checked = interview.checklist || {};
        const completed = Object.values(checked).filter(v => v).length;
        const total = this.CHECKLIST_ITEMS.length;
        const pct = Math.round((completed / total) * 100);

        let html = `<div class="card text-center">
            <div class="stat-value ${pct >= 80 ? 'success' : pct >= 50 ? 'gold' : ''}" style="font-size:2rem">${pct}%</div>
            <div class="stat-label">Interview Readiness</div>
            <div class="progress-bar mt-8" style="max-width:200px;margin:8px auto 0">
                <div class="progress-fill ${pct >= 80 ? 'success' : pct >= 50 ? 'gold' : 'warning'}" style="width:${pct}%"></div>
            </div>
        </div>`;

        html += '<div class="card">';
        this.CHECKLIST_ITEMS.forEach(item => {
            const isChecked = checked[item.id];
            html += `<div class="checklist-item">
                <div class="checklist-checkbox ${isChecked ? 'checked' : ''}" onclick="Interview.toggleChecklist('${item.id}')">
                    ${isChecked ? '<i class="fas fa-check" style="font-size:0.75rem"></i>' : ''}
                </div>
                <span style="font-size:0.875rem;${isChecked ? 'text-decoration:line-through;color:var(--text-light)' : ''}">${item.label}</span>
            </div>`;
        });
        html += '</div>';

        if (pct === 100) {
            html += `<div class="card" style="background:rgba(24,166,115,0.08);border:1px solid rgba(24,166,115,0.2);text-align:center">
                <i class="fas fa-circle-check text-success" style="font-size:2rem"></i>
                <h3 style="font-size:1rem;font-weight:600;margin-top:4px">You're ready!</h3>
                <p class="text-light" style="font-size:0.8125rem">All checklist items completed. Good luck with your interview!</p>
            </div>`;
        }

        return html;
    },

    toggleChecklist(itemId) {
        if (!this.currentInterview) return;
        this.currentInterview.checklist[itemId] = !this.currentInterview.checklist[itemId];
        Storage.saveInterview(this.currentInterview);
        this.render(this.currentInterview.jobId);
    },
};
