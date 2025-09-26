// Dashboard Trading - Version Complète et Corrigée
console.log('Loading complete dashboard script...');

class CompleteTradingDashboard {
    constructor() {
        console.log('Creating complete dashboard instance...');
        this.currentUser = 'trader_vip';
        this.currentAccount = 'compte1';
        this.trades = [];
        this.settings = { 
            capital: 1000, 
            riskPerTrade: 2,
            dailyTarget: 1,
            monthlyTarget: 5,
            yearlyTarget: 60
        };
        this.accounts = {
            'compte1': { name: 'Compte Principal', capital: 1000 },
            'compte2': { name: 'Compte Démo', capital: 500 },
            'compte3': { name: 'Compte Swing', capital: 2000 }
        };
        this.currentCalendarDate = new Date();
        this.currentStep = 0;
        this.currentTrade = {};
        this.charts = {};
        this.checklistSteps = [
            {
                title: "✅ 1. Contexte Global",
                question: "Quelle est la tendance Daily et la zone H4 ?",
                key: "contextGlobal",
                education: `<strong>🎯 Objectif :</strong> Comprendre la tendance générale<br><br><strong>📊 Daily :</strong> Haussière/Baissière/Range<br><strong>📊 H4 :</strong> Premium/Discount/Équilibre`,
                options: ["Hausse + Discount", "Baisse + Premium", "Range", "Hausse + Premium", "Baisse + Discount"]
            },
            {
                title: "✅ 2. Zone Institutionnelle",
                question: "Zone institutionnelle identifiée ?",
                key: "zoneInstitutionnelle",
                education: `<strong>🎯 Objectif :</strong> Trouver les zones d'entrée<br><br><strong>🏦 Order Blocks :</strong> Dernière bougie avant impulsion<br><strong>⚡ Fair Value Gaps :</strong> Gaps à combler`,
                options: ["Order Block Valide", "Fair Value Gap", "Liquidity Grab", "Aucune Zone"]
            },
            {
                title: "✅ 3. Structure de Marché",
                question: "Structure confirmée ?",
                key: "structureMarche",
                education: `<strong>🎯 Objectif :</strong> Confirmer la direction<br><br><strong>🔄 CHOCH :</strong> Changement de caractère<br><strong>📈 BOS :</strong> Cassure de structure`,
                options: ["CHOCH Confirmé", "BOS Confirmé", "Structure Unclear", "Faux Signal"]
            },
            {
                title: "✅ 4. Timing Killzones",
                question: "Timing optimal ?",
                key: "timingKillzones",
                education: `<strong>🎯 Objectif :</strong> Trader aux bonnes heures<br><br><strong>⏰ Londres :</strong> 8h-11h<br><strong>⏰ New York :</strong> 14h-17h`,
                options: ["Killzone Londres", "Killzone New York", "Overlap", "Hors Killzone"]
            },
            {
                title: "✅ 5. Signal d'Entrée",
                question: "Signal précis confirmé ?",
                key: "signalEntree",
                education: `<strong>🎯 Objectif :</strong> Signal d'exécution<br><br><strong>📍 Pin Bar :</strong> Rejet avec mèche<br><strong>📍 Doji :</strong> Indécision puis direction`,
                options: ["Pin Bar", "Doji", "Engulfing", "Signal Faible"]
            },
            {
                title: "✅ 6. Risk Management",
                question: "R:R optimal ?",
                key: "riskManagement",
                education: `<strong>🎯 Objectif :</strong> Protéger le capital<br><br><strong>🛡️ Stop Loss :</strong> Niveau d'invalidation<br><strong>🎯 Take Profit :</strong> Zone de liquidité`,
                options: ["R:R ≥ 1:3", "R:R = 1:2", "R:R < 1:2", "SL Trop Large"]
            },
            {
                title: "✅ 7. Discipline",
                question: "Plan respecté ?",
                key: "discipline",
                education: `<strong>🎯 Objectif :</strong> Cohérence<br><br><strong>🧠 Discipline :</strong> Suivre le plan<br><strong>📝 Journal :</strong> Documenter`,
                options: ["Plan Respecté", "Discipline OK", "Émotions Contrôlées", "Amélioration Nécessaire"]
            }
        ];
        
        this.loadData();
        this.init();
    }

