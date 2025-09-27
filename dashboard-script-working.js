// Dashboard Trading - Version Simplifiée et Fonctionnelle
console.log('Loading dashboard script...');

class SimpleTradingDashboard {
    constructor() {
        console.log('Creating dashboard instance...');
        this.currentUser = sessionStorage.getItem('firebaseUID');
        if (!this.currentUser) {
            console.error('Aucun UID Firebase trouvé!');
            alert('Erreur: Vous devez être connecté pour accéder au dashboard');
            window.location.href = 'index.html';
            return;
        }
        this.currentAccount = 'compte1';
        this.trades = [];
        this.settings = { 
            capital: 1000, 
            riskPerTrade: 2,
            dailyTarget: 1,
            weeklyTarget: 3,
            monthlyTarget: 15,
            yearlyTarget: 200
        };
        this.accounts = {
            'compte1': { name: 'Compte Principal', capital: 1000 },
            'compte2': { name: 'Compte Démo', capital: 500 },
            'compte3': { name: 'Compte Swing', capital: 2000 }
        };
        this.currentCalendarDate = new Date();
        this.currentStep = 0;
        this.currentTrade = {};
        this.localVersion = Date.now();
        this.unsubscribe = null;
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
        
        this.init();
    }

    async init() {
        console.log('Initializing dashboard...');
        // S'assurer d'avoir le bon UID
        const firebaseUID = sessionStorage.getItem('firebaseUID');
        if (firebaseUID) {
            this.currentUser = firebaseUID;
        }
        await this.loadData();
        this.setupEventListeners();
        this.setupRealtimeSync();
        this.updateStats();
        this.renderTradesTable();
        this.initCalendar();
        this.updateAccountDisplay();
        this.initCharts();
        this.initCorrelationMatrix();
        this.initGauge();
        console.log('Dashboard initialized successfully');
    }

