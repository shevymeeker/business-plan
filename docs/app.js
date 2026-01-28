// ===============================================
// Business Plan Builder - Modernized Application
// Multi-Project Support, Offline-First, PWA
// ===============================================

class BusinessPlanBuilder {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.saveTimeout = null;
        this.data = {};
        this.phases = [];
        this.currentProjectId = null;
        this.projects = {};
        this.deferredPrompt = null;
        this.clipboard = null;

        this.init();
    }

    // ===============================================
    // Initialization
    // ===============================================

    init() {
        this.loadProjects();
        this.initCurrentProject();
        this.setupEventListeners();
        this.setupAutoSave();
        this.initializePhases();
        this.updateCalculations();
        this.updateUI();
        this.setupPWA();
        this.setupOfflineDetection();
        this.updateProjectName();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());

        // Preview and Print
        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());
        document.getElementById('back-to-edit-btn').addEventListener('click', () => this.hidePreview());
        document.getElementById('print-btn').addEventListener('click', () => this.print());
        document.getElementById('print-preview-btn').addEventListener('click', () => this.print());
        document.getElementById('edit-mode-btn').addEventListener('click', () => this.hidePreview());

        // Menu System
        document.getElementById('menu-toggle').addEventListener('click', () => this.toggleMenu());
        document.getElementById('close-menu').addEventListener('click', () => this.closeMenu());
        document.getElementById('menu-overlay').addEventListener('click', () => this.closeMenu());

        // Project Management
        document.getElementById('new-project-btn').addEventListener('click', () => this.createNewProject());
        document.getElementById('switch-project-btn').addEventListener('click', () => this.showProjectSwitcher());
        document.getElementById('rename-project-btn').addEventListener('click', () => this.showRenameModal());
        document.getElementById('duplicate-project-btn').addEventListener('click', () => this.duplicateProject());

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => {
            this.closeMenu();
            setTimeout(() => this.exportData(), 300);
        });
        document.getElementById('import-btn').addEventListener('click', () => {
            this.closeMenu();
            setTimeout(() => document.getElementById('import-file').click(), 300);
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));

        // Copy/Paste Data
        document.getElementById('copy-data-btn').addEventListener('click', () => this.copyData());
        document.getElementById('paste-data-btn').addEventListener('click', () => this.pasteData());

        // Modals
        document.getElementById('close-project-modal').addEventListener('click', () => this.closeProjectModal());
        document.getElementById('close-rename-modal').addEventListener('click', () => this.closeRenameModal());
        document.getElementById('close-delete-modal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancel-rename').addEventListener('click', () => this.closeRenameModal());
        document.getElementById('save-rename').addEventListener('click', () => this.saveRename());
        document.getElementById('cancel-delete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDelete());

        // Phase management
        document.getElementById('add-phase-btn').addEventListener('click', () => this.addPhase());

        // Form inputs - Auto-save
        const inputs = document.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.handleInputChange());
        });

        // Calculation inputs
        const calcInputs = document.querySelectorAll('.calc-input');
        calcInputs.forEach(input => {
            input.addEventListener('input', () => this.updateCalculations());
        });

        // Step navigation via progress bar
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', () => {
                const stepNum = parseInt(step.dataset.step);
                this.goToStep(stepNum);
            });
        });

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('proposalDate').value = today;

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
                this.closeProjectModal();
                this.closeRenameModal();
                this.closeDeleteModal();
            }
        });
    }

    setupAutoSave() {
        // Save every 2 seconds after changes
        this.autoSaveInterval = setInterval(() => {
            if (this.needsSave) {
                this.saveData();
                this.needsSave = false;
            }
        }, 2000);
    }

    handleInputChange() {
        this.needsSave = true;
        this.updateSaveStatus('saving');
    }

    updateSaveStatus(status) {
        const statusEl = document.getElementById('save-status');
        const statusText = statusEl.querySelector('.status-text');

        if (status === 'saving') {
            statusText.textContent = 'Saving...';
            statusEl.classList.add('saving');
        } else {
            statusText.textContent = 'All changes saved';
            statusEl.classList.remove('saving');
        }
    }

    // ===============================================
    // PWA Setup
    // ===============================================

    setupPWA() {
        // Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Install button
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    console.log(`Install prompt outcome: ${outcome}`);
                    this.deferredPrompt = null;
                    this.hideInstallPrompt();
                }
            });
        }

        // Dismiss install
        const dismissInstall = document.getElementById('dismiss-install');
        if (dismissInstall) {
            dismissInstall.addEventListener('click', () => {
                this.hideInstallPrompt();
                localStorage.setItem('installPromptDismissed', 'true');
            });
        }

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            this.hideInstallPrompt();
        });

        // Service Worker Update
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showUpdateNotification();
            });
        }
    }

    showInstallPrompt() {
        const dismissed = localStorage.getItem('installPromptDismissed');
        if (!dismissed && this.deferredPrompt) {
            setTimeout(() => {
                document.getElementById('install-prompt').style.display = 'block';
            }, 3000); // Show after 3 seconds
        }
    }

    hideInstallPrompt() {
        document.getElementById('install-prompt').style.display = 'none';
    }

    showUpdateNotification() {
        const notification = document.getElementById('update-notification');
        notification.style.display = 'flex';

        document.getElementById('update-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }

    setupOfflineDetection() {
        const updateOnlineStatus = () => {
            const indicator = document.getElementById('offline-indicator');
            if (!navigator.onLine) {
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    // ===============================================
    // Menu System
    // ===============================================

    toggleMenu() {
        const menu = document.getElementById('side-menu');
        const overlay = document.getElementById('menu-overlay');
        const toggle = document.getElementById('menu-toggle');

        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        toggle.classList.toggle('active');
    }

    closeMenu() {
        document.getElementById('side-menu').classList.remove('active');
        document.getElementById('menu-overlay').classList.remove('active');
        document.getElementById('menu-toggle').classList.remove('active');
    }

    // ===============================================
    // Project Management
    // ===============================================

    loadProjects() {
        const saved = localStorage.getItem('businessPlanProjects');
        if (saved) {
            this.projects = JSON.parse(saved);
        }

        // Get current project ID
        this.currentProjectId = localStorage.getItem('currentProjectId');

        // If no projects exist or current project doesn't exist, create default
        if (Object.keys(this.projects).length === 0 || !this.currentProjectId || !this.projects[this.currentProjectId]) {
            this.createDefaultProject();
        }
    }

    createDefaultProject() {
        const projectId = this.generateId();
        this.projects[projectId] = {
            id: projectId,
            name: 'My Business Plan',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            data: {}
        };
        this.currentProjectId = projectId;
        this.saveProjects();
    }

    saveProjects() {
        localStorage.setItem('businessPlanProjects', JSON.stringify(this.projects));
        localStorage.setItem('currentProjectId', this.currentProjectId);
    }

    initCurrentProject() {
        if (this.currentProjectId && this.projects[this.currentProjectId]) {
            this.data = this.projects[this.currentProjectId].data || {};
            this.populateForm();
        }
    }

    createNewProject() {
        // Save current project first
        this.saveData();

        const projectId = this.generateId();
        const projectName = `Business Plan ${Object.keys(this.projects).length + 1}`;

        this.projects[projectId] = {
            id: projectId,
            name: projectName,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            data: {}
        };

        this.currentProjectId = projectId;
        this.data = {};
        this.phases = [];

        this.saveProjects();
        this.clearForm();
        this.initializePhases();
        this.updateProjectName();
        this.closeMenu();
        this.goToStep(1);

        // Show notification
        this.showNotification(`Created new project: ${projectName}`);
    }

    duplicateProject() {
        this.saveData();

        const currentProject = this.projects[this.currentProjectId];
        const projectId = this.generateId();
        const projectName = `${currentProject.name} (Copy)`;

        this.projects[projectId] = {
            id: projectId,
            name: projectName,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            data: JSON.parse(JSON.stringify(currentProject.data)) // Deep clone
        };

        this.currentProjectId = projectId;
        this.data = this.projects[projectId].data;

        this.saveProjects();
        this.populateForm();
        this.updateProjectName();
        this.closeMenu();

        this.showNotification(`Duplicated project: ${projectName}`);
    }

    switchProject(projectId) {
        if (projectId === this.currentProjectId) {
            this.closeProjectModal();
            return;
        }

        // Save current project
        this.saveData();

        // Switch to new project
        this.currentProjectId = projectId;
        this.data = this.projects[projectId].data || {};

        localStorage.setItem('currentProjectId', projectId);

        this.populateForm();
        this.updateProjectName();
        this.closeProjectModal();
        this.goToStep(1);

        this.showNotification(`Switched to: ${this.projects[projectId].name}`);
    }

    showProjectSwitcher() {
        this.closeMenu();

        setTimeout(() => {
            const modal = document.getElementById('project-modal');
            const projectList = document.getElementById('project-list');

            projectList.innerHTML = '';

            const projectArray = Object.values(this.projects).sort((a, b) =>
                new Date(b.lastModified) - new Date(a.lastModified)
            );

            if (projectArray.length === 0) {
                projectList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📁</div>
                        <p>No projects yet</p>
                    </div>
                `;
            } else {
                projectArray.forEach(project => {
                    const projectEl = document.createElement('div');
                    projectEl.className = 'project-item';
                    if (project.id === this.currentProjectId) {
                        projectEl.classList.add('active');
                    }

                    const lastModified = new Date(project.lastModified).toLocaleDateString();
                    const created = new Date(project.createdAt).toLocaleDateString();

                    projectEl.innerHTML = `
                        <div class="project-info">
                            <div class="project-name">${this.escapeHtml(project.name)}</div>
                            <div class="project-meta">
                                <span>Modified: ${lastModified}</span>
                                <span>Created: ${created}</span>
                            </div>
                        </div>
                        <div class="project-actions">
                            <button class="project-action-btn delete" data-id="${project.id}" data-name="${this.escapeHtml(project.name)}">
                                🗑️
                            </button>
                        </div>
                    `;

                    // Click to switch
                    projectEl.querySelector('.project-info').addEventListener('click', () => {
                        this.switchProject(project.id);
                    });

                    // Delete button
                    projectEl.querySelector('.delete').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showDeleteModal(project.id, project.name);
                    });

                    projectList.appendChild(projectEl);
                });
            }

            modal.style.display = 'flex';
        }, 300);
    }

    closeProjectModal() {
        document.getElementById('project-modal').style.display = 'none';
    }

    showRenameModal() {
        this.closeMenu();

        setTimeout(() => {
            const modal = document.getElementById('rename-modal');
            const input = document.getElementById('project-name-input');
            const currentProject = this.projects[this.currentProjectId];

            input.value = currentProject.name;
            modal.style.display = 'flex';
            input.focus();
            input.select();
        }, 300);
    }

    closeRenameModal() {
        document.getElementById('rename-modal').style.display = 'none';
    }

    saveRename() {
        const newName = document.getElementById('project-name-input').value.trim();

        if (newName && newName.length > 0) {
            this.projects[this.currentProjectId].name = newName;
            this.projects[this.currentProjectId].lastModified = new Date().toISOString();
            this.saveProjects();
            this.updateProjectName();
            this.closeRenameModal();
            this.showNotification(`Renamed to: ${newName}`);
        }
    }

    showDeleteModal(projectId, projectName) {
        this.closeProjectModal();

        setTimeout(() => {
            const modal = document.getElementById('delete-modal');
            document.getElementById('delete-project-name').textContent = projectName;
            modal.dataset.projectId = projectId;
            modal.style.display = 'flex';
        }, 300);
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').style.display = 'none';
    }

    confirmDelete() {
        const modal = document.getElementById('delete-modal');
        const projectId = modal.dataset.projectId;

        // Can't delete if it's the only project
        if (Object.keys(this.projects).length === 1) {
            alert('Cannot delete the only project. Create a new project first.');
            this.closeDeleteModal();
            return;
        }

        // Can't delete current project without switching first
        if (projectId === this.currentProjectId) {
            // Switch to another project
            const otherProjectId = Object.keys(this.projects).find(id => id !== projectId);
            this.currentProjectId = otherProjectId;
            this.data = this.projects[otherProjectId].data || {};
            this.populateForm();
        }

        delete this.projects[projectId];
        this.saveProjects();
        this.updateProjectName();
        this.closeDeleteModal();

        this.showNotification('Project deleted');
    }

    updateProjectName() {
        if (this.currentProjectId && this.projects[this.currentProjectId]) {
            const name = this.projects[this.currentProjectId].name;
            document.getElementById('current-project-name').textContent = name;
            document.getElementById('header-project-name').textContent = name;
        }
    }

    generateId() {
        return 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ===============================================
    // Copy/Paste Data
    // ===============================================

    async copyData() {
        try {
            const dataStr = JSON.stringify(this.data, null, 2);
            await navigator.clipboard.writeText(dataStr);
            this.clipboard = this.data;
            this.closeMenu();
            this.showNotification('Project data copied to clipboard');
        } catch (err) {
            // Fallback for older browsers
            this.clipboard = this.data;
            this.closeMenu();
            this.showNotification('Project data copied');
        }
    }

    async pasteData() {
        try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text);
            this.data = data;
            this.populateForm();
            this.handleInputChange();
            this.closeMenu();
            this.showNotification('Project data pasted');
        } catch (err) {
            if (this.clipboard) {
                this.data = JSON.parse(JSON.stringify(this.clipboard));
                this.populateForm();
                this.handleInputChange();
                this.closeMenu();
                this.showNotification('Project data pasted');
            } else {
                alert('No data to paste. Copy data from another project first.');
            }
        }
    }

    // ===============================================
    // Navigation
    // ===============================================

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateUI();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    goToStep(stepNum) {
        if (stepNum >= 1 && stepNum <= this.totalSteps) {
            this.currentStep = stepNum;
            this.updateUI();
        }
    }

    updateUI() {
        // Update wizard steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`.wizard-step[data-step="${this.currentStep}"]`).classList.add('active');

        // Update progress steps
        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');

            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update navigation buttons
        document.getElementById('prev-btn').disabled = this.currentStep === 1;

        const nextBtn = document.getElementById('next-btn');
        if (this.currentStep === this.totalSteps) {
            nextBtn.textContent = 'Finish';
            nextBtn.style.display = 'none';
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.style.display = 'block';
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===============================================
    // Data Management
    // ===============================================

    saveData() {
        const data = {
            // Cover Page
            projectTitle: document.getElementById('projectTitle').value,
            preparedFor: document.getElementById('preparedFor').value,
            preparedBy: document.getElementById('preparedBy').value,
            proposalDate: document.getElementById('proposalDate').value,
            proposalNumber: document.getElementById('proposalNumber').value,
            companyName: document.getElementById('companyName').value,

            // Objectives
            objective: document.getElementById('objective').value,
            financialObjective: document.getElementById('financialObjective').value,

            // Goals
            shortTermGoals: document.getElementById('shortTermGoals').value,
            mediumTermGoals: document.getElementById('mediumTermGoals').value,
            longTermGoals: document.getElementById('longTermGoals').value,

            // Solution
            developmentStrategy: document.getElementById('developmentStrategy').value,
            phases: this.getPhases(),
            riskMitigation: document.getElementById('riskMitigation').value,
            marketDifferentiation: document.getElementById('marketDifferentiation').value,

            // Project Outline
            propertyLocation: document.getElementById('propertyLocation').value,
            propertySize: document.getElementById('propertySize').value,
            totalLots: document.getElementById('totalLots').value,
            currentStatus: document.getElementById('currentStatus').value,
            acquisitionCost: document.getElementById('acquisitionCost').value,

            // Budget
            landAcquisition: document.getElementById('landAcquisition').value,
            infrastructureDev: document.getElementById('infrastructureDev').value,
            numberOfInvestors: document.getElementById('numberOfInvestors').value,
            totalLotSales: document.getElementById('totalLotSales').value,
            marketingExpenses: document.getElementById('marketingExpenses').value,
            propertyTaxes: document.getElementById('propertyTaxes').value,
            salesCommission: document.getElementById('salesCommission').value,
            legalAccounting: document.getElementById('legalAccounting').value,
            maintenanceExpenses: document.getElementById('maintenanceExpenses').value,
            projectYears: document.getElementById('projectYears').value,

            // Metadata
            lastSaved: new Date().toISOString()
        };

        this.data = data;

        // Save to current project
        if (this.currentProjectId && this.projects[this.currentProjectId]) {
            this.projects[this.currentProjectId].data = data;
            this.projects[this.currentProjectId].lastModified = new Date().toISOString();
            this.saveProjects();
        }

        this.updateSaveStatus('saved');
    }

    populateForm() {
        // Populate all form fields from saved data
        Object.keys(this.data).forEach(key => {
            const element = document.getElementById(key);
            if (element && key !== 'phases') {
                element.value = this.data[key] || '';
            }
        });

        // Populate phases
        if (this.data.phases && this.data.phases.length > 0) {
            this.phases = this.data.phases;
            this.renderPhases();
        }

        this.updateCalculations();
    }

    clearForm() {
        // Clear all form fields
        document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.value = '';
        });

        // Set default date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('proposalDate').value = today;
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const projectName = this.projects[this.currentProjectId].name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const fileName = `${projectName}-${new Date().toISOString().split('T')[0]}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`Exported: ${fileName}`);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Create a new project with imported data
                const projectId = this.generateId();
                const projectName = data.projectTitle || 'Imported Project';

                this.projects[projectId] = {
                    id: projectId,
                    name: projectName,
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    data: data
                };

                this.currentProjectId = projectId;
                this.data = data;

                this.saveProjects();
                this.populateForm();
                this.updateProjectName();

                this.showNotification(`Imported: ${projectName}`);
            } catch (error) {
                alert('Error importing file. Please make sure it\'s a valid export file.');
                console.error(error);
            }
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }

    // ===============================================
    // Phase Management
    // ===============================================

    initializePhases() {
        if (this.phases.length === 0) {
            this.addPhase();
        } else {
            this.renderPhases();
        }
    }

    addPhase() {
        const phaseNum = this.phases.length + 1;
        this.phases.push({
            id: Date.now(),
            title: `Phase ${phaseNum}`,
            description: '',
            lots: '',
            timeline: ''
        });
        this.renderPhases();
        this.handleInputChange();
    }

    removePhase(id) {
        this.phases = this.phases.filter(phase => phase.id !== id);
        this.renderPhases();
        this.handleInputChange();
    }

    getPhases() {
        const phaseElements = document.querySelectorAll('.phase-item');
        const phases = [];

        phaseElements.forEach(el => {
            const id = parseInt(el.dataset.phaseId);
            phases.push({
                id: id,
                title: el.querySelector('.phase-title-input').value,
                description: el.querySelector('.phase-description').value,
                lots: el.querySelector('.phase-lots').value,
                timeline: el.querySelector('.phase-timeline').value
            });
        });

        return phases;
    }

    renderPhases() {
        const container = document.getElementById('phases-container');
        container.innerHTML = '';

        this.phases.forEach((phase, index) => {
            const phaseEl = document.createElement('div');
            phaseEl.className = 'phase-item';
            phaseEl.dataset.phaseId = phase.id;

            phaseEl.innerHTML = `
                <div class="phase-header">
                    <input type="text" class="form-input phase-title-input" value="${phase.title}" placeholder="Phase Title">
                    <button type="button" class="remove-phase-btn" onclick="app.removePhase(${phase.id})">Remove</button>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-textarea phase-description" rows="3" placeholder="Describe this phase...">${phase.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Number of Lots</label>
                        <input type="text" class="form-input phase-lots" value="${phase.lots || ''}" placeholder="e.g., 40+ lots">
                    </div>
                    <div class="form-group">
                        <label>Timeline</label>
                        <input type="text" class="form-input phase-timeline" value="${phase.timeline || ''}" placeholder="e.g., Months 1-12">
                    </div>
                </div>
            `;

            container.appendChild(phaseEl);

            // Add event listeners to new phase inputs
            phaseEl.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', () => this.handleInputChange());
            });
        });
    }

    // ===============================================
    // Calculations
    // ===============================================

    updateCalculations() {
        const landAcq = parseFloat(document.getElementById('landAcquisition').value) || 0;
        const infraDev = parseFloat(document.getElementById('infrastructureDev').value) || 0;
        const numInvestors = parseInt(document.getElementById('numberOfInvestors').value) || 1;
        const totalLotSales = parseFloat(document.getElementById('totalLotSales').value) || 0;
        const marketingExp = parseFloat(document.getElementById('marketingExpenses').value) || 0;
        const propTaxes = parseFloat(document.getElementById('propertyTaxes').value) || 0;
        const salesCommPct = parseFloat(document.getElementById('salesCommission').value) || 0;
        const legalAcct = parseFloat(document.getElementById('legalAccounting').value) || 0;
        const maintenance = parseFloat(document.getElementById('maintenanceExpenses').value) || 0;
        const projectYears = parseInt(document.getElementById('projectYears').value) || 1;

        // Capital Requirements
        const totalCapital = landAcq + infraDev;

        // Investment per investor
        const investmentPerInvestor = totalCapital / numInvestors;
        document.getElementById('investmentPerInvestor').value = Math.round(investmentPerInvestor);

        // Gross Profit
        const grossProfit = totalLotSales - totalCapital;
        document.getElementById('grossProfit').textContent = this.formatCurrency(grossProfit);

        // ROI
        const roi = totalCapital > 0 ? (grossProfit / totalCapital * 100) : 0;
        document.getElementById('roi').textContent = this.formatPercent(roi);

        // Gross Profit per Investor
        const grossProfitPerInvestor = grossProfit / numInvestors;
        document.getElementById('grossProfitPerInvestor').textContent = this.formatCurrency(grossProfitPerInvestor);

        // Operating Expenses
        const salesCommissionTotal = totalLotSales * (salesCommPct / 100);
        const annualOperating = marketingExp + propTaxes + legalAcct + maintenance;
        const totalAnnualOperating = annualOperating * projectYears;
        const totalOperating = totalAnnualOperating + salesCommissionTotal;

        document.getElementById('totalCommission').textContent = this.formatCurrency(salesCommissionTotal);
        document.getElementById('totalOperating').textContent = this.formatCurrency(totalOperating);

        // Net Profit
        const netProfit = grossProfit - totalOperating;
        document.getElementById('netProfit').textContent = this.formatCurrency(netProfit);

        // Net Profit per Investor
        const netProfitPerInvestor = netProfit / numInvestors;
        document.getElementById('netProfitPerInvestor').textContent = this.formatCurrency(netProfitPerInvestor);

        // Net ROI per Investor
        const netRoi = investmentPerInvestor > 0 ? (netProfitPerInvestor / investmentPerInvestor * 100) : 0;
        document.getElementById('netRoi').textContent = this.formatPercent(netRoi);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatPercent(percent) {
        return `${percent.toFixed(1)}%`;
    }

    // ===============================================
    // Preview & Print
    // ===============================================

    showPreview() {
        this.saveData();
        this.generatePreview();
        document.getElementById('editor-mode').style.display = 'none';
        document.getElementById('preview-mode').style.display = 'block';
        window.scrollTo(0, 0);
    }

    hidePreview() {
        document.getElementById('preview-mode').style.display = 'none';
        document.getElementById('editor-mode').style.display = 'block';
        window.scrollTo(0, 0);
    }

    generatePreview() {
        const printContent = document.getElementById('print-content');
        const data = this.data;

        this.updateCalculations();

        const calcs = {
            grossProfit: document.getElementById('grossProfit').textContent,
            roi: document.getElementById('roi').textContent,
            grossProfitPerInvestor: document.getElementById('grossProfitPerInvestor').textContent,
            investmentPerInvestor: document.getElementById('investmentPerInvestor').value,
            totalCommission: document.getElementById('totalCommission').textContent,
            totalOperating: document.getElementById('totalOperating').textContent,
            netProfit: document.getElementById('netProfit').textContent,
            netProfitPerInvestor: document.getElementById('netProfitPerInvestor').textContent,
            netRoi: document.getElementById('netRoi').textContent
        };

        printContent.innerHTML = `
            <!-- Cover Page -->
            <div class="print-cover print-section">
                <h1>${data.projectTitle || 'Project Proposal'}</h1>
                <div class="company-name">${data.companyName || 'COMPANY NAME'}</div>
                <div class="cover-meta">
                    <div class="cover-meta-row">
                        <span><strong>Prepared for:</strong> ${data.preparedFor || ''}</span>
                        <span><strong>Prepared by:</strong> ${data.preparedBy || ''}</span>
                    </div>
                    <div class="cover-meta-row">
                        <span><strong>Date:</strong> ${this.formatDate(data.proposalDate)}</span>
                        <span><strong>Proposal number:</strong> ${data.proposalNumber || ''}</span>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="print-content">
                ${this.generateObjectiveSection(data)}
                ${this.generateGoalsSection(data)}
                ${this.generateSolutionSection(data)}
                ${this.generateProjectOutlineSection(data)}
                ${this.generateBudgetSection(data, calcs)}
            </div>
        `;
    }

    generateObjectiveSection(data) {
        if (!data.objective && !data.financialObjective) return '';

        return `
            <div class="print-section">
                <h2>Objective</h2>
                ${data.objective ? `<div class="print-objective">${this.nl2br(data.objective)}</div>` : ''}
                ${data.financialObjective ? `
                    <h3>Financial Objective</h3>
                    <div class="print-financial-objective">${this.nl2br(data.financialObjective)}</div>
                ` : ''}
            </div>
        `;
    }

    generateGoalsSection(data) {
        if (!data.shortTermGoals && !data.mediumTermGoals && !data.longTermGoals) return '';

        return `
            <div class="print-section print-page-break">
                <h2>Goals</h2>
                ${data.shortTermGoals ? `
                    <div class="print-goals-section">
                        <h3>Short-term goals (1-2 years)</h3>
                        <ul class="print-list">
                            ${this.textToList(data.shortTermGoals)}
                        </ul>
                    </div>
                ` : ''}
                ${data.mediumTermGoals ? `
                    <div class="print-goals-section">
                        <h3>Medium-term goals (Years 2-3)</h3>
                        <ul class="print-list">
                            ${this.textToList(data.mediumTermGoals)}
                        </ul>
                    </div>
                ` : ''}
                ${data.longTermGoals ? `
                    <div class="print-goals-section">
                        <h3>Long-term goals (Years 3-5)</h3>
                        <ul class="print-list">
                            ${this.textToList(data.longTermGoals)}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    generateSolutionSection(data) {
        if (!data.developmentStrategy && (!data.phases || data.phases.length === 0) &&
            !data.riskMitigation && !data.marketDifferentiation) return '';

        return `
            <div class="print-section print-page-break">
                <h2>Solution</h2>
                ${data.developmentStrategy ? `
                    <h3>Development Strategy</h3>
                    <p>${this.nl2br(data.developmentStrategy)}</p>
                ` : ''}

                ${data.phases && data.phases.length > 0 ? `
                    <h3>Phased Development</h3>
                    ${data.phases.map(phase => `
                        <div class="print-phase">
                            <h4>${phase.title}${phase.lots ? ': ' + phase.lots : ''}</h4>
                            ${phase.description ? `<p>${this.nl2br(phase.description)}</p>` : ''}
                            ${phase.timeline ? `<p><strong>Timeline:</strong> ${phase.timeline}</p>` : ''}
                        </div>
                    `).join('')}
                ` : ''}

                ${data.riskMitigation ? `
                    <h3>Risk Mitigation</h3>
                    <ul class="print-list">
                        ${this.textToList(data.riskMitigation)}
                    </ul>
                ` : ''}

                ${data.marketDifferentiation ? `
                    <h3>Market Differentiation</h3>
                    <ul class="print-list">
                        ${this.textToList(data.marketDifferentiation)}
                    </ul>
                ` : ''}
            </div>
        `;
    }

    generateProjectOutlineSection(data) {
        if (!data.propertyLocation && !data.propertySize && !data.totalLots &&
            !data.currentStatus && !data.acquisitionCost) return '';

        return `
            <div class="print-section print-page-break">
                <h2>Project Outline</h2>
                <h3>Property Details</h3>
                <div class="print-property-grid">
                    ${data.propertyLocation ? `
                        <div class="print-property-item">
                            <strong>Location</strong>
                            ${data.propertyLocation}
                        </div>
                    ` : ''}
                    ${data.propertySize ? `
                        <div class="print-property-item">
                            <strong>Size</strong>
                            ${data.propertySize} acres
                        </div>
                    ` : ''}
                    ${data.totalLots ? `
                        <div class="print-property-item">
                            <strong>Buildable Lots</strong>
                            ${data.totalLots} total
                        </div>
                    ` : ''}
                    ${data.currentStatus ? `
                        <div class="print-property-item">
                            <strong>Current Status</strong>
                            ${data.currentStatus}
                        </div>
                    ` : ''}
                    ${data.acquisitionCost ? `
                        <div class="print-property-item">
                            <strong>Acquisition Cost</strong>
                            ${this.formatCurrency(parseFloat(data.acquisitionCost))}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generateBudgetSection(data, calcs) {
        return `
            <div class="print-section print-page-break">
                <h2>Budget</h2>

                <h3>Capital Requirements</h3>
                <table class="print-budget-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="amount">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Land Acquisition</td>
                            <td class="amount">${this.formatCurrency(parseFloat(data.landAcquisition || 0))}</td>
                        </tr>
                        <tr>
                            <td>Infrastructure Development</td>
                            <td class="amount">${this.formatCurrency(parseFloat(data.infrastructureDev || 0))}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Capital Required</strong></td>
                            <td class="amount"><strong>${this.formatCurrency(parseFloat(data.landAcquisition || 0) + parseFloat(data.infrastructureDev || 0))}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <h3>Investment Structure</h3>
                <p><strong>Number of Investors:</strong> ${data.numberOfInvestors || 'N/A'}</p>
                <p><strong>Investment per Investor:</strong> ${this.formatCurrency(parseFloat(calcs.investmentPerInvestor || 0))}</p>
                <p><strong>Ownership Structure:</strong> Equal shares (${data.numberOfInvestors ? (100 / data.numberOfInvestors).toFixed(1) : 0}% each)</p>

                <div class="print-financial-summary">
                    <h3>Financial Projections</h3>
                    <div class="print-financial-row">
                        <span class="label">Total Lot Sales Revenue</span>
                        <span class="value">${this.formatCurrency(parseFloat(data.totalLotSales || 0))}</span>
                    </div>
                    <div class="print-financial-row">
                        <span class="label">Gross Profit</span>
                        <span class="value">${calcs.grossProfit}</span>
                    </div>
                    <div class="print-financial-row">
                        <span class="label">ROI</span>
                        <span class="value">${calcs.roi}</span>
                    </div>
                    <div class="print-financial-row highlight">
                        <span class="label">Gross Profit per Investor</span>
                        <span class="value">${calcs.grossProfitPerInvestor}</span>
                    </div>
                </div>

                <h3>Operating Expenses</h3>
                <table class="print-budget-table">
                    <tbody>
                        <tr>
                            <td>Marketing & Advertising (${data.projectYears || 0} years)</td>
                            <td class="amount">${this.formatCurrency((parseFloat(data.marketingExpenses || 0)) * (parseInt(data.projectYears || 1)))}</td>
                        </tr>
                        <tr>
                            <td>Property Taxes (${data.projectYears || 0} years)</td>
                            <td class="amount">${this.formatCurrency((parseFloat(data.propertyTaxes || 0)) * (parseInt(data.projectYears || 1)))}</td>
                        </tr>
                        <tr>
                            <td>Sales Commission (${data.salesCommission || 0}%)</td>
                            <td class="amount">${calcs.totalCommission}</td>
                        </tr>
                        <tr>
                            <td>Legal & Accounting (${data.projectYears || 0} years)</td>
                            <td class="amount">${this.formatCurrency((parseFloat(data.legalAccounting || 0)) * (parseInt(data.projectYears || 1)))}</td>
                        </tr>
                        <tr>
                            <td>Maintenance (${data.projectYears || 0} years)</td>
                            <td class="amount">${this.formatCurrency((parseFloat(data.maintenanceExpenses || 0)) * (parseInt(data.projectYears || 1)))}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Operating Expenses</strong></td>
                            <td class="amount"><strong>${calcs.totalOperating}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div class="print-financial-summary">
                    <h3>Net Profits After Expenses</h3>
                    <div class="print-financial-row highlight">
                        <span class="label">Net Profit After Expenses</span>
                        <span class="value">${calcs.netProfit}</span>
                    </div>
                    <div class="print-financial-row highlight">
                        <span class="label">Net Profit per Investor</span>
                        <span class="value">${calcs.netProfitPerInvestor}</span>
                    </div>
                    <div class="print-financial-row highlight">
                        <span class="label">Net ROI per Investor</span>
                        <span class="value">${calcs.netRoi}</span>
                    </div>
                </div>
            </div>
        `;
    }

    print() {
        window.print();
    }

    // ===============================================
    // Utility Functions
    // ===============================================

    textToList(text) {
        if (!text) return '';
        return text.split('\n')
            .filter(line => line.trim())
            .map(line => `<li>${this.escapeHtml(line.trim())}</li>`)
            .join('');
    }

    nl2br(text) {
        if (!text) return '';
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showNotification(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--gray-900);
            color: var(--white);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            animation: slideUp 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// ===============================================
// Service Worker Registration (PWA)
// ===============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New version available');
                        }
                    });
                });
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BusinessPlanBuilder();
});