    init() {
        console.log('Initializing complete dashboard...');
        this.setupEventListeners();
        this.updateStats();
        this.renderTradesTable();
        this.initCalendar();
        this.updateAccountDisplay();
        this.initCharts();
        this.initCorrelationMatrix();
        this.initGauge();
        this.updatePlanProgress();
        console.log('Complete dashboard initialized successfully');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        const setup = () => {
            this.bindButton('newTradeBtn', () => this.startNewTrade());
            this.bindButton('settingsBtn', () => this.showSettings());
            this.bindButton('closeTradeBtn', () => this.showCloseTradeModal());
            this.bindButton('resetBtn', () => this.resetAllData());
            this.bindButton('manualCloseBtn', () => this.showManualCloseModal());
            this.bindButton('exportBtn', () => this.exportToExcel());
            this.bindButton('addAccountBtn', () => this.addNewAccount());
            this.bindButton('deleteAccountBtn', () => this.deleteAccount());
            
            const accountSelect = document.getElementById('accountSelect');
            if (accountSelect) {
                accountSelect.onchange = (e) => this.switchAccount(e.target.value);
            }
            
            this.bindButton('prevMonth', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
                this.renderCalendar();
            });
            this.bindButton('nextMonth', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
                this.renderCalendar();
            });
            
            const closeModal = document.querySelector('.close');
            if (closeModal) {
                closeModal.onclick = () => this.closeModal();
            }
            