    async setupRealtimeSync() {
        // Désactiver temporairement la sync temps réel pour éviter les erreurs de permissions
        console.log('Sync temps réel désactivée temporairement');
        
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.textContent = '💾 Sauvegarde Firebase';
            syncStatus.style.background = 'rgba(0, 212, 255, 0.2)';
            syncStatus.style.color = '#00d4ff';
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Attendre que le DOM soit prêt
        const setup = () => {
            // Boutons principaux
            this.bindButton('newTradeBtn', () => this.startNewTrade());
            this.bindButton('settingsBtn', () => this.showSettings());
            this.bindButton('closeTradeBtn', () => this.showCloseTradeModal());
            this.bindButton('resetBtn', () => this.resetAllData());
            this.bindButton('manualCloseBtn', () => this.showManualCloseModal());
            this.bindButton('exportBtn', () => this.exportToExcel());
            this.bindButton('cleanupBtn', () => this.cleanupOrphanedData());
            
            // Boutons de compte
            this.bindButton('addAccountBtn', () => this.addNewAccount());
            this.bindButton('deleteAccountBtn', () => this.deleteAccount());
            
            // Sélecteur de compte
            const accountSelect = document.getElementById('accountSelect');
            if (accountSelect) {
                accountSelect.onchange = (e) => this.switchAccount(e.target.value);
                console.log('Account selector configured');
            }
            
            // Boutons calendrier
            this.bindButton('prevMonth', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
                this.renderCalendar();
            });
            this.bindButton('nextMonth', () => {
                this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
                this.renderCalendar();
            });
            
            // Modal
            const closeModal = document.querySelector('.close');
            if (closeModal) {
                closeModal.onclick = () => this.closeModal();
            }
            
            // Clics sur les modals
            window.onclick = (e) => {
                if (e.target === document.getElementById('tradeModal')) {
                    this.closeModal();
                }
                if (e.target === document.getElementById('fullscreenModal')) {
                    this.closeFullscreen();
                }
            };
            
            console.log('All event listeners configured');
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

    async loadData() {
        try {
            if (window.firebaseDB) {
                await this.loadFromFirebase();
            } else {
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem(`dashboard_${this.currentUser}`);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.trades = data.trades || [];
                this.settings = data.settings || this.settings;
                this.accounts = data.accounts || this.accounts;
                this.currentAccount = data.currentAccount || this.currentAccount;
                
                console.log('Données chargées depuis localStorage');
            }
        } catch (error) {
            console.error('Erreur chargement local:', error);
        }
    }

    async loadFromFirebase() {
        try {
            const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
            const userRef = ref(window.firebaseDB, `dashboards/${this.currentUser}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const data = snapshot.val();
                this.trades = data.trades || [];
                this.settings = data.settings || this.settings;
                this.accounts = data.accounts || this.accounts;
                this.currentAccount = data.currentAccount || this.currentAccount;
                console.log('Données chargées depuis Realtime Database');
            } else {
                console.log('Aucune donnée Firebase, utilisation des valeurs par défaut');
            }
        } catch (error) {
            console.error('Erreur chargement Firebase:', error);
            throw error;
        }
    }

    async saveData() {
        try {
            this.localVersion = Date.now();
            if (window.firebaseDB) {
                await this.saveToFirebase();
            }
            this.saveToLocalStorage();
        } catch (error) {
            console.error('Error saving data:', error);
            this.saveToLocalStorage();
        }
    }

    saveToLocalStorage() {
        try {
            // Sauvegarder toutes les données dans une seule clé pour éviter les conflits
            const allData = {
                trades: this.trades,
                settings: this.settings,
                accounts: this.accounts,
                currentAccount: this.currentAccount,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(`dashboard_${this.currentUser}`, JSON.stringify(allData));
            
            // Mettre à jour le statut
            const syncStatus = document.getElementById('syncStatus');
            if (syncStatus) {
                syncStatus.textContent = '✅ Sauvegardé';
                setTimeout(() => {
                    syncStatus.textContent = '💾 Local';
                }, 1000);
            }
        } catch (error) {
            console.error('Erreur sauvegarde locale:', error);
        }
    }

    async saveToFirebase() {
        if (!window.firebaseDB) return;
        
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const userRef = ref(window.firebaseDB, `dashboards/${this.currentUser}`);
                
                const dataToSave = {
                    trades: this.trades,
                    settings: this.settings,
                    accounts: this.accounts,
                    currentAccount: this.currentAccount,
                    lastUpdated: new Date().toISOString(),
                    version: Date.now()
                };
                
                await set(userRef, dataToSave);
                
                const syncStatus = document.getElementById('syncStatus');
                if (syncStatus) {
                    syncStatus.textContent = '✅ Firebase OK';
                    syncStatus.style.background = 'rgba(78, 205, 196, 0.2)';
                    syncStatus.style.color = '#4ecdc4';
                    setTimeout(() => {
                        syncStatus.textContent = '🔥 Firebase';
                    }, 2000);
                }
                
                console.log('Sauvegarde Firebase réussie');
                return;
                
            } catch (error) {
                retryCount++;
                console.warn(`Tentative Firebase ${retryCount}/${maxRetries} échouée:`, error.message);
                
                if (retryCount >= maxRetries) {
                    const syncStatus = document.getElementById('syncStatus');
                    if (syncStatus) {
                        syncStatus.textContent = '⚠️ Local uniquement';
                        syncStatus.style.background = 'rgba(255, 107, 107, 0.2)';
                        syncStatus.style.color = '#ff6b6b';
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }
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
                    <label>Objectif hebdomadaire (% du capital):</label>
                    <input type="number" id="weeklyTargetInput" value="${this.settings.weeklyTarget}" step="0.5" min="0.5">
                </div>
                <div class="form-group">
                    <label>Objectif mensuel (% du capital):</label>
                    <input type="number" id="monthlyTargetInput" value="${this.settings.monthlyTarget}" step="1" min="1">
                </div>
                <div class="form-group">
                    <label>Objectif annuel (% du capital):</label>
                    <input type="number" id="yearlyTargetInput" value="${this.settings.yearlyTarget}" step="10" min="10">
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
        const weeklyTarget = parseFloat(document.getElementById('weeklyTargetInput')?.value) || 3;
        const monthlyTarget = parseFloat(document.getElementById('monthlyTargetInput')?.value) || 15;
        const yearlyTarget = parseFloat(document.getElementById('yearlyTargetInput')?.value) || 200;
        
        this.settings = { capital, riskPerTrade, dailyTarget, weeklyTarget, monthlyTarget, yearlyTarget };
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
        
        // Résumé des confluences
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
        
        // Détruire et recréer tous les graphiques
        Object.values(Chart.instances).forEach(chart => chart.destroy());
        setTimeout(() => {
            this.initCharts();
            this.initGauge();
            this.updateCalendarStats();
        }, 100);
        
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
        
        // Détruire et recréer tous les graphiques
        Object.values(Chart.instances).forEach(chart => chart.destroy());
        setTimeout(() => {
            this.initCharts();
            this.initGauge();
            this.updateCalendarStats();
        }, 100);
        
        this.closeModal();
        
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
        
        // En-têtes des jours
        const dayHeaders = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        const dailyTargetAmount = (initialCapital * this.settings.dailyTarget / 100);
        
        // Jours du calendrier
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
            
            // Indicateur d'objectif atteint
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
        const today = new Date();
        
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        const dailyTarget = (initialCapital * this.settings.dailyTarget / 100);
        const weeklyTarget = (initialCapital * this.settings.weeklyTarget / 100);
        const monthlyTarget = (initialCapital * this.settings.monthlyTarget / 100);
        const yearlyTarget = (initialCapital * this.settings.yearlyTarget / 100);
        
        // Stats du jour actuel
        const todayStr = today.toISOString().split('T')[0];
        const todayTrades = this.trades.filter(t => t.date === todayStr);
        const todayPnL = todayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Stats de la semaine
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date);
            return tradeDate >= weekStart && tradeDate <= weekEnd;
        });
        const weekPnL = weekTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Stats du mois
        const monthTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date);
            return tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
        });
        const monthPnL = monthTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Stats de l'année
        const yearTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date);
            return tradeDate.getFullYear() === year;
        });
        const yearPnL = yearTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Mise à jour des éléments de stats s'ils existent
        this.updateElement('todayPnL', `$${todayPnL.toFixed(2)}`, todayPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('weekPnL', `$${weekPnL.toFixed(2)}`, weekPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('monthPnL', `$${monthPnL.toFixed(2)}`, monthPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('yearPnL', `$${yearPnL.toFixed(2)}`, yearPnL >= 0 ? 'positive' : 'negative');
        
        // Mise à jour des cibles dans les encarts
        this.updateElement('dailyTargetPercent', `${this.settings.dailyTarget}%`);
        this.updateElement('dailyTarget', dailyTarget.toFixed(0));
        this.updateElement('weeklyTargetPercent', `${this.settings.weeklyTarget}%`);
        this.updateElement('weeklyTarget', weeklyTarget.toFixed(0));
        this.updateElement('monthlyTargetPercent', `${this.settings.monthlyTarget}%`);
        this.updateElement('monthlyTarget', monthlyTarget.toFixed(0));
        this.updateElement('yearlyTargetPercent', `${this.settings.yearlyTarget}%`);
        this.updateElement('yearlyTarget', yearlyTarget.toFixed(0));
        
        // Progrès des objectifs
        const dailyProgress = dailyTarget > 0 ? Math.min((todayPnL / dailyTarget) * 100, 100).toFixed(1) : 0;
        const weekProgress = weeklyTarget > 0 ? Math.min((weekPnL / weeklyTarget) * 100, 100).toFixed(1) : 0;
        const monthProgress = monthlyTarget > 0 ? Math.min((monthPnL / monthlyTarget) * 100, 100).toFixed(1) : 0;
        const yearProgress = yearlyTarget > 0 ? Math.min((yearPnL / yearlyTarget) * 100, 100).toFixed(1) : 0;
        
        this.updateElement('dailyProgress', `${dailyProgress}%`);
        this.updateElement('weekProgress', `${weekProgress}%`);
        this.updateElement('monthProgress', `${monthProgress}%`);
        this.updateElement('yearProgress', `${yearProgress}%`);
        
        // Calcul du rendement annuel
        const totalPnL = this.trades.filter(t => t.status === 'closed').reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const yearReturn = ((totalPnL / initialCapital) * 100).toFixed(1);
        this.updateElement('yearReturn', `${yearReturn}%`);
        
        // Mise à jour des barres de progression
        const dailyProgressBar = document.getElementById('dailyProgressBar');
        const weekProgressBar = document.getElementById('weeklyProgressBar');
        const monthProgressBar = document.getElementById('monthlyProgressBar');
        const yearProgressBar = document.getElementById('yearlyProgressBar');
        
        if (dailyProgressBar) {
            dailyProgressBar.style.width = `${Math.min(dailyProgress, 100)}%`;
            if (dailyProgress >= 100) dailyProgressBar.classList.add('completed');
        }
        
        if (weekProgressBar) {
            weekProgressBar.style.width = `${Math.min(weekProgress, 100)}%`;
            if (weekProgress >= 100) weekProgressBar.classList.add('completed');
        }
        
        if (monthProgressBar) {
            monthProgressBar.style.width = `${Math.min(monthProgress, 100)}%`;
            if (monthProgress >= 100) monthProgressBar.classList.add('completed');
        }
        
        if (yearProgressBar) {
            yearProgressBar.style.width = `${Math.min(yearProgress, 100)}%`;
            if (yearProgress >= 100) yearProgressBar.classList.add('completed');
        }
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
            this.settings = { capital: 1000, riskPerTrade: 2, dailyTarget: 1, weeklyTarget: 3, monthlyTarget: 15, yearlyTarget: 200 };
            this.accounts[this.currentAccount].capital = 1000;
            this.saveData();
            this.updateStats();
            this.renderTradesTable();
            this.renderCalendar();
            
            // Détruire et recréer tous les graphiques
            Object.values(Chart.instances).forEach(chart => chart.destroy());
            setTimeout(() => {
                this.initCharts();
                this.initGauge();
                this.updateCalendarStats();
            }, 100);
            
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
        
        // Sauvegarder les trades du compte actuel
        if (this.accounts[this.currentAccount]) {
            this.accounts[this.currentAccount].trades = [...this.trades];
            this.accounts[this.currentAccount].settings = { ...this.settings };
        }
        
        // Changer de compte
        this.currentAccount = accountId;
        
        // Charger les données du nouveau compte
        if (this.accounts[accountId]) {
            this.trades = this.accounts[accountId].trades || [];
            this.settings = this.accounts[accountId].settings || { ...this.settings, capital: this.accounts[accountId].capital };
        }
        
        this.saveData();
        this.updateStats();
        this.renderTradesTable();
        this.renderCalendar();
        this.updateAccountDisplay();
        
        // Recréer les graphiques
        Object.values(Chart.instances).forEach(chart => chart.destroy());
        setTimeout(() => {
            this.initCharts();
            this.initGauge();
            this.updateCalendarStats();
        }, 100);
        
        this.showNotification(`Compte changé: ${this.accounts[accountId]?.name || accountId}`);
    }

    addNewAccount() {
        const name = prompt('Nom du nouveau compte:');
        if (!name) return;
        
        const capital = parseFloat(prompt('Capital initial ($):')) || 1000;
        
        // Générer un ID unique pour éviter les conflits
        let accountId;
        let counter = Object.keys(this.accounts).length + 1;
        do {
            accountId = 'compte' + counter;
            counter++;
        } while (this.accounts[accountId]);
        
        // Créer le nouveau compte avec ses propres données
        this.accounts[accountId] = { 
            name, 
            capital,
            trades: [], // Chaque compte a ses propres trades
            settings: { ...this.settings, capital } // Copie des paramètres avec le nouveau capital
        };
        
        this.saveData();
        this.updateAccountDisplay();
        this.showNotification(`Compte "${name}" créé avec succès!`);
    }

    async deleteAccount() {
        if (Object.keys(this.accounts).length <= 1) {
            alert('Impossible de supprimer le dernier compte');
            return;
        }
        
        const accountName = this.accounts[this.currentAccount].name;
        if (confirm(`Supprimer le compte "${accountName}" et toutes ses données ?`)) {
            // Supprimer le compte
            delete this.accounts[this.currentAccount];
            
            // Changer vers le premier compte disponible
            this.currentAccount = Object.keys(this.accounts)[0];
            
            // Vider les trades du compte supprimé
            this.trades = [];
            
            // Sauvegarder immédiatement sur Firebase
            await this.saveData();
            
            // Recharger les données du nouveau compte
            await this.loadData();
            
            // Mettre à jour l'interface
            this.updateAccountDisplay();
            this.updateStats();
            this.renderTradesTable();
            this.renderCalendar();
            this.initCharts();
            this.initGauge();
            
            this.showNotification(`Compte "${accountName}" supprimé définitivement`);
        }
    }

    async cleanupOrphanedData() {
        if (!window.firebaseDB) return;
        
        try {
            const { ref, remove } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
            
            // Supprimer les données orphelines sous 'trader_vip'
            const traderVipRef = ref(window.firebaseDB, 'dashboards/trader_vip');
            await remove(traderVipRef);
            
            console.log('Données orphelines supprimées');
            this.showNotification('Nettoyage Firebase terminé');
        } catch (error) {
            console.error('Erreur nettoyage:', error);
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

    initCharts() {
        this.initPerformanceChart();
        this.initWinRateChart();
        this.initMonthlyChart();
        this.initConfluencesChart();
    }

    initConfluencesChart() {
        const ctx = document.getElementById('confluencesChart');
        if (!ctx) return;

        // Données par défaut si pas de trades
        const defaultData = [85, 75, 90, 70, 80, 95, 88];
        const labels = ['Contexte', 'Zone Inst.', 'Structure', 'Killzones', 'Signal', 'Risk Mgmt', 'Discipline'];

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    data: defaultData,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#00d4ff',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#ffffff',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        const closedTrades = this.trades.filter(t => t.status === 'closed');
        let cumulativePnL = 0;
        const data = closedTrades.map(trade => {
            cumulativePnL += parseFloat(trade.pnl || 0);
            return cumulativePnL;
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: closedTrades.map((_, i) => `T${i + 1}`),
                datasets: [{
                    data: data,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) { return '$' + value; }
                        },
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
        const winRate = closedTrades.length > 0 ? (wins / closedTrades.length * 100).toFixed(0) : 0;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [wins, losses],
                    backgroundColor: ['#4ecdc4', '#ff6b6b'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            },
            plugins: [{
                beforeDraw: function(chart) {
                    const ctx = chart.ctx;
                    const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
                    const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
                    ctx.save();
                    ctx.font = 'bold 20px Inter';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(winRate + '%', centerX, centerY);
                    ctx.restore();
                }
            }]
        });
    }

    initMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        const monthlyData = {};
        this.trades.filter(t => t.status === 'closed').forEach(trade => {
            const month = new Date(trade.date).toLocaleDateString('fr-FR', { month: 'short' });
            if (!monthlyData[month]) monthlyData[month] = 0;
            monthlyData[month] += parseFloat(trade.pnl || 0);
        });

        const labels = Object.keys(monthlyData);
        const data = labels.map(month => monthlyData[month]);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: data.map(val => val >= 0 ? '#4ecdc4' : '#ff6b6b'),
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        ticks: { color: '#ffffff', font: { size: 11 } },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) { return '$' + value; }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    initCorrelationMatrix() {
        const container = document.getElementById('correlationMatrix');
        if (!container) return;

        const concepts = ['Contexte', 'Zone Inst.', 'Structure', 'Killzones', 'Signal', 'Risk Mgmt', 'Discipline'];
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
        html += '<div class="correlation-cell header"></div>';
        
        concepts.forEach(concept => {
            html += `<div class="correlation-cell header">${concept}</div>`;
        });

        concepts.forEach((rowConcept, i) => {
            html += `<div class="correlation-cell row-header">${rowConcept}</div>`;
            correlationData[i].forEach((value, j) => {
                const className = value >= 80 ? 'excellent' : value >= 60 ? 'good' : 'average';
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

        this.updateElement('gainsValue', `$${totalPnL.toFixed(2)}`);
        this.updateElement('gainsPercent', `${percentage}%`);

        container.style.background = `conic-gradient(from 0deg, 
            ${totalPnL >= 0 ? '#4ecdc4' : '#ff6b6b'} 0deg ${Math.abs(percentage) * 3.6}deg, 
            rgba(255, 255, 255, 0.1) ${Math.abs(percentage) * 3.6}deg 360deg)`;
    }
}

// Initialisation globale
let dashboard;

function initializeDashboard() {
    console.log('Starting dashboard initialization...');
    try {
        dashboard = new SimpleTradingDashboard();
        window.dashboard = dashboard;
        console.log('Dashboard created successfully');
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

console.log('Dashboard script loaded successfully');