// ===== JOB ANALYZER - Analysis, Gap Analysis, CV Tailoring, Application Pack =====

const JobAnalyzer = {
    currentJob: null,
    tailorState: null,

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

    // ===== HOME =====
    renderHome() {
        const jobs = Storage.getAllJobs();
        let html = `<div class="flex-between mb-16">
            <div><h2 style="font-size:1.25rem;font-weight:700">Job Match</h2>
            <p class="text-light" style="font-size:0.8125rem">Analyze jobs and match with your CV</p></div>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('job/analyze')"><i class="fas fa-plus"></i> Analyze</button>
        </div>`;
        if (jobs.length === 0) {
            html += `<div class="empty-state"><i class="fas fa-bullseye"></i>
                <h3>No jobs analyzed yet</h3><p>Paste a job description to get started</p>
                <button class="btn btn-primary" onclick="App.navigate('job/analyze')"><i class="fas fa-magnifying-glass"></i> Analyze a Job</button></div>`;
        } else {
            jobs.forEach(job => {
                const score = job.matchScore ? job.matchScore.overall : 0;
                html += `<div class="card card-tappable" onclick="App.navigate('job/results/${job.id}')">
                    <div class="flex-between">
                        <div style="flex:1"><h3 style="font-size:1rem;font-weight:600">${this.esc(job.jobTitle)}</h3>
                        <p class="text-light" style="font-size:0.75rem;margin-top:2px">${this.esc(job.company)} • ${new Date(job.createdAt).toLocaleDateString()}</p></div>
                        <div class="text-center" style="margin-left:12px">
                            <div class="stat-value ${score >= 70 ? 'success' : score >= 50 ? 'gold' : ''}" style="font-size:1.25rem">${score}%</div>
                            <div class="stat-label">Match</div></div></div></div>`;
            });
        }
        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Job Match'); App.setBackButton(false);
    },

    // ===== ANALYZER FORM =====
    renderAnalyzer() {
        const cvs = Storage.getAllCVs();
        let html = `<div class="card">
            <h3 style="font-size:1.0625rem;font-weight:600;margin-bottom:12px">Analyze a Job</h3>
            <div class="form-group">
                <label class="form-label">Job Title <span class="req">*</span></label>
                <input class="form-input" id="job-title" placeholder="e.g. Senior Software Engineer">
            </div>
            <div class="form-group">
                <label class="form-label">Company</label>
                <input class="form-input" id="job-company" placeholder="e.g. Tech Corp">
            </div>
            <div class="form-group">
                <label class="form-label">Application Deadline</label>
                <input type="date" class="form-input" id="job-deadline">
            </div>
            <div class="form-group">
                <label class="form-label">Job Description <span class="req">*</span></label>
                <textarea class="form-textarea" id="job-description" placeholder="Paste the full job description here..." style="min-height:200px"></textarea>
            </div>
            <div class="form-group">
                <input type="file" id="job-file" accept=".txt,.pdf,.docx" style="display:none" onchange="JobAnalyzer.handleFile(this)">
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('job-file').click()"><i class="fas fa-upload"></i> Upload File (.txt, .pdf, .docx)</button>
                <p class="form-hint">Supported: TXT (auto-extract), PDF/DOCX (copy-paste text manually)</p>
            </div>`;
        if (cvs.length > 0) {
            html += `<div class="form-group">
                <label class="form-label">Match against CV</label>
                <select class="form-select" id="job-cv-select">
                    ${cvs.map(c => `<option value="${c.id}">${this.esc(c.name)}</option>`).join('')}
                </select>
            </div>`;
        } else {
            html += `<div class="card" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);padding:12px;margin-top:8px">
                <p style="font-size:0.8125rem"><i class="fas fa-exclamation-triangle text-warning"></i> Create a CV first to get match scores. You can still analyze the job without one.</p>
            </div>`;
        }
        html += `<button class="btn btn-primary btn-block mt-16" onclick="JobAnalyzer.analyzeJob()"><i class="fas fa-magnifying-glass-chart"></i> Analyze Job</button>
        </div>`;
        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Analyze Job'); App.setBackButton(true);
    },

    handleFile(input) {
        const file = input.files[0];
        if (!file) return;
        const name = file.name.toLowerCase();
        if (name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => { document.getElementById('job-description').value = e.target.result; App.toast('File loaded', 'success'); };
            reader.readAsText(file);
        } else if (name.endsWith('.pdf')) {
            App.toast('PDF detected. Please copy and paste the job description text manually.', 'warning');
        } else if (name.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const cleaned = text.replace(/[^\w\s\-.,;:!?()@&%#/\\]/g, ' ').replace(/\s+/g, ' ').trim();
                    if (cleaned.length > 50) {
                        document.getElementById('job-description').value = cleaned;
                        App.toast('File loaded (text may need cleanup)', 'success');
                    } else { App.toast('Could not extract text. Please paste manually.', 'warning'); }
                } catch (err) { App.toast('Could not read file. Please paste manually.', 'warning'); }
            };
            reader.readAsText(file);
        } else {
            const reader = new FileReader();
            reader.onload = (e) => { document.getElementById('job-description').value = e.target.result; App.toast('File loaded', 'success'); };
            reader.readAsText(file);
        }
    },

    // ===== ANALYZE =====
    analyzeJob() {
        const title = document.getElementById('job-title').value.trim();
        const desc = document.getElementById('job-description').value.trim();
        if (!title && !desc) { App.toast('Please enter a job title or paste a description', 'danger'); return; }
        if (!desc) { App.toast('Please paste the job description', 'danger'); return; }

        const company = document.getElementById('job-company').value.trim();
        const deadline = document.getElementById('job-deadline').value;
        const extracted = Scoring.extractJobInfo(desc);
        const cvSelect = document.getElementById('job-cv-select');
        const cvId = cvSelect ? cvSelect.value : null;
        const cv = cvId ? Storage.getCV(cvId) : (Storage.getAllCVs()[0] || null);

        const job = {
            id: Storage.uuid(),
            jobTitle: title || extracted.jobTitle || 'Untitled Position',
            company: company || extracted.company || 'Unknown Company',
            location: extracted.location || '',
            deadline,
            description: desc,
            extracted,
            cvId: cv ? cv.id : null,
            createdAt: new Date().toISOString(),
        };

        if (cv) job.matchScore = Scoring.calculateMatchScore(cv, job);
        else job.matchScore = null;

        Storage.saveJob(job);
        App.navigate(`job/results/${job.id}`);
    },

    // ===== RESULTS =====
    renderResults(jobId) {
        const job = Storage.getJob(jobId);
        if (!job) { App.navigate('job'); return; }
        this.currentJob = job;
        const score = job.matchScore;

        let html = `<div class="card text-center">
            <h2 style="font-size:1.125rem;font-weight:700">${this.esc(job.jobTitle)}</h2>
            <p class="text-light" style="font-size:0.875rem">${this.esc(job.company)}${job.location ? ' • ' + this.esc(job.location) : ''}</p>`;

        if (score) {
            const sColor = score.overall >= 70 ? 'var(--success)' : score.overall >= 50 ? 'var(--warning)' : 'var(--danger)';
            html += `<div class="score-circle" style="background:conic-gradient(${sColor} ${score.overall * 3.6}deg, var(--border) 0deg);border-radius:50%;width:120px;height:120px;margin:16px auto;display:flex;align-items:center;justify-content:center">
                <div style="background:var(--card-bg);width:96px;height:96px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center">
                    <div style="font-size:1.75rem;font-weight:700;color:${sColor}">${score.overall}%</div>
                    <div style="font-size:0.75rem;color:var(--text-light)">Match Score</div>
                </div></div>`;

            // Component scores
            const components = [
                { label: 'Keyword Match', val: score.keyword.score },
                { label: 'Skills Match', val: score.skills.score },
                { label: 'Experience', val: score.experience.score },
                { label: 'Education', val: score.education.score },
                { label: 'Certifications', val: score.certification.score },
                { label: 'ATS Formatting', val: score.atsFormatting.score },
            ];
            components.forEach(c => {
                const cls = c.val >= 70 ? 'success' : c.val >= 50 ? 'warning' : 'danger';
                html += `<div class="score-bar-row">
                    <span class="s-label">${c.label}</span>
                    <div class="progress-bar s-bar"><div class="progress-fill ${cls}" style="width:${c.val}%"></div></div>
                    <span class="s-val">${c.val}%</span></div>`;
            });
        } else {
            html += `<div class="card" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);margin-top:12px">
                <p style="font-size:0.8125rem"><i class="fas fa-info-circle text-warning"></i> No CV available for matching. Create a CV to see match scores.</p></div>`;
        }
        html += `</div>`;

        if (score) {
            // Matched & Missing
            html += `<h3 class="section-title">Matched Skills</h3><div class="card">`;
            if (score.skills.matched.length) score.skills.matched.forEach(s => html += `<span class="tag tag-match"><i class="fas fa-check"></i> ${s}</span>`);
            else html += '<p class="text-light" style="font-size:0.8125rem">No matching skills found</p>';
            html += `</div>`;

            html += `<h3 class="section-title">Missing Skills</h3><div class="card">`;
            if (score.skills.missing.length) score.skills.missing.forEach(s => html += `<span class="tag tag-miss"><i class="fas fa-times"></i> ${s}</span>`);
            else html += '<p class="text-light" style="font-size:0.8125rem">No missing skills</p>';
            html += `</div>`;

            // Extracted info
            const ji = job.extracted || {};
            if (ji.technicalSkills && ji.technicalSkills.length) {
                html += `<h3 class="section-title">Required Skills</h3><div class="card">`;
                ji.technicalSkills.forEach(s => html += `<span class="tag">${s}</span>`);
                html += `</div>`;
            }
            if (ji.requiredExperience) {
                html += `<div class="card"><div class="flex-between"><span style="font-size:0.875rem;font-weight:500">Required Experience</span><span class="badge badge-info">${ji.requiredExperience}+ years</span></div></div>`;
            }
            if (ji.educationLevel) {
                html += `<div class="card"><div class="flex-between"><span style="font-size:0.875rem;font-weight:500">Required Education</span><span class="badge badge-info">${ji.educationLevel.label}</span></div></div>`;
            }

            // Score explanation
            html += `<h3 class="section-title">How Scores Are Calculated</h3><div class="card">${Scoring.getScoreExplanation(score)}</div>`;
        }

        // Actions
        html += `<div class="btn-group mt-16">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('job/gap/${job.id}')"><i class="fas fa-chart-line"></i> Gap Analysis</button>`;
        if (score) html += `<button class="btn btn-secondary btn-sm" onclick="App.navigate('job/tailor/${job.id}')"><i class="fas fa-wand-magic-sparkles"></i> Tailor CV</button>`;
        html += `<button class="btn btn-secondary btn-sm" onclick="App.navigate('job/pack/${job.id}')"><i class="fas fa-box"></i> App Pack</button>
        </div>`;
        html += `<button class="btn btn-primary btn-block mt-8" onclick="JobAnalyzer.saveAsApplication('${job.id}')"><i class="fas fa-briefcase"></i> Save as Application</button>`;
        html += `<button class="btn btn-danger btn-block mt-8" onclick="JobAnalyzer.deleteJob('${job.id}')"><i class="fas fa-trash"></i> Delete Analysis</button>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Job Analysis'); App.setBackButton(true);
    },

    saveAsApplication(jobId) {
        const job = Storage.getJob(jobId);
        if (!job) return;
        const app = {
            id: Storage.uuid(),
            company: job.company || '',
            position: job.jobTitle || '',
            location: job.location || '',
            deadline: job.deadline || '',
            dateSaved: new Date().toISOString(),
            status: 'saved',
            jobId,
            atsMatch: job.matchScore ? job.matchScore.overall : 0,
            notes: '',
        };
        Storage.saveApplication(app);
        App.toast('Saved to Applications', 'success');
        App.navigate('applications');
    },

    deleteJob(id) {
        App.confirm('Delete this job analysis?', 'This action cannot be undone.', () => {
            Storage.deleteJob(id); App.toast('Deleted', 'success'); App.navigate('job');
        });
    },

    // ===== GAP ANALYSIS =====
    renderGap(jobId) {
        const job = Storage.getJob(jobId);
        if (!job) { App.navigate('job'); return; }
        this.currentJob = job;
        const score = job.matchScore;
        const ji = job.extracted || {};

        if (!score) {
            document.getElementById('view-container').innerHTML = `<div class="empty-state"><i class="fas fa-chart-line"></i>
                <h3>No match data available</h3><p>Create a CV and re-analyze to see gap analysis</p>
                <button class="btn btn-primary" onclick="App.navigate('job')">Back</button></div>`;
            App.setTitle('Gap Analysis'); App.setBackButton(true); return;
        }

        const gaps = this.generateGapAnalysis(score, ji);

        let html = `<h2 style="font-size:1.125rem;font-weight:700;margin-bottom:12px">Career Gap Analysis</h2>
            <p class="text-light mb-16" style="font-size:0.8125rem">${this.esc(job.jobTitle)} at ${this.esc(job.company)}</p>`;

        // Strong matches
        html += `<h3 class="section-title text-success"><i class="fas fa-circle-check"></i> Strong Matches</h3>`;
        if (gaps.strong.length) gaps.strong.forEach(g => html += this.gapItemHTML(g, 'match'));
        else html += '<div class="card"><p class="text-light" style="font-size:0.8125rem">No strong matches found</p></div>';

        // Weak matches
        html += `<h3 class="section-title text-warning"><i class="fas fa-circle-exclamation"></i> Weak Matches</h3>`;
        if (gaps.weak.length) gaps.weak.forEach(g => html += this.gapItemHTML(g));
        else html += '<div class="card"><p class="text-light" style="font-size:0.8125rem">No weak matches</p></div>';

        // Missing
        html += `<h3 class="section-title text-danger"><i class="fas fa-circle-xmark"></i> Missing Requirements</h3>`;
        if (gaps.missing.length) gaps.missing.forEach(g => html += this.gapItemHTML(g, 'miss'));
        else html += '<div class="card"><p class="text-light" style="font-size:0.8125rem">No missing requirements</p></div>';

        // Transferable skills
        html += `<h3 class="section-title"><i class="fas fa-shuffle"></i> Transferable Skills</h3>`;
        if (gaps.transferable.length) {
            html += '<div class="card">';
            gaps.transferable.forEach(s => html += `<span class="tag tag-weak">${s}</span>`);
            html += '</div>';
        } else html += '<div class="card"><p class="text-light" style="font-size:0.8125rem">No transferable skills identified</p></div>';

        // Recommendations
        html += `<h3 class="section-title"><i class="fas fa-lightbulb"></i> Recommended Improvements</h3>`;
        gaps.recommendations.forEach(r => html += `<div class="card" style="padding:12px 16px"><p style="font-size:0.875rem"><i class="fas fa-arrow-right text-gold"></i> ${r}</p></div>`);

        html += `<div class="card" style="background:rgba(212,167,44,0.08);border:1px solid rgba(212,167,44,0.2)">
            <p style="font-size:0.8125rem"><i class="fas fa-info-circle text-gold"></i> This analysis is based on your current CV and the job description. Never fabricate experience or qualifications you do not have.</p></div>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Gap Analysis'); App.setBackButton(true);
    },

    gapItemHTML(g, extraClass = '') {
        return `<div class="gap-item ${extraClass}">
            <h4>${this.esc(g.requirement)}</h4>
            <div class="gap-row"><span class="label">Evidence:</span><span class="value">${this.esc(g.evidence)}</span></div>
            <div class="gap-row"><span class="label">Gap:</span><span class="value">${this.esc(g.gap)}</span></div>
            <div class="gap-row"><span class="label">Action:</span><span class="value">${this.esc(g.action)}</span></div>
        </div>`;
    },

    generateGapAnalysis(score, ji) {
        const result = { strong: [], weak: [], missing: [], transferable: [], recommendations: [] };

        // Skills
        score.skills.matched.forEach(s => {
            result.strong.push({ requirement: s, evidence: `Found in your CV`, gap: 'No gap — strong match', action: 'Highlight this skill prominently in your CV' });
        });
        score.skills.missing.forEach(s => {
            result.missing.push({ requirement: s, evidence: 'Not found in CV', gap: 'Skill not present in your CV', action: `Add ${s} to your skills section if you have genuine experience with it` });
        });

        // Experience
        if (score.experience.requiredYears > 0) {
            if (score.experience.score >= 100) {
                result.strong.push({ requirement: `${score.experience.requiredYears}+ years experience`, evidence: `${score.experience.cvYears} years documented`, gap: 'No gap', action: 'No action needed' });
            } else if (score.experience.score >= 50) {
                result.weak.push({ requirement: `${score.experience.requiredYears}+ years experience`, evidence: `${score.experience.cvYears} years documented`, gap: `${score.experience.cvYears} of ${score.experience.requiredYears} required`, action: 'Highlight all relevant experience, including internships and projects' });
            } else {
                result.missing.push({ requirement: `${score.experience.requiredYears}+ years experience`, evidence: `${score.experience.cvYears} years documented`, gap: 'Insufficient experience', action: 'Emphasize transferable skills and any relevant project work' });
            }
        }

        // Education
        if (score.education.reqLevel) {
            if (score.education.score >= 100) {
                result.strong.push({ requirement: score.education.reqLevel, evidence: score.education.cvLevel || 'Present', gap: 'No gap', action: 'No action needed' });
            } else {
                result.weak.push({ requirement: score.education.reqLevel, evidence: score.education.cvLevel || 'Not specified', gap: score.education.note, action: 'Clearly state your education level and relevant coursework' });
            }
        }

        // Certifications
        if (score.certification.missing && score.certification.missing.length) {
            score.certification.missing.forEach(c => {
                result.missing.push({ requirement: c.toUpperCase() + ' certification', evidence: 'Not in CV', gap: 'Certification not listed', action: `If you have this certification, add it. If not, consider pursuing it if relevant to your career goals` });
            });
        }
        if (score.certification.matched && score.certification.matched.length) {
            score.certification.matched.forEach(c => {
                result.strong.push({ requirement: c.toUpperCase(), evidence: 'Listed in CV', gap: 'No gap', action: 'No action needed' });
            });
        }

        // Keyword gaps
        const missingKeywords = score.keyword.missing.slice(0, 10);
        if (missingKeywords.length) {
            result.weak.push({ requirement: 'Keyword coverage', evidence: `${score.keyword.matched.length} of ${score.keyword.matched.length + score.keyword.missing.length} keywords found`, gap: 'Some job keywords missing from CV', action: `Incorporate these keywords naturally: ${missingKeywords.join(', ')}` });
        }

        // Transferable skills
        const cvSkills = score.jobInfo ? Scoring.getCVSkills({ data: Storage.getAllCVs()[0]?.data }) : [];
        const allJobSkills = ji.allSkills || [];
        const transferable = cvSkills.filter(s => !allJobSkills.includes(s) && ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical', 'project management', 'mentoring', 'collaboration', 'adaptability', 'creativity'].some(ts => s.includes(ts) || ts.includes(s)));
        result.transferable = [...new Set(transferable)].slice(0, 10);

        // Recommendations
        if (score.overall < 50) result.recommendations.push('Your overall match is below 50%. Focus on tailoring your CV to highlight relevant experience and skills.');
        if (score.skills.score < 60) result.recommendations.push('Add missing skills to your CV only if you genuinely have them. Never fabricate skills.');
        if (score.keyword.score < 60) result.recommendations.push('Incorporate more keywords from the job description naturally into your CV summary and experience descriptions.');
        if (score.atsFormatting.score < 80) result.recommendations.push('Switch to the ATS Minimal template for better automated parsing.');
        if (score.experience.score < 80) result.recommendations.push('Highlight all relevant experience, including internships, volunteer work, and academic projects.');
        if (result.recommendations.length === 0) result.recommendations.push('Your CV matches well with this job. Consider tailoring your summary for this specific role.');

        return result;
    },

    // ===== CV TAILORING =====
    renderTailor(jobId) {
        const job = Storage.getJob(jobId);
        if (!job) { App.navigate('job'); return; }
        this.currentJob = job;
        const cvs = Storage.getAllCVs();
        if (cvs.length === 0) {
            document.getElementById('view-container').innerHTML = `<div class="empty-state"><i class="fas fa-wand-magic-sparkles"></i>
                <h3>No CV to tailor</h3><p>Create a CV first</p>
                <button class="btn btn-primary" onclick="App.navigate('cv')">Go to My CV</button></div>`;
            App.setTitle('Tailor CV'); App.setBackButton(true); return;
        }

        const cv = job.cvId ? Storage.getCV(job.cvId) : cvs[0];
        this.tailorState = { summary: null, skills: null, experience: null, cvId: cv.id };
        const ji = job.extracted || {};
        const cvSkills = Scoring.getCVSkills(cv);
        const matchingSkills = (ji.allSkills || []).filter(s => cvSkills.some(cs => cs.includes(s) || s.includes(cs)));
        const enhancedSummary = this.enhanceSummary(cv.data.summary || '', matchingSkills);
        const reorderedSkills = this.reorderSkills(cv.data.skills || [], ji.allSkills || []);
        const reorderedExp = this.reorderExperience(cv.data.workExperience || [], ji.keywords || []);

        let html = `<div class="card" style="background:rgba(212,167,44,0.08);border:1px solid rgba(212,167,44,0.2)">
            <p style="font-size:0.8125rem"><i class="fas fa-info-circle text-gold"></i> Tailoring reorganizes and strengthens your existing CV content. No information will be fabricated.</p>
        </div>
        <h3 class="section-title">Professional Summary</h3>`;

        if (enhancedSummary !== (cv.data.summary || '')) {
            html += `<div class="card">
                <div class="tailor-compare">
                    <div class="tailor-box tailor-original"><strong>Original</strong><br>${this.esc(cv.data.summary || '(empty)')}</div>
                    <div class="tailor-box tailor-suggested"><strong>Suggested</strong><br>${this.esc(enhancedSummary)}</div>
                </div>
                <div class="btn-group mt-8">
                    <button class="btn btn-success btn-sm" onclick="JobAnalyzer.acceptTailor('summary', ${JSON.stringify(JSON.stringify(enhancedSummary))})"><i class="fas fa-check"></i> Accept</button>
                    <button class="btn btn-ghost btn-sm" onclick="JobAnalyzer.rejectTailor('summary')"><i class="fas fa-times"></i> Reject</button>
                </div>
            </div>`;
        } else {
            html += `<div class="card"><p class="text-light" style="font-size:0.8125rem">No changes suggested for summary</p></div>`;
        }

        // Skills reordering
        html += `<h3 class="section-title">Skills (Reordered by Relevance)</h3><div class="card">`;
        html += '<p style="font-size:0.75rem;color:var(--text-light);margin-bottom:8px">Skills matching the job are moved to the top:</p>';
        reorderedSkills.forEach((s, i) => {
            const isMatch = matchingSkills.some(ms => ms.includes(s.name?.toLowerCase()) || s.name?.toLowerCase().includes(ms));
            html += `<div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--border-light)">
                <span style="font-size:0.875rem">${i + 1}. ${this.esc(s.name)} ${s.level ? `<span class="text-light">(${s.level})</span>` : ''}</span>
                ${isMatch ? '<span class="badge badge-success">Match</span>' : ''}
            </div>`;
        });
        html += `<div class="btn-group mt-8">
            <button class="btn btn-success btn-sm" onclick='JobAnalyzer.acceptTailor("skills", ${JSON.stringify(JSON.stringify(reorderedSkills.map(s => ({id: s.id, name: s.name, level: s.level}))))})'><i class="fas fa-check"></i> Accept Order</button>
            <button class="btn btn-ghost btn-sm" onclick="JobAnalyzer.rejectTailor('skills')"><i class="fas fa-times"></i> Keep Original</button>
        </div></div>`;

        // Experience reordering
        html += `<h3 class="section-title">Work Experience (Reordered by Relevance)</h3><div class="card">`;
        reorderedExp.forEach((e, i) => {
            html += `<div style="padding:8px 0;border-bottom:1px solid var(--border-light)">
                <div style="font-weight:600;font-size:0.875rem">${i + 1}. ${this.esc(e.title)}</div>
                <div class="text-light" style="font-size:0.75rem">${this.esc(e.company)} • ${e._matchCount} keyword matches</div>
            </div>`;
        });
        html += `<div class="btn-group mt-8">
            <button class="btn btn-success btn-sm" onclick='JobAnalyzer.acceptTailor("experience", ${JSON.stringify(JSON.stringify(reorderedExp.map(e => ({id: e.id, title: e.title, company: e.company, location: e.location, startDate: e.startDate, endDate: e.endDate, description: e.description}))))})'><i class="fas fa-check"></i> Accept Order</button>
            <button class="btn btn-ghost btn-sm" onclick="JobAnalyzer.rejectTailor('experience')"><i class="fas fa-times"></i> Keep Original</button>
        </div></div>`;

        html += `<button class="btn btn-primary btn-block mt-16" onclick="JobAnalyzer.saveTailoredCV()"><i class="fas fa-save"></i> Save as New CV Version</button>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Tailor CV'); App.setBackButton(true);
    },

    enhanceSummary(original, matchingSkills) {
        if (!matchingSkills || matchingSkills.length === 0) return original;
        const notInSummary = matchingSkills.filter(s => !original.toLowerCase().includes(s));
        if (notInSummary.length === 0) return original;
        const skillStr = notInSummary.slice(0, 5).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
        return (original.trim() ? original.trim() + ' ' : '') + `Skilled in ${skillStr}.`;
    },

    reorderSkills(skills, jobSkills) {
        return [...skills].sort((a, b) => {
            const aMatch = jobSkills.some(js => js.includes(a.name?.toLowerCase()) || a.name?.toLowerCase().includes(js));
            const bMatch = jobSkills.some(js => js.includes(b.name?.toLowerCase()) || b.name?.toLowerCase().includes(js));
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
        });
    },

    reorderExperience(experience, keywords) {
        return experience.map(e => {
            const text = ((e.title || '') + ' ' + (e.company || '') + ' ' + (e.description || '')).toLowerCase();
            let count = 0;
            keywords.forEach(kw => { if (text.includes(kw)) count++; });
            return { ...e, _matchCount: count };
        }).sort((a, b) => b._matchCount - a._matchCount);
    },

    acceptTailor(section, value) {
        this.tailorState[section] = typeof value === 'string' ? JSON.parse(value) : value;
        App.toast(`${section.charAt(0).toUpperCase() + section.slice(1)} accepted`, 'success');
    },

    rejectTailor(section) {
        this.tailorState[section] = 'rejected';
        App.toast(`${section.charAt(0).toUpperCase() + section.slice(1)} kept original`, 'info');
    },

    saveTailoredCV() {
        if (!this.tailorState) return;
        const sourceCV = Storage.getCV(this.tailorState.cvId);
        if (!sourceCV) { App.toast('Source CV not found', 'danger'); return; }

        const newCV = JSON.parse(JSON.stringify(sourceCV));
        newCV.id = Storage.uuid();
        newCV.name = `Tailored - ${this.currentJob.jobTitle || 'Job'} - ${this.currentJob.company || ''}`;
        newCV.createdAt = new Date().toISOString();
        newCV.updatedAt = new Date().toISOString();

        if (this.tailorState.summary && this.tailorState.summary !== 'rejected') {
            newCV.data.summary = this.tailorState.summary;
        }
        if (this.tailorState.skills && this.tailorState.skills !== 'rejected') {
            newCV.data.skills = this.tailorState.skills;
        }
        if (this.tailorState.experience && this.tailorState.experience !== 'rejected') {
            newCV.data.workExperience = this.tailorState.experience;
        }

        Storage.saveCV(newCV);
        App.toast('Tailored CV saved!', 'success');
        App.navigate('cv');
    },

    // ===== APPLICATION PACK =====
    renderPack(jobId) {
        const job = Storage.getJob(jobId);
        if (!job) { App.navigate('job'); return; }
        this.currentJob = job;
        const profile = Storage.getProfile();
        const cvs = Storage.getAllCVs();
        const cv = job.cvId ? Storage.getCV(job.cvId) : cvs[0];

        // Generate or load pack
        if (!job.pack) {
            job.pack = {
                coverLetter: this.generateCoverLetter(profile, cv, job),
                appEmail: this.generateAppEmail(profile, job),
                linkedinMessage: this.generateLinkedInMessage(profile, job),
                talkingPoints: this.generateTalkingPoints(cv, job),
            };
            Storage.saveJob(job);
        }

        const pack = job.pack;
        let html = `<h2 style="font-size:1.125rem;font-weight:700;margin-bottom:12px">Application Pack</h2>
            <p class="text-light mb-16" style="font-size:0.8125rem">${this.esc(job.jobTitle)} at ${this.esc(job.company)}</p>`;

        const items = [
            { key: 'coverLetter', icon: 'file-lines', title: 'Cover Letter' },
            { key: 'appEmail', icon: 'envelope', title: 'Application Email' },
            { key: 'linkedinMessage', icon: 'linkedin', title: 'LinkedIn Message' },
            { key: 'talkingPoints', icon: 'comments', title: 'Talking Points' },
        ];

        items.forEach(item => {
            html += `<div class="pack-item">
                <div class="pack-item-header" onclick="JobAnalyzer.togglePack('${item.key}')">
                    <h4><i class="fas fa-${item.icon} text-gold"></i> ${item.title}</h4>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="pack-item-body" id="pack-${item.key}" style="display:block">
                    <textarea id="pack-text-${item.key}" oninput="JobAnalyzer.savePackText('${item.key}', this.value)">${this.esc(pack[item.key])}</textarea>
                    <div class="btn-group mt-8">
                        <button class="btn btn-secondary btn-sm" onclick="JobAnalyzer.copyText('pack-text-${item.key}')"><i class="fas fa-copy"></i> Copy</button>
                        ${item.key === 'appEmail' ? `<button class="btn btn-secondary btn-sm" onclick="JobAnalyzer.sendEmail('${job.id}')"><i class="fas fa-paper-plane"></i> Send</button>` : ''}
                        ${item.key === 'linkedinMessage' ? `<button class="btn btn-secondary btn-sm" onclick="JobAnalyzer.shareLinkedIn('${job.id}')"><i class="fab fa-linkedin"></i> Share</button>` : ''}
                    </div>
                </div>
            </div>`;
        });

        html += `<div class="card mt-16">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:8px">Interview Preparation</h3>
            <p class="text-light" style="font-size:0.8125rem;margin-bottom:8px">Generate interview questions and prepare answers</p>
            <button class="btn btn-primary btn-block btn-sm" onclick="App.navigate('interview/${job.id}')"><i class="fas fa-microphone-lines"></i> Start Interview Prep</button>
        </div>`;

        if (cv) {
            html += `<div class="card">
                <h3 style="font-size:1rem;font-weight:600;margin-bottom:8px">Tailored CV</h3>
                <button class="btn btn-secondary btn-block btn-sm" onclick="App.navigate('job/tailor/${job.id}')"><i class="fas fa-wand-magic-sparkles"></i> Tailor My CV for This Job</button>
            </div>`;
        }

        html += `<div class="card">
            <h3 style="font-size:1rem;font-weight:600;margin-bottom:8px">Export & Share</h3>
            <div class="btn-group">
                <button class="btn btn-secondary btn-sm" onclick="Exporter.exportAppPack('${job.id}')"><i class="fas fa-print"></i> Print Pack</button>
                <button class="btn btn-secondary btn-sm" onclick="JobAnalyzer.shareWhatsApp('${job.id}')"><i class="fab fa-whatsapp"></i> WhatsApp</button>
                <button class="btn btn-secondary btn-sm" onclick="JobAnalyzer.shareTelegram('${job.id}')"><i class="fab fa-telegram"></i> Telegram</button>
            </div>
        </div>`;

        document.getElementById('view-container').innerHTML = html;
        App.setTitle('Application Pack'); App.setBackButton(true);
    },

    togglePack(key) {
        const el = document.getElementById(`pack-${key}`);
        if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
    },

    savePackText(key, value) {
        if (!this.currentJob) return;
        this.currentJob.pack = this.currentJob.pack || {};
        this.currentJob.pack[key] = value;
        Storage.saveJob(this.currentJob);
    },

    copyText(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.select();
            try { navigator.clipboard.writeText(el.value); App.toast('Copied to clipboard', 'success'); }
            catch (e) { document.execCommand('copy'); App.toast('Copied', 'success'); }
        }
    },

    sendEmail(jobId) {
        const job = Storage.getJob(jobId);
        const profile = Storage.getProfile();
        const pack = job.pack || {};
        const subject = `Application for ${job.jobTitle} - ${profile.fullName || 'Applicant'}`;
        const body = encodeURIComponent(pack.appEmail || '');
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    },

    shareLinkedIn(jobId) {
        const job = Storage.getJob(jobId);
        const pack = job.pack || {};
        const text = encodeURIComponent(pack.linkedinMessage || '');
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${text}`, '_blank');
    },

    shareWhatsApp(jobId) {
        const job = Storage.getJob(jobId);
        const pack = job.pack || {};
        const text = encodeURIComponent(pack.coverLetter || pack.appEmail || '');
        window.open(`https://wa.me/?text=${text}`, '_blank');
    },

    shareTelegram(jobId) {
        const job = Storage.getJob(jobId);
        const pack = job.pack || {};
        const text = encodeURIComponent(pack.appEmail || pack.coverLetter || '');
        window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
    },

    // ===== GENERATORS =====
    generateCoverLetter(profile, cv, job) {
        const ji = job.extracted || Scoring.extractJobInfo(job.description);
        const cvSkills = cv ? Scoring.getCVSkills(cv) : [];
        const matchingSkills = (ji.allSkills || []).filter(s => cvSkills.some(cs => cs.includes(s) || s.includes(cs)));
        const topSkills = matchingSkills.slice(0, 5);
        const years = profile.yearsOfExperience || 'several';

        return `Dear Hiring Manager,

I am writing to express my strong interest in the ${ji.jobTitle || job.jobTitle || 'open position'} at ${ji.company || job.company || 'your organization'}.

${profile.summary ? profile.summary : `I am a ${profile.professionalTitle || 'professional'} with ${years} years of experience.`}

${topSkills.length > 0 ? `My relevant qualifications include:\n${topSkills.map(s => '• ' + s.charAt(0).toUpperCase() + s.slice(1)).join('\n')}\n` : ''}I would welcome the opportunity to discuss how my experience aligns with your requirements.

Thank you for your consideration.

Sincerely,
${profile.fullName || 'Applicant'}
${profile.phone || ''} | ${profile.email || ''}${profile.linkedin ? ' | ' + profile.linkedin : ''}`;
    },

    generateAppEmail(profile, job) {
        const ji = job.extracted || Scoring.extractJobInfo(job.description);
        return `Subject: Application for ${ji.jobTitle || job.jobTitle || 'Position'} - ${profile.fullName || 'Applicant'}

Dear Hiring Manager,

I am pleased to submit my application for the ${ji.jobTitle || job.jobTitle || 'position'} at ${ji.company || job.company || 'your organization'}. I have attached my CV for your review.

${profile.summary ? profile.summary.substring(0, 200) : 'I believe my experience and skills make me a strong candidate for this role.'}

I would appreciate the opportunity to discuss my qualifications further. Thank you for your time and consideration.

Best regards,
${profile.fullName || 'Applicant'}
${profile.phone || ''} | ${profile.email || ''}${profile.linkedin ? ' | ' + profile.linkedin : ''}`;
    },

    generateLinkedInMessage(profile, job) {
        const ji = job.extracted || Scoring.extractJobInfo(job.description);
        return `Hi there,

I came across the ${ji.jobTitle || job.jobTitle || 'position'} at ${ji.company || job.company || 'your organization'} and wanted to reach out. With my background${profile.professionalTitle ? ' as a ' + profile.professionalTitle : ''}, I believe I could be a great fit.

I'd love to connect and learn more about the opportunity.

Best regards,
${profile.fullName || 'Applicant'}`;
    },

    generateTalkingPoints(cv, job) {
        const ji = job.extracted || Scoring.extractJobInfo(job.description);
        const cvSkills = cv ? Scoring.getCVSkills(cv) : [];
        const matchingSkills = (ji.allSkills || []).filter(s => cvSkills.some(cs => cs.includes(s) || s.includes(cs)));

        let points = 'Key Strengths to Highlight:\n';
        matchingSkills.slice(0, 5).forEach(s => { points += `• ${s.charAt(0).toUpperCase() + s.slice(1)}\n`; });

        if (cv && cv.data.workExperience && cv.data.workExperience.length) {
            points += '\nRelevant Experience:\n';
            cv.data.workExperience.slice(0, 3).forEach(e => { points += `• ${e.title} at ${e.company}\n`; });
        }

        points += '\nQuestions to Ask the Employer:\n';
        points += '• What does success look like in this role?\n';
        points += '• What are the biggest challenges the team is facing?\n';
        points += '• How would you describe the team culture?\n';
        points += '• What opportunities are there for professional growth?\n';
        points += '• What are the next steps in the interview process?\n';

        return points;
    },
};