            window.onclick = (e) => {
                if (e.target === document.getElementById('tradeModal')) {
                    this.closeModal();
                }
                if (e.target === document.getElementById('fullscreenModal')) {
                    this.closeFullscreen();
                }
            };
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    bindButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.onclick = handler;
            console.log(`✅ ${id} button configured`);
        } else {
            console.warn(`⚠️ ${id} button not found`);
        }
    }

    initCharts() {
        console.log('Initializing charts...');
        this.initPerformanceChart();
        this.initWinRateChart();
        this.initMonthlyChart();
        this.initConfluencesChart();
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        const closedTrades = this.trades.filter(t => t.status === 'closed').sort((a, b) => new Date(a.date) - new Date(b.date));
        let cumulativePnL = 0;
        const data = closedTrades.map(trade => {
            cumulativePnL += parseFloat(trade.pnl || 0);
            return {
                x: trade.date,
                y: cumulativePnL
            };
        });

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Performance Cumulative',
                    data: data,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' },
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    initWinRateChart() {
        const ctx = document.getElementById('winRateChart');
        if (!ctx) return;

        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const wins = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0).length;
        const losses = closedTrades.length - wins;

        if (this.charts.winRate) {
            this.charts.winRate.destroy();
        }

        this.charts.winRate = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Gains', 'Pertes'],
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: ['#4ecdc4', '#ff6b6b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });
    }

    initMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        const monthlyData = {};
        this.trades.filter(t => t.status === 'closed').forEach(trade => {
            const month = new Date(trade.date).toISOString().slice(0, 7);
            if (!monthlyData[month]) monthlyData[month] = 0;
            monthlyData[month] += parseFloat(trade.pnl || 0);
        });

        const labels = Object.keys(monthlyData).sort();
        const data = labels.map(month => monthlyData[month]);

        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'P&L Mensuel',
                    data: data,
                    backgroundColor: data.map(val => val >= 0 ? '#4ecdc4' : '#ff6b6b'),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    initConfluencesChart() {
        const ctx = document.getElementById('confluencesChart');
        if (!ctx) return;

        const confluenceData = {};
        this.trades.forEach(trade => {
            if (trade.confluences) {
                Object.entries(trade.confluences).forEach(([key, value]) => {
                    if (!confluenceData[key]) confluenceData[key] = {};
                    if (!confluenceData[key][value]) confluenceData[key][value] = 0;
                    confluenceData[key][value]++;
                });
            }
        });

        const labels = Object.keys(confluenceData);
        const datasets = [];
        const colors = ['#00d4ff', '#4ecdc4', '#ffc107', '#ff6b6b', '#5b86e5'];

        labels.forEach((confluence, index) => {
            const values = Object.values(confluenceData[confluence] || {});
            datasets.push({
                label: this.getConfluenceName(confluence),
                data: values,
                backgroundColor: colors[index % colors.length],
                borderWidth: 0
            });
        });

        if (this.charts.confluences) {
            this.charts.confluences.destroy();
        }

        this.charts.confluences = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    r: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#ffffff' }
                    }
                }
            }
        });
    }

    initCorrelationMatrix() {
        const container = document.getElementById('correlationMatrix');
        if (!container) return;

        const concepts = [
            'Contexte Global',
            'Zone Institutionnelle', 
            'Structure Marché',
            'Timing Killzones',
            'Signal Entrée',
            'Risk Management',
            'Discipline'
        ];

        const correlationData = [
            [100, 85, 75, 60, 70, 90, 80],
            [85, 100, 80, 70, 85, 75, 70],
            [75, 80, 100, 65, 90, 80, 75],
            [60, 70, 65, 100, 55, 60, 85],
            [70, 85, 90, 55, 100, 75, 70],
            [90, 75, 80, 60, 75, 100, 95],
            [80, 70, 75, 85, 70, 95, 100]
        ];

        let html = '<div class="correlation-grid">';
        
        // En-tête vide
        html += '<div class="correlation-cell header"></div>';
        
        // En-têtes colonnes
        concepts.forEach(concept => {
            html += `<div class="correlation-cell header">${concept.split(' ')[0]}</div>`;
        });

        // Lignes de données
        concepts.forEach((rowConcept, i) => {
            html += `<div class="correlation-cell row-header">${rowConcept}</div>`;
            correlationData[i].forEach((value, j) => {
                const className = value >= 80 ? 'excellent' : 
                                value >= 60 ? 'good' : 
                                value >= 40 ? 'average' : 'poor';
                html += `<div class="correlation-cell data ${className}">${value}%</div>`;
            });
        });

        html += '</div>';
        container.innerHTML = html;
    }

    initGauge() {
        const container = document.getElementById('gainsGauge');
        if (!container) return;

        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        const percentage = ((totalPnL / initialCapital) * 100).toFixed(1);

        // Mise à jour des valeurs
        this.updateElement('gainsValue', `$${totalPnL.toFixed(2)}`);
        this.updateElement('gainsPercent', `${percentage}%`);

        // Animation du gauge
        container.style.background = `conic-gradient(from 0deg, 
            ${totalPnL >= 0 ? '#4ecdc4' : '#ff6b6b'} 0deg ${Math.abs(percentage) * 3.6}deg, 
            rgba(255, 255, 255, 0.1) ${Math.abs(percentage) * 3.6}deg 360deg)`;
    }

    updatePlanProgress() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        
        // Calcul des objectifs
        const monthlyTargetAmount = (initialCapital * this.settings.monthlyTarget / 100);
        const yearlyTargetAmount = (initialCapital * this.settings.yearlyTarget / 100);
        
        // Mise à jour des cibles
        this.updateElement('monthlyTarget', monthlyTargetAmount.toFixed(0));
        this.updateElement('yearlyTarget', yearlyTargetAmount.toFixed(0));
        
        // Calcul des progrès
        const monthProgress = Math.min((totalPnL / monthlyTargetAmount) * 100, 100);
        const yearProgress = Math.min((totalPnL / yearlyTargetAmount) * 100, 100);
        const yearReturn = ((totalPnL / initialCapital) * 100).toFixed(1);
        
        // Mise à jour des barres de progression
        const monthProgressBar = document.getElementById('monthlyProgressBar');
        const yearProgressBar = document.getElementById('yearlyProgressBar');
        
        if (monthProgressBar) {
            monthProgressBar.style.width = `${Math.max(monthProgress, 0)}%`;
            if (monthProgress >= 100) monthProgressBar.classList.add('completed');
        }
        
        if (yearProgressBar) {
            yearProgressBar.style.width = `${Math.max(yearProgress, 0)}%`;
            if (yearProgress >= 100) yearProgressBar.classList.add('completed');
        }
        
        // Mise à jour des textes
        this.updateElement('monthProgress', `${monthProgress.toFixed(1)}%`);
        this.updateElement('yearProgress', `${yearProgress.toFixed(1)}%`);
        this.updateElement('yearReturn', `${yearReturn}%`);
    }

    loadData() {
        try {
            const savedTrades = localStorage.getItem(`trades_${this.currentUser}_${this.currentAccount}`);
            if (savedTrades) {
                this.trades = JSON.parse(savedTrades);
            }
            
            const savedSettings = localStorage.getItem(`settings_${this.currentUser}_${this.currentAccount}`);
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
            }
            
            const savedAccounts = localStorage.getItem(`accounts_${this.currentUser}`);
            if (savedAccounts) {
                this.accounts = JSON.parse(savedAccounts);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem(`trades_${this.currentUser}_${this.currentAccount}`, JSON.stringify(this.trades));
            localStorage.setItem(`settings_${this.currentUser}_${this.currentAccount}`, JSON.stringify(this.settings));
            localStorage.setItem(`accounts_${this.currentUser}`, JSON.stringify(this.accounts));
            localStorage.setItem(`currentAccount_${this.currentUser}`, this.currentAccount);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    updateStats() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const openTrades = this.trades.filter(t => t.status === 'open');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const winRate = closedTrades.length > 0 ? 
            (closedTrades.filter(t => parseFloat(t.pnl || 0) > 0).length / closedTrades.length * 100).toFixed(1) : 0;
        
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        const currentCapital = initialCapital + totalPnL;
        
        this.updateElement('totalTrades', this.trades.length);
        this.updateElement('openTrades', openTrades.length);
        this.updateElement('totalPnL', `$${totalPnL.toFixed(2)}`, totalPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('winRate', `${winRate}%`);
        this.updateElement('capital', `$${currentCapital.toFixed(2)}`, totalPnL >= 0 ? 'positive' : 'negative');
        
        // Mise à jour des graphiques
        this.updateCharts();
        this.initGauge();
        this.updatePlanProgress();
    }

    updateCharts() {
        this.initPerformanceChart();
        this.initWinRateChart();
        this.initMonthlyChart();
        this.initConfluencesChart();
    }

    updateElement(id, text, className = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
            if (className) {
                element.className = className;
            }
        }
    }

    updateAccountDisplay() {
        const accountSelect = document.getElementById('accountSelect');
        if (accountSelect) {
            accountSelect.innerHTML = '';
            Object.keys(this.accounts).forEach(accountId => {
                const option = document.createElement('option');
                option.value = accountId;
                option.textContent = this.accounts[accountId].name;
                if (accountId === this.currentAccount) {
                    option.selected = true;
                }
                accountSelect.appendChild(option);
            });
        }
    }

    startNewTrade() {
        console.log('Starting new trade...');
        this.currentStep = 0;
        this.currentTrade = {
            date: new Date().toISOString().split('T')[0],
            confluences: {},
            comments: {}
        };
        this.showModal();
        this.renderChecklistStep();
    }

    showSettings() {
        console.log('Showing settings...');
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <h2>⚙️ Paramètres</h2>
            <div class="trade-form">
                <div class="form-group">
                    <label>Capital initial ($):</label>
                    <input type="number" id="capitalInput" value="${this.settings.capital}" step="100">
                </div>
                <div class="form-group">
                    <label>Risque par trade (%):</label>
                    <input type="number" id="riskInput" value="${this.settings.riskPerTrade}" step="0.1" min="0.1" max="10">
                </div>
                <h3 style="color: #00d4ff; margin: 20px 0 15px 0;">🎯 Plan de Trading</h3>
                <div class="form-group">
                    <label>Objectif journalier (% du capital):</label>
                    <input type="number" id="dailyTargetInput" value="${this.settings.dailyTarget}" step="0.1" min="0.1">
                </div>
                <div class="form-group">
                    <label>Objectif mensuel (% du capital):</label>
                    <input type="number" id="monthlyTargetInput" value="${this.settings.monthlyTarget}" step="0.5" min="0.5">
                </div>
                <div class="form-group">
                    <label>Objectif annuel (% du capital):</label>
                    <input type="number" id="yearlyTargetInput" value="${this.settings.yearlyTarget}" step="5" min="5">
                </div>
                <div class="form-buttons">
                    <button class="btn-submit" onclick="dashboard.saveSettings()">Sauvegarder</button>
                    <button class="btn-secondary" onclick="dashboard.closeModal()">Annuler</button>
                </div>
            </div>
        `;
        
        this.showModal();
    }

    saveSettings() {
        const capital = parseFloat(document.getElementById('capitalInput')?.value) || 1000;
        const riskPerTrade = parseFloat(document.getElementById('riskInput')?.value) || 2;
        const dailyTarget = parseFloat(document.getElementById('dailyTargetInput')?.value) || 1;
        const monthlyTarget = parseFloat(document.getElementById('monthlyTargetInput')?.value) || 5;
        const yearlyTarget = parseFloat(document.getElementById('yearlyTargetInput')?.value) || 60;
        
        this.settings = { capital, riskPerTrade, dailyTarget, monthlyTarget, yearlyTarget };
        this.accounts[this.currentAccount].capital = capital;
        this.saveData();
        this.updateStats();
        this.updateAccountDisplay();
        this.renderCalendar();
        this.closeModal();
        this.showNotification('Paramètres sauvegardés!');
    }

    renderTradeForm() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        const currentCapital = initialCapital + totalPnL;
        const riskAmount = (currentCapital * this.settings.riskPerTrade / 100).toFixed(2);
        
        const confluencesHtml = Object.keys(this.currentTrade.confluences || {}).length > 0 ? `
            <div class="confluences-summary">
                <h4>🔍 Confluences Analysées:</h4>
                ${Object.entries(this.currentTrade.confluences || {}).map(([key, value]) => 
                    `<span class="confluence-tag">${this.getConfluenceName(key)}: ${value}</span>`
                ).join('')}
            </div>
        ` : '';
        
        modalContent.innerHTML = `
            <h2>Paramètres du Trade</h2>
            <div class="education-content">
                <h4>💰 Capital actuel: $${currentCapital.toFixed(2)} | Risque: ${this.settings.riskPerTrade}% ($${riskAmount})</h4>
                ${confluencesHtml}
            </div>
            <div class="trade-form">
                <div class="form-group">
                    <label>Instrument:</label>
                    <select id="currency">
                        <option value="EUR/USD">EUR/USD</option>
                        <option value="GBP/USD">GBP/USD</option>
                        <option value="USD/JPY">USD/JPY</option>
                        <option value="AUD/USD">AUD/USD</option>
                        <option value="USD/CAD">USD/CAD</option>
                        <option value="XAU/USD">XAU/USD (Or)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Point d'entrée:</label>
                    <input type="number" id="entryPoint" step="0.00001" placeholder="1.12345">
                </div>
                <div class="form-group">
                    <label>Stop Loss:</label>
                    <input type="number" id="stopLoss" step="0.00001" placeholder="1.12000">
                </div>
                <div class="form-group">
                    <label>Take Profit:</label>
                    <input type="number" id="takeProfit" step="0.00001" placeholder="1.13000">
                </div>
                <div class="form-group">
                    <label>Lot:</label>
                    <input type="number" id="lotSize" step="0.01" placeholder="0.10">
                </div>
                <div class="form-buttons">
                    <button class="btn-submit" onclick="dashboard.saveTrade()">Enregistrer Trade</button>
                    <button class="btn-secondary" onclick="dashboard.closeModal()">Annuler</button>
                </div>
            </div>
        `;
    }
    
    getConfluenceName(key) {
        const names = {
            'contextGlobal': 'Contexte Global',
            'zoneInstitutionnelle': 'Zone Institutionnelle',
            'structureMarche': 'Structure de Marché',
            'timingKillzones': 'Timing Killzones',
            'signalEntree': 'Signal d\'Entrée',
            'riskManagement': 'Risk Management',
            'discipline': 'Discipline'
        };
        return names[key] || key;
    }

    saveTrade() {
        const currency = document.getElementById('currency')?.value;
        const entryPoint = parseFloat(document.getElementById('entryPoint')?.value);
        const stopLoss = parseFloat(document.getElementById('stopLoss')?.value);
        const takeProfit = parseFloat(document.getElementById('takeProfit')?.value);
        const lotSize = parseFloat(document.getElementById('lotSize')?.value);

        if (!currency || !entryPoint || !stopLoss || !takeProfit || !lotSize) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const trade = {
            ...this.currentTrade,
            id: `${this.currentUser}_${Date.now()}`,
            currency,
            entryPoint,
            stopLoss,
            takeProfit,
            lotSize,
            riskPercent: this.settings.riskPerTrade,
            status: 'open',
            createdAt: Date.now()
        };
        
        this.trades.push(trade);
        this.saveData();
        this.closeModal();
        this.updateStats();
        this.renderTradesTable();
        this.renderCalendar();
        this.showNotification('Trade enregistré avec succès!');
    }

    renderTradesTable() {
        const tbody = document.querySelector('#tradesTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.trades.slice(-10).reverse().forEach((trade, index) => {
            const row = document.createElement('tr');
            const pnl = parseFloat(trade.pnl || 0);
            const pnlClass = pnl > 0 ? 'positive' : pnl < 0 ? 'negative' : '';
            
            row.innerHTML = `
                <td>${trade.date}</td>
                <td>${trade.currency}</td>
                <td>${trade.entryPoint}</td>
                <td>${trade.stopLoss}</td>
                <td>${trade.takeProfit}</td>
                <td>${trade.lotSize}</td>
                <td>${trade.riskPercent || 2}%</td>
                <td>${trade.result || (trade.status === 'open' ? 'OPEN' : '-')}</td>
                <td class="${pnlClass}">$${pnl.toFixed(2)}</td>
                <td>
                    ${trade.status === 'open' ? 
                        `<button class="btn-small btn-danger" onclick="dashboard.quickCloseTrade(${this.trades.indexOf(trade)})">Clôturer</button>` : 
                        '-'
                    }
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    quickCloseTrade(index) {
        const trade = this.trades[index];
        if (!trade || trade.status === 'closed') return;
        
        const result = prompt('Résultat du trade (TP/SL/BE):', 'TP');
        if (!result) return;
        
        this.closeTrade(index, result.toUpperCase());
    }

    closeTrade(index, result) {
        const trade = this.trades[index];
        if (!trade || trade.status === 'closed') return;
        
        trade.result = result;
        trade.status = 'closed';
        
        if (result === 'TP') {
            trade.closePrice = trade.takeProfit;
        } else if (result === 'SL') {
            trade.closePrice = trade.stopLoss;
        } else if (result === 'BE') {
            trade.closePrice = trade.entryPoint;
        }
        
        trade.pnl = this.calculatePnL(trade);
        
        this.saveData();
        this.updateStats();
        this.renderTradesTable();
        this.renderCalendar();
        
        this.showNotification(`Trade ${trade.currency} clôturé en ${result}`);
    }

    calculatePnL(trade) {
        const entryPoint = parseFloat(trade.entryPoint);
        const closePrice = parseFloat(trade.closePrice);
        const lotSize = parseFloat(trade.lotSize);
        const currency = trade.currency;
        
        if (!entryPoint || !closePrice || !lotSize) return 0;
        
        let priceDiff = closePrice - entryPoint;
        
        const isLong = parseFloat(trade.takeProfit) > entryPoint;
        if (!isLong) priceDiff = -priceDiff;
        
        let pnl = 0;
        
        if (currency === 'XAU/USD') {
            pnl = priceDiff * lotSize * 100;
        } else if (currency.includes('JPY')) {
            const pipDiff = priceDiff * 100;
            pnl = pipDiff * lotSize * 10;
        } else {
            const pipDiff = priceDiff * 10000;
            pnl = pipDiff * lotSize * 10;
        }
        
        return parseFloat(pnl.toFixed(2));
    }

    initCalendar() {
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('monthYear');
        
        if (!calendarGrid || !monthYear) return;
        
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        monthYear.textContent = new Intl.DateTimeFormat('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
        }).format(this.currentCalendarDate);
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        calendarGrid.innerHTML = '';
        
        const dayHeaders = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        const dailyTargetAmount = (initialCapital * this.settings.dailyTarget / 100);
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayTrades = this.trades.filter(t => t.date === dateStr);
            const dayPnL = dayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
            
            const targetReached = dayPnL >= dailyTargetAmount;
            const targetIcon = targetReached ? '✅' : (dayPnL > 0 ? '🟡' : (dayPnL < 0 ? '🔴' : ''));
            
            dayElement.innerHTML = `
                <div class="calendar-date">${currentDate.getDate()}</div>
                ${dayTrades.length > 0 ? `
                    <div class="calendar-trades">
                        <div class="trade-count">${dayTrades.length} trade${dayTrades.length > 1 ? 's' : ''} ${targetIcon}</div>
                        <div class="trade-pnl ${dayPnL >= 0 ? 'positive' : 'negative'}">$${dayPnL.toFixed(2)}</div>
                        ${targetReached ? '<div class="target-reached">🎯 Objectif atteint!</div>' : ''}
                    </div>
                ` : ''}
            `;
            
            if (dayTrades.length > 0) {
                dayElement.classList.add('has-trades');
                if (dayPnL > 0) dayElement.classList.add('profit-day');
                else if (dayPnL < 0) dayElement.classList.add('loss-day');
                if (targetReached) dayElement.classList.add('target-reached-day');
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        this.updateCalendarStats();
    }
    
    updateCalendarStats() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        const monthTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date);
            return tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
        });
        const monthPnL = monthTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const monthWins = monthTrades.filter(t => parseFloat(t.pnl || 0) > 0).length;
        const monthWinRate = monthTrades.length > 0 ? (monthWins / monthTrades.length * 100).toFixed(1) : 0;
        
        const yearTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date);
            return tradeDate.getFullYear() === year;
        });
        const yearPnL = yearTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const yearWins = yearTrades.filter(t => parseFloat(t.pnl || 0) > 0).length;
        const yearWinRate = yearTrades.length > 0 ? (yearWins / yearTrades.length * 100).toFixed(1) : 0;
        
        this.updateElement('monthPnL', `$${monthPnL.toFixed(2)}`, monthPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('monthWinRate', `${monthWinRate}%`);
        this.updateElement('yearPnL', `$${yearPnL.toFixed(2)}`, yearPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('yearWinRate', `${yearWinRate}%`);
    }

    showModal() {
        const modal = document.getElementById('tradeModal');
        if (modal) modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('tradeModal');
        if (modal) modal.style.display = 'none';
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #5b86e5);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    resetAllData() {
        if (confirm('⚠️ ATTENTION: Cette action supprimera TOUS vos trades et données. Êtes-vous sûr ?')) {
            this.trades = [];
            this.settings = { capital: 1000, riskPerTrade: 2, dailyTarget: 1, monthlyTarget: 5, yearlyTarget: 60 };
            this.accounts[this.currentAccount].capital = 1000;
            this.saveData();
            this.updateStats();
            this.renderTradesTable();
            this.renderCalendar();
            this.showNotification('Toutes les données ont été supprimées');
        }
    }

    exportToExcel() {
        if (this.trades.length === 0) {
            alert('Aucun trade à exporter');
            return;
        }
        
        let csvContent = "Date,Instrument,Entrée,Stop Loss,Take Profit,Lot,Risque %,Résultat,P&L\n";
        
        this.trades.forEach(trade => {
            const pnl = parseFloat(trade.pnl || 0);
            csvContent += `${trade.date},${trade.currency},${trade.entryPoint},${trade.stopLoss},${trade.takeProfit},${trade.lotSize},${trade.riskPercent || 2}%,${trade.result || 'OPEN'},${pnl.toFixed(2)}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `trades_${this.currentUser}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Export CSV téléchargé!');
    }

    switchAccount(accountId) {
        if (!accountId || accountId === this.currentAccount) return;
        
        this.saveData();
        this.currentAccount = accountId;
        this.loadData();
        this.updateStats();
        this.renderTradesTable();
        this.renderCalendar();
        this.updateAccountDisplay();
        
        this.showNotification(`Compte changé: ${this.accounts[accountId]?.name || accountId}`);
    }

    addNewAccount() {
        const name = prompt('Nom du nouveau compte:');
        const capital = parseFloat(prompt('Capital initial ($):')) || 1000;
        
        if (name) {
            const accountId = 'compte' + (Object.keys(this.accounts).length + 1);
            this.accounts[accountId] = { name, capital };
            this.saveData();
            this.updateAccountDisplay();
            this.showNotification(`Compte "${name}" créé avec succès!`);
        }
    }

    deleteAccount() {
        if (Object.keys(this.accounts).length <= 1) {
            alert('Impossible de supprimer le dernier compte');
            return;
        }
        
        if (confirm(`Supprimer le compte "${this.accounts[this.currentAccount].name}" ?`)) {
            delete this.accounts[this.currentAccount];
            this.currentAccount = Object.keys(this.accounts)[0];
            this.loadData();
            this.updateAccountDisplay();
            this.updateStats();
            this.renderTradesTable();
            this.renderCalendar();
            this.showNotification('Compte supprimé');
        }
    }

    showCloseTradeModal() {
        const openTrades = this.trades.filter(t => t.status === 'open');
        if (openTrades.length === 0) {
            alert('Aucun trade ouvert à clôturer');
            return;
        }
        
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        const tradesHtml = openTrades.map((trade, index) => {
            const tradeIndex = this.trades.indexOf(trade);
            return `
                <div class="trade-item">
                    <div class="trade-info">
                        <strong>${trade.currency}</strong> - ${trade.date}<br>
                        Entrée: ${trade.entryPoint} | SL: ${trade.stopLoss} | TP: ${trade.takeProfit}
                    </div>
                    <div class="trade-actions">
                        <button class="btn-small btn-success" onclick="dashboard.closeTrade(${tradeIndex}, 'TP')">TP</button>
                        <button class="btn-small btn-danger" onclick="dashboard.closeTrade(${tradeIndex}, 'SL')">SL</button>
                        <button class="btn-small btn-warning" onclick="dashboard.closeTrade(${tradeIndex}, 'BE')">BE</button>
                    </div>
                </div>
            `;
        }).join('');
        
        modalContent.innerHTML = `
            <h2>Clôturer un Trade</h2>
            <div class="trades-list">
                ${tradesHtml}
            </div>
            <div class="form-buttons">
                <button class="btn-secondary" onclick="dashboard.closeModal()">Annuler</button>
            </div>
        `;
        
        this.showModal();
    }

    showManualCloseModal() {
        alert('Fonction de clôture manuelle - À implémenter');
    }

    closeFullscreen() {
        const modal = document.getElementById('fullscreenModal');
        if (modal) modal.style.display = 'none';
    }

    renderChecklistStep() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        if (this.currentStep < this.checklistSteps.length) {
            const step = this.checklistSteps[this.currentStep];
            const optionsHtml = step.options.map((option, index) => 
                `<button class="btn-yes btn-small" onclick="dashboard.answerStep('${option}')">${option}</button>`
            ).join('');
            
            const chartHtml = this.renderStepChart(this.currentStep + 1);
            
            modalContent.innerHTML = `
                <h2>Étape ${this.currentStep + 1}/${this.checklistSteps.length}</h2>
                <div class="step">
                    <h3>${step.title}</h3>
                    <div class="education-content">
                        <h4>💡 Explication :</h4>
                        <p>${step.education}</p>
                    </div>
                    ${chartHtml}
                    <p><strong>${step.question}</strong></p>
                    <div class="step-buttons">
                        ${optionsHtml}
                    </div>
                    <textarea class="comment-box" placeholder="Commentaire (optionnel)..." id="stepComment"></textarea>
                    <div style="text-align: center; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                        <button class="btn-skip" onclick="dashboard.skipToTrade()">⏩ Passer les étapes</button>
                    </div>
                </div>
            `;
        } else {
            this.renderTradeForm();
        }
    }

    renderStepChart(stepNumber) {
        const charts = {
            1: `<div class="strategy-chart"><img src="step1_context.svg" alt="Contexte Multi-timeframe" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"><button class="btn-fullscreen" onclick="dashboard.showFullscreenImage('step1_context.svg', 'Contexte Multi-timeframe')">🔍 Plein écran</button></div>`,
            2: `<div class="strategy-chart"><img src="step2_orderblock.svg" alt="Order Block Strategy" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"><button class="btn-fullscreen" onclick="dashboard.showFullscreenImage('step2_orderblock.svg', 'Order Block Strategy')">🔍 Plein écran</button></div>`,
            3: `<div class="strategy-chart"><img src="step3_bos.svg" alt="Break of Structure" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"><button class="btn-fullscreen" onclick="dashboard.showFullscreenImage('step3_bos.svg', 'Break of Structure')">🔍 Plein écran</button></div>`,
            4: `<div class="strategy-chart"><img src="step4_killzones.svg" alt="Killzones Trading" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"><button class="btn-fullscreen" onclick="dashboard.showFullscreenImage('step4_killzones.svg', 'Killzones Trading')">🔍 Plein écran</button></div>`,
            5: `<div class="strategy-chart"><img src="step5_entry.svg" alt="Signal d'Entrée" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"><button class="btn-fullscreen" onclick="dashboard.showFullscreenImage('step5_entry.svg', 'Signal d\\'Entrée')">🔍 Plein écran</button></div>`,
            6: `<div class="strategy-chart"><img src="step6_risk.svg" alt="Risk Management" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"><button class="btn-fullscreen" onclick="dashboard.showFullscreenImage('step6_risk.svg', 'Risk Management')">🔍 Plein écran</button></div>`,
            7: `<div class="strategy-chart"><img src="step7_discipline.svg" alt="Discipline Trading" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"><button class="btn-fullscreen" onclick="dashboard.showFullscreenImage('step7_discipline.svg', 'Discipline Trading')">🔍 Plein écran</button></div>`
        };
        return charts[stepNumber] || '';
    }

    answerStep(answer) {
        const step = this.checklistSteps[this.currentStep];
        const commentElement = document.getElementById('stepComment');
        const comment = commentElement ? commentElement.value : '';
        
        this.currentTrade.confluences[step.key] = answer;
        if (comment) {
            this.currentTrade.comments[step.key] = comment;
        }
        
        this.currentStep++;
        this.renderChecklistStep();
    }

    skipToTrade() {
        for (let i = this.currentStep; i < this.checklistSteps.length; i++) {
            const step = this.checklistSteps[i];
            this.currentTrade.confluences[step.key] = step.options[0];
        }
        this.renderTradeForm();
    }

    showFullscreenImage(imageSrc, title) {
        const modal = document.getElementById('fullscreenModal');
        const content = document.getElementById('fullscreenContent');
        if (modal && content) {
            content.innerHTML = `
                <div class="fullscreen-header">
                    <h2>${title}</h2>
                    <button class="close-fullscreen" onclick="dashboard.closeFullscreen()">✕</button>
                </div>
                <div class="fullscreen-image-container">
                    <img src="${imageSrc}" alt="${title}" style="width: 100%; height: auto; max-height: 90vh; object-fit: contain;">
                </div>
            `;
            modal.style.display = 'flex';
        }
    }
}

// Initialisation globale
let dashboard;

function initializeDashboard() {
    console.log('Starting complete dashboard initialization...');
    try {
        dashboard = new CompleteTradingDashboard();
        window.dashboard = dashboard;
        console.log('Complete dashboard created successfully');
    } catch (error) {
        console.error('Error creating dashboard:', error);
    }
}

// Initialiser dès que possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    setTimeout(initializeDashboard, 100);
}

// Backup au cas où
window.addEventListener('load', function() {
    if (!window.dashboard) {
        console.log('Backup initialization...');
        initializeDashboard();
    }
});

console.log('Complete dashboard script loaded successfully');