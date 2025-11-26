// ===============================================
// Business Plan Builder - Main Application
// ===============================================

class BusinessPlanBuilder {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 7;
        this.saveTimeout = null;
        this.data = {};
        this.phases = [];

        this.init();
    }

    // ===============================================
    // Initialization
    // ===============================================

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupAutoSave();
        this.initializePhases();
        this.updateCalculations();
        this.updateUI();
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

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));

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
        if (status === 'saving') {
            statusEl.textContent = 'Saving...';
            statusEl.className = 'save-status saving';
        } else {
            statusEl.textContent = 'All changes saved';
            statusEl.className = 'save-status';
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
            nextBtn.style.display = 'none'; // Hide on review page
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.style.display = 'block';
        }

        // Scroll to top
        window.scrollTo(0, 0);
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

        localStorage.setItem('businessPlanData', JSON.stringify(data));
        this.data = data;
        this.updateSaveStatus('saved');
    }

    loadData() {
        const savedData = localStorage.getItem('businessPlanData');
        if (savedData) {
            this.data = JSON.parse(savedData);
            this.populateForm();
        }
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

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `business-plan-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Data exported successfully! You can import this file on another device.');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.data = data;
                localStorage.setItem('businessPlanData', JSON.stringify(data));
                this.populateForm();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing file. Please make sure it\'s a valid export file.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    // ===============================================
    // Phase Management
    // ===============================================

    initializePhases() {
        if (this.phases.length === 0) {
            // Add default phase
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
        this.saveData(); // Save before preview
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

        // Update calculations one more time
        this.updateCalculations();

        // Get current calculated values
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
}

// ===============================================
// Service Worker Registration (PWA)
// ===============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
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
