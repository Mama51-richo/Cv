// ===== SCORING ENGINE - Transparent CV/Job matching =====

const Scoring = {
    STOP_WORDS: new Set('a an the and or but in on at to for of is are was were be been being have has had do does did will would could should may might must can this that these those i you he she it we they them his her its their our your my me him us as by from with about into through during before after above below up down out off over under again further then once here there all any both each few more most other some such no nor not only own same so than too very just also may if then else when where why how what which who whom whose because while although though unless until since without within along across among between against during throughout despite except besides however therefore thus hence whereas whereby wherein thereof thereto therefor thereupon herewith herein hereunder hereinafter hereto hereon herewith of to in for on with at by from up about into through during before after above below between under over off out down further then once here there all both each more most other some such no nor not only own same so than too very just also but is are was were be been being have has had do does did will would could should may might must can may this that these those i you he she it we they them his her its their our your my me him us as by'.split(' ')),

    TECH_SKILLS: ['javascript','typescript','python','java','c++','c#','go','ruby','php','swift','kotlin','rust','scala','r','matlab','perl','bash','shell','powershell','react','angular','vue','svelte','jquery','redux','node.js','express','django','flask','spring','laravel','.net','rails','fastapi','next.js','nuxt','gatsby','html','css','sass','scss','less','bootstrap','tailwind','material-ui','styled-components','webpack','vite','babel','rollup','parcel','sql','postgresql','mysql','mongodb','redis','sqlite','oracle','dynamodb','cassandra','elasticsearch','graphql','rest','soap','grpc','websocket','aws','azure','gcp','docker','kubernetes','terraform','ansible','jenkins','gitlab ci','circleci','github actions','git','github','gitlab','bitbucket','svn','jira','confluence','trello','asana','slack','notion','figma','sketch','adobe xd','photoshop','illustrator','indesign','machine learning','deep learning','ai','artificial intelligence','nlp','natural language processing','computer vision','data analysis','data science','data engineering','data visualization','big data','hadoop','spark','kafka','airflow','dbt','tableau','power bi','looker','excel','vba','google sheets','pandas','numpy','scipy','scikit-learn','tensorflow','pytorch','keras','xgboost','opencv','mlflow','linux','unix','windows','macos','ubuntu','centos','debian','nginx','apache','iis','selenium','cypress','jest','mocha','chai','junit','testng','pytest','unittest','postman','swagger','microservices','serverless','lambda','api gateway','ci/cd','devops','agile','scrum','kanban','waterfall','safe','project management','product management','stakeholder management','budgeting','forecasting','financial analysis','accounting','auditing','tax','excel modeling','erp','sap','oracle financials','quickbooks','salesforce','hubspot','marketo','seo','sem','google analytics','google ads','facebook ads','content marketing','email marketing','social media marketing','public relations','copywriting','brand management','customer success','customer service','sales','b2b','b2c','lead generation','cold calling','negotiation','contract management','procurement','supply chain','logistics','inventory management','quality assurance','quality control','iso 9001','iso 27001','iso 14001','lean','six sigma','kaizen','5s','root cause analysis','risk management','compliance','governance','policy development','change management','organizational development','training and development','recruitment','onboarding','performance management','employee relations','compensation','benefits','payroll','human resources','talent acquisition','diversity and inclusion','employee engagement','conflict resolution','mediation','facilitation','public speaking','presentation skills','technical writing','documentation','user research','ux design','ui design','wireframing','prototyping','usability testing','accessibility','responsive design','mobile development','ios','android','react native','flutter','xamarin','ionic','progressive web apps','electron','desktop applications','embedded systems','iot','arduino','raspberry pi','robotics','automation','plc','scada','cad','cam','autocad','solidworks','3d printing','cnc','manufacturing','lean manufacturing','production planning','health and safety','osha','first aid','cpr','safety management','environmental management','sustainability','renewable energy','solar','wind','battery','electric vehicle','carbon footprint','esg','corporate social responsibility','grant writing','fundraising','donor management','volunteer management','community outreach','program management','monitoring and evaluation','proposal writing','report writing','stakeholder engagement','advocacy','policy analysis','research','qualitative research','quantitative research','survey design','statistical analysis','spss','stata','r programming','gis','arcgis','qgis','mapping','remote sensing','geospatial analysis','field research','data collection','data entry','data cleaning','data management','database design','data modeling','etl','data warehousing','business intelligence','reporting','dashboards','kpi','metrics','okr','balanced scorecard','performance management','strategic planning','business development','market research','competitive analysis','swot analysis','pestle analysis','business model canvas','value proposition','customer segmentation','persona development','journey mapping','service design','design thinking','innovation','ideation','brainstorming','problem solving','critical thinking','analytical thinking','decision making','troubleshooting','debugging','code review','refactoring','optimization','performance tuning','scalability','reliability','monitoring','logging','alerting','incident response','disaster recovery','backup and recovery','security','cybersecurity','penetration testing','vulnerability assessment','encryption','authentication','authorization','oauth','saml','jwt','ssl','tls','firewall','network security','information security','gdpr','hipaa','pci dss','data privacy','data protection','incident management','forensics','malware analysis','reverse engineering','binary analysis','firmware analysis'],

    SOFT_SKILLS: ['leadership','communication','teamwork','team player','problem-solving','problem solving','critical thinking','time management','adaptability','collaboration','analytical','creativity','decision making','negotiation','presentation','mentoring','coaching','interpersonal','organizational','strategic planning','conflict resolution','emotional intelligence','active listening','customer focus','attention to detail','self-motivated','self-starter','proactive','initiative','flexibility','resilience','stress management','multitasking','prioritization','planning','delegation','empowerment','accountability','responsibility','ownership','integrity','professionalism','work ethic','continuous learning','curiosity','innovation','openness','empathy','patience','diplomacy','tact','persuasion','influence','relationship building','networking','cross-functional','remote work','virtual collaboration'],

    CERT_NAMES: ['pmp','prince2','csm','csPO','safe','itil','cissp','cism','ceh','ccna','ccnp','ccie','aws certified','azure certified','gcp certified','google cloud','comptia','security+','network+','a+','cfa','cpa','acca','cima','cia','cisa','six sigma green belt','six sigma black belt','lean six sigma','togaf','cobit','pmp certified','scrum master','product owner','acsm','acsm-cpt','shrm','phr','sphr','grc','frm','caia','series 7','series 63','cstp','istqb','capm','pmi-acp'],

    EDUCATION_LEVELS: [
        { keywords: ['phd','doctorate','doctoral'], level: 5, label: 'PhD/Doctorate' },
        { keywords: ['master','msc','m.sc','mba','ma','m.eng','m.ed','m.s','mfa','mpp','mpa','llm'], level: 4, label: 'Master\'s' },
        { keywords: ['bachelor','bsc','b.sc','ba','b.eng','b.ed','b.s','bba','llb','associate','diploma','high school','ged'], level: 3, label: 'Bachelor\'s' },
        { keywords: ['associate','diploma','certificate'], level: 2, label: 'Associate/Diploma' },
        { keywords: ['high school','ged','secondary'], level: 1, label: 'High School' },
    ],

    // ===== TEXT PROCESSING =====
    tokenize(text) {
        if (!text) return [];
        return text.toLowerCase().replace(/[^\w\s\-\.]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !this.STOP_WORDS.has(w));
    },

    extractKeywords(text, limit = 30) {
        if (!text) return [];
        const words = this.tokenize(text);
        const freq = {};
        words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(e => e[0]);
    },

    extractSkills(text) {
        if (!text) return { technical: [], soft: [] };
        const lower = text.toLowerCase();
        const technical = this.TECH_SKILLS.filter(s => lower.includes(s));
        const soft = this.SOFT_SKILLS.filter(s => lower.includes(s));
        return { technical: [...new Set(technical)], soft: [...new Set(soft)] };
    },

    extractYearsExperience(text) {
        if (!text) return null;
        const patterns = [
            /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|professional|relevant)/i,
            /(?:minimum|at least|requires?)\s*(\d+)\+?\s*years?/i,
            /(\d+)\s*-\s*(\d+)\s*years?\s*(?:of\s*)?experience/i,
            /experience\s*(?:of\s*)?(\d+)\+?\s*years?/i,
        ];
        for (const p of patterns) {
            const m = text.match(p);
            if (m) return parseInt(m[1] || (m[2] ? m[2] : 0));
        }
        return null;
    },

    extractEducationLevel(text) {
        if (!text) return null;
        const lower = text.toLowerCase();
        let maxLevel = 0, label = null;
        for (const e of this.EDUCATION_LEVELS) {
            for (const kw of e.keywords) {
                if (lower.includes(kw) && e.level > maxLevel) {
                    maxLevel = e.level;
                    label = e.label;
                }
            }
        }
        return maxLevel > 0 ? { level: maxLevel, label } : null;
    },

    extractCertifications(text) {
        if (!text) return [];
        const lower = text.toLowerCase();
        return this.CERT_NAMES.filter(c => lower.includes(c));
    },

    extractJobInfo(text) {
        if (!text || !text.trim()) return null;
        const skills = this.extractSkills(text);
        const allSkills = [...skills.technical, ...skills.soft];
        
        // Try to extract job title from first lines
        const lines = text.trim().split('\n').filter(l => l.trim());
        let jobTitle = '';
        let company = '';
        let location = '';
        
        for (const line of lines.slice(0, 5)) {
            const lt = line.trim();
            if (/^(job title|position|role|title)\s*[:\-]/i.test(lt)) {
                jobTitle = lt.replace(/^(job title|position|role|title)\s*[:\-]\s*/i, '').trim();
            } else if (/^(company|organization|employer)\s*[:\-]/i.test(lt)) {
                company = lt.replace(/^(company|organization|employer)\s*[:\-]\s*/i, '').trim();
            } else if (/^(location|city|based in)\s*[:\-]/i.test(lt)) {
                location = lt.replace(/^(location|city|based in)\s*[:\-]\s*/i, '').trim();
            }
        }
        if (!jobTitle && lines.length > 0) jobTitle = lines[0].trim().substring(0, 100);

        // Extract responsibilities
        let responsibilities = [];
        const respMatch = text.match(/(?:responsibilities|duties|what you'?ll do|role description)\s*[:\-]?\s*([\s\S]*?)(?:\n\n|\n(?:qualifications|requirements|skills|about|what you|nice to have|preferred)|$)/i);
        if (respMatch) {
            responsibilities = respMatch[1].split('\n').map(l => l.replace(/^[\-\*\•]\s*/, '').trim()).filter(l => l.length > 10);
        }

        // Required vs preferred
        const reqSection = text.match(/(?:required|must have|essential|minimum requirements?|qualifications?)\s*[:\-]?\s*([\s\S]*?)(?:\n\n|\n(?:preferred|nice to have|bonus|about you|what you|desired)|$)/i);
        const prefSection = text.match(/(?:preferred|nice to have|bonus|desired|plus)\s*[:\-]?\s*([\s\S]*?)(?:\n\n|\n(?:about|benefits|what we offer)|$)/i);

        return {
            jobTitle,
            company,
            location,
            keywords: this.extractKeywords(text),
            technicalSkills: skills.technical,
            softSkills: skills.soft,
            allSkills,
            requiredExperience: this.extractYearsExperience(text),
            educationLevel: this.extractEducationLevel(text),
            certifications: this.extractCertifications(text),
            responsibilities,
            requiredQualifications: reqSection ? reqSection[1].split('\n').map(l => l.replace(/^[\-\*\•]\s*/, '').trim()).filter(l => l.length > 5) : [],
            preferredQualifications: prefSection ? prefSection[1].split('\n').map(l => l.replace(/^[\-\*\•]\s*/, '').trim()).filter(l => l.length > 5) : [],
        };
    },

    // ===== CV PROCESSING =====
    getCVText(cv) {
        if (!cv || !cv.data) return '';
        const d = cv.data;
        let text = '';
        const p = d.personalInfo || {};
        text += `${p.fullName || ''} ${p.headline || ''} ${p.email || ''} ${p.phone || ''} ${p.location || ''} ${p.linkedin || ''} `;
        text += `${d.summary || ''} `;
        (d.workExperience || []).forEach(e => { text += `${e.title || ''} ${e.company || ''} ${e.description || ''} `; });
        (d.education || []).forEach(e => { text += `${e.degree || ''} ${e.institution || ''} ${e.field || ''} ${e.description || ''} `; });
        (d.skills || []).forEach(s => { text += `${s.name || ''} `; });
        (d.certifications || []).forEach(c => { text += `${c.name || ''} ${c.issuer || ''} `; });
        (d.languages || []).forEach(l => { text += `${l.name || ''} `; });
        (d.achievements || []).forEach(a => { text += `${a.title || ''} ${a.description || ''} `; });
        (d.projects || []).forEach(p => { text += `${p.name || ''} ${p.description || ''} ${p.technologies || ''} `; });
        (d.professionalDevelopment || []).forEach(p => { text += `${p.title || ''} ${p.description || ''} `; });
        return text;
    },

    getCVSkills(cv) {
        if (!cv || !cv.data) return [];
        const skills = (cv.data.skills || []).map(s => (s.name || '').toLowerCase()).filter(Boolean);
        const cvText = this.getCVText(cv).toLowerCase();
        this.TECH_SKILLS.forEach(s => { if (cvText.includes(s) && !skills.includes(s)) skills.push(s); });
        this.SOFT_SKILLS.forEach(s => { if (cvText.includes(s) && !skills.includes(s)) skills.push(s); });
        return [...new Set(skills)];
    },

    getCVExperienceYears(cv) {
        const profile = Storage.getProfile();
        if (profile.yearsOfExperience && !isNaN(parseInt(profile.yearsOfExperience))) {
            return parseInt(profile.yearsOfExperience);
        }
        if (!cv || !cv.data || !cv.data.workExperience) return 0;
        let totalMonths = 0;
        cv.data.workExperience.forEach(e => {
            if (e.startDate && e.endDate) {
                try {
                    const start = new Date(e.startDate);
                    let end = e.endDate === 'Present' || e.endDate === 'Current' ? new Date() : new Date(e.endDate);
                    if (!isNaN(start) && !isNaN(end)) {
                        totalMonths += Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30));
                    }
                } catch (ex) {}
            }
        });
        // Fallback: count entries * 1.5 years average
        if (totalMonths === 0 && cv.data.workExperience.length > 0) {
            return cv.data.workExperience.length * 2;
        }
        return Math.round(totalMonths / 12);
    },

    getCVEducationLevel(cv) {
        if (!cv || !cv.data || !cv.data.education || cv.data.education.length === 0) return null;
        const profile = Storage.getProfile();
        const eduText = cv.data.education.map(e => `${e.degree || ''} ${e.field || ''}`).join(' ').toLowerCase();
        let maxLevel = 0, label = null;
        for (const e of this.EDUCATION_LEVELS) {
            for (const kw of e.keywords) {
                if (eduText.includes(kw) && e.level > maxLevel) { maxLevel = e.level; label = e.label; }
            }
        }
        if (maxLevel === 0) return { level: 3, label: 'Bachelor\'s (assumed)' };
        return { level: maxLevel, label };
    },

    getCVCertifications(cv) {
        if (!cv || !cv.data || !cv.data.certifications) return [];
        return cv.data.certifications.map(c => (c.name || '').toLowerCase()).filter(Boolean);
    },

    // ===== MATCHING =====
    keywordMatch(cvText, jobKeywords) {
        if (!jobKeywords || jobKeywords.length === 0) return { score: 0, matched: [], missing: [] };
        const cvLower = cvText.toLowerCase();
        const matched = jobKeywords.filter(k => cvLower.includes(k));
        const missing = jobKeywords.filter(k => !cvLower.includes(k));
        return { score: Math.round((matched.length / jobKeywords.length) * 100), matched, missing };
    },

    skillsMatch(cvSkills, jobSkills) {
        if (!jobSkills || jobSkills.length === 0) return { score: 0, matched: [], missing: [] };
        const matched = jobSkills.filter(s => cvSkills.some(cs => cs.includes(s) || s.includes(cs)));
        const missing = jobSkills.filter(s => !cvSkills.some(cs => cs.includes(s) || s.includes(cs)));
        return { score: Math.round((matched.length / jobSkills.length) * 100), matched, missing };
    },

    experienceMatch(cvYears, requiredYears) {
        if (!requiredYears) return { score: 100, cvYears, requiredYears: 0, note: 'No specific experience requirement' };
        if (cvYears >= requiredYears) return { score: 100, cvYears, requiredYears, note: `Meets ${requiredYears}+ year requirement` };
        const score = Math.round((cvYears / requiredYears) * 100);
        return { score, cvYears, requiredYears, note: `${cvYears} of ${requiredYears} required years` };
    },

    educationMatch(cvEdu, reqEdu) {
        if (!reqEdu) return { score: 100, note: 'No specific education requirement' };
        if (!cvEdu) return { score: 0, note: 'No education information in CV' };
        if (cvEdu.level >= reqEdu.level) return { score: 100, cvLevel: cvEdu.label, reqLevel: reqEdu.label, note: `Meets ${reqEdu.label} requirement` };
        const diff = reqEdu.level - cvEdu.level;
        const score = Math.max(20, 100 - diff * 30);
        return { score, cvLevel: cvEdu.label, reqLevel: reqEdu.label, note: `${cvEdu.label} vs required ${reqEdu.label}` };
    },

    certificationMatch(cvCerts, jobCerts) {
        if (!jobCerts || jobCerts.length === 0) return { score: 100, matched: [], missing: [], note: 'No specific certification requirement' };
        const matched = jobCerts.filter(c => cvCerts.some(cc => cc.includes(c) || c.includes(cc)));
        const missing = jobCerts.filter(c => !cvCerts.some(cc => cc.includes(c) || c.includes(cc)));
        return { score: Math.round((matched.length / jobCerts.length) * 100), matched, missing, note: `${matched.length} of ${jobCerts.length} required certifications` };
    },

    // ===== MAIN SCORE CALCULATION =====
    calculateMatchScore(cv, job) {
        if (!cv || !job) return null;
        const jobInfo = job.extracted || this.extractJobInfo(job.description);
        const cvText = this.getCVText(cv);
        const cvSkills = this.getCVSkills(cv);
        
        const kw = this.keywordMatch(cvText, jobInfo.keywords);
        const sk = this.skillsMatch(cvSkills, jobInfo.allSkills);
        const exp = this.experienceMatch(this.getCVExperienceYears(cv), jobInfo.requiredExperience);
        const edu = this.educationMatch(this.getCVEducationLevel(cv), jobInfo.educationLevel);
        const cert = this.certificationMatch(this.getCVCertifications(cv), jobInfo.certifications);
        const ats = this.atsFormattingScore(cv);

        const weights = { keyword: 0.20, skills: 0.25, experience: 0.20, education: 0.15, certification: 0.10, ats: 0.10 };
        const overall = Math.round(
            kw.score * weights.keyword + sk.score * weights.skills + exp.score * weights.experience +
            edu.score * weights.education + cert.score * weights.certification + ats.score * weights.ats
        );

        return {
            overall,
            keyword: kw,
            skills: sk,
            experience: exp,
            education: edu,
            certification: cert,
            atsFormatting: ats,
            jobInfo,
            weights,
        };
    },

    // ===== ATS FORMATTING CHECK =====
    atsFormattingScore(cv) {
        if (!cv || !cv.data) return { score: 0, checks: [] };
        const d = cv.data;
        const checks = [];
        let score = 0;

        // Contact info
        const p = d.personalInfo || {};
        const contactFields = ['fullName', 'email', 'phone', 'location'];
        const contactPresent = contactFields.filter(f => p[f] && p[f].trim());
        if (contactPresent.length >= 3) { checks.push({ name: 'Contact Information', status: 'pass', detail: `${contactPresent.length} of 4 contact fields present` }); score += 15; }
        else if (contactPresent.length > 0) { checks.push({ name: 'Contact Information', status: 'warning', detail: `Only ${contactPresent.length} of 4 contact fields present` }); score += 8; }
        else { checks.push({ name: 'Contact Information', status: 'fail', detail: 'No contact information found' }); }

        // Summary
        if (d.summary && d.summary.split(/\s+/).length >= 30) { checks.push({ name: 'Professional Summary', status: 'pass', detail: `${d.summary.split(/\s+/).length} words` }); score += 15; }
        else if (d.summary) { checks.push({ name: 'Professional Summary', status: 'warning', detail: `Only ${d.summary.split(/\s+/).length} words (recommend 30+)` }); score += 8; }
        else { checks.push({ name: 'Professional Summary', status: 'fail', detail: 'No professional summary' }); }

        // Work experience
        const weCount = (d.workExperience || []).length;
        if (weCount >= 2) { checks.push({ name: 'Work Experience', status: 'pass', detail: `${weCount} entries` }); score += 15; }
        else if (weCount === 1) { checks.push({ name: 'Work Experience', status: 'warning', detail: 'Only 1 entry' }); score += 8; }
        else { checks.push({ name: 'Work Experience', status: 'fail', detail: 'No work experience entries' }); }

        // Education
        const eduCount = (d.education || []).length;
        if (eduCount >= 1) { checks.push({ name: 'Education', status: 'pass', detail: `${eduCount} entries` }); score += 10; }
        else { checks.push({ name: 'Education', status: 'warning', detail: 'No education entries' }); }

        // Skills
        const skillCount = (d.skills || []).length;
        if (skillCount >= 8) { checks.push({ name: 'Skills Section', status: 'pass', detail: `${skillCount} skills listed` }); score += 15; }
        else if (skillCount >= 3) { checks.push({ name: 'Skills Section', status: 'warning', detail: `Only ${skillCount} skills (recommend 8+)` }); score += 8; }
        else { checks.push({ name: 'Skills Section', status: 'fail', detail: 'Insufficient skills listed' }); }

        // Template ATS-friendliness
        if (cv.template === 'ats') { checks.push({ name: 'Template Format', status: 'pass', detail: 'ATS-optimized template (single column, no graphics)' }); score += 10; }
        else if (cv.template === 'executive' || cv.template === 'finance') { checks.push({ name: 'Template Format', status: 'warning', detail: 'This template may use formatting that some ATS struggle with. Consider ATS Minimal for maximum compatibility.' }); score += 5; }
        else { checks.push({ name: 'Template Format', status: 'pass', detail: 'Standard template format' }); score += 8; }

        // Standard section names
        const hasStandard = (d.workExperience && d.workExperience.length > 0) && (d.education && d.education.length > 0) && (d.skills && d.skills.length > 0);
        if (hasStandard) { checks.push({ name: 'Standard Section Names', status: 'pass', detail: 'Experience, Education, Skills sections present' }); score += 10; }
        else { checks.push({ name: 'Standard Section Names', status: 'warning', detail: 'Some standard sections missing' }); score += 5; }

        // No tables/images (always true for our text-based CVs)
        checks.push({ name: 'No Tables/Images', status: 'pass', detail: 'No tables or images detected' }); score += 10;

        return { score: Math.min(100, score), checks };
    },

    // ===== EXPLANATIONS =====
    getScoreExplanation(scores) {
        if (!scores) return '';
        let html = '<div style="font-size:0.8125rem;color:var(--text-light);line-height:1.6">';
        html += `<p><strong>Overall Match: ${scores.overall}%</strong></p>`;
        html += `<p>This score is a weighted average:</p>`;
        html += `<ul style="padding-left:16px;margin-top:4px">`;
        html += `<li>Keyword Match (20%): ${scores.keyword.score}% — ${scores.keyword.matched.length} of ${scores.keyword.matched.length + scores.keyword.missing.length} keywords found in your CV</li>`;
        html += `<li>Skills Match (25%): ${scores.skills.score}% — ${scores.skills.matched.length} of ${scores.skills.matched.length + scores.skills.missing.length} required skills matched</li>`;
        html += `<li>Experience Match (20%): ${scores.experience.score}% — ${scores.experience.note}</li>`;
        html += `<li>Education Match (15%): ${scores.education.score}% — ${scores.education.note}</li>`;
        html += `<li>Certification Match (10%): ${scores.certification.score}% — ${scores.certification.note}</li>`;
        html += `<li>ATS Formatting (10%): ${scores.atsFormatting.score}% — Based on template and content structure</li>`;
        html += `</ul>`;
        html += `<p style="margin-top:8px;font-style:italic">This score indicates how well your CV aligns with the job requirements. It is not a guarantee of getting an interview.</p>`;
        html += `</div>`;
        return html;
    },
};
