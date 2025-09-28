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
        this.initICTAnalysis();
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
        
        // Forcer la mise à jour des objectifs
        setTimeout(() => {
            this.updateCalendarStats();
        }, 100);
    }

    updateElement(id, text, className = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
            if (className) {
                element.className = className;
            }
        } else {
            console.warn(`Element with ID '${id}' not found. Value: ${text}`);
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
            this.initICTAnalysis();
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
            
            const actualRiskPercent = this.calculateActualRiskPercent(trade);
            const riskClass = this.getRiskClass(actualRiskPercent, trade.riskPercent || 2);
            
            row.innerHTML = `
                <td>${trade.date}</td>
                <td>${trade.currency}</td>
                <td>${trade.entryPoint}</td>
                <td>${trade.stopLoss}</td>
                <td>${trade.takeProfit}</td>
                <td>${trade.lotSize}</td>
                <td>${trade.riskPercent || 2}%</td>
                <td class="${riskClass}">${actualRiskPercent}%</td>
                <td>${trade.result || (trade.status === 'open' ? 'OPEN' : '-')}</td>
                <td class="${pnlClass}">$${pnl.toFixed(2)}</td>
                <td>
                    ${trade.status === 'open' ? 
                        `<button class="btn-small btn-primary" onclick="dashboard.editTrade(${this.trades.indexOf(trade)})" style="margin-right: 5px;">Modifier</button><button class="btn-small btn-danger" onclick="dashboard.quickCloseTrade(${this.trades.indexOf(trade)})">Clôturer</button>` : 
                        '-'
                    }
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    editTrade(index) {
        const trade = this.trades[index];
        if (!trade || trade.status === 'closed') return;
        
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <h2>✏️ Modifier le Trade</h2>
            <div class="trade-form">
                <div class="form-group">
                    <label>Instrument:</label>
                    <select id="editCurrency">
                        <option value="EUR/USD" ${trade.currency === 'EUR/USD' ? 'selected' : ''}>EUR/USD</option>
                        <option value="GBP/USD" ${trade.currency === 'GBP/USD' ? 'selected' : ''}>GBP/USD</option>
                        <option value="USD/JPY" ${trade.currency === 'USD/JPY' ? 'selected' : ''}>USD/JPY</option>
                        <option value="AUD/USD" ${trade.currency === 'AUD/USD' ? 'selected' : ''}>AUD/USD</option>
                        <option value="USD/CAD" ${trade.currency === 'USD/CAD' ? 'selected' : ''}>USD/CAD</option>
                        <option value="XAU/USD" ${trade.currency === 'XAU/USD' ? 'selected' : ''}>XAU/USD (Or)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Point d'entrée:</label>
                    <input type="number" id="editEntryPoint" step="0.00001" value="${trade.entryPoint}">
                </div>
                <div class="form-group">
                    <label>Stop Loss:</label>
                    <input type="number" id="editStopLoss" step="0.00001" value="${trade.stopLoss}">
                </div>
                <div class="form-group">
                    <label>Take Profit:</label>
                    <input type="number" id="editTakeProfit" step="0.00001" value="${trade.takeProfit}">
                </div>
                <div class="form-group">
                    <label>Lot:</label>
                    <input type="number" id="editLotSize" step="0.01" value="${trade.lotSize}">
                </div>
                <div class="form-buttons">
                    <button class="btn-submit" onclick="dashboard.saveEditedTrade(${index})">Sauvegarder</button>
                    <button class="btn-secondary" onclick="dashboard.closeModal()">Annuler</button>
                </div>
            </div>
        `;
        
        this.showModal();
    }

    saveEditedTrade(index) {
        const trade = this.trades[index];
        if (!trade || trade.status === 'closed') return;
        
        const currency = document.getElementById('editCurrency')?.value;
        const entryPoint = parseFloat(document.getElementById('editEntryPoint')?.value);
        const stopLoss = parseFloat(document.getElementById('editStopLoss')?.value);
        const takeProfit = parseFloat(document.getElementById('editTakeProfit')?.value);
        const lotSize = parseFloat(document.getElementById('editLotSize')?.value);

        if (!currency || !entryPoint || !stopLoss || !takeProfit || !lotSize) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Mettre à jour le trade
        trade.currency = currency;
        trade.entryPoint = entryPoint;
        trade.stopLoss = stopLoss;
        trade.takeProfit = takeProfit;
        trade.lotSize = lotSize;
        trade.modifiedAt = Date.now();
        
        this.saveData();
        this.closeModal();
        this.updateStats();
        this.renderTradesTable();
        this.renderCalendar();
        
        this.showNotification('Trade modifié avec succès!');
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
            this.initCorrelationMatrix();
            this.initGauge();
            this.updateCalendarStats();
        }, 100);
        
        this.closeModal();
        
        this.showNotification(`Trade ${trade.currency} clôturé en ${result}`);
    }

    calculateActualRiskPercent(trade) {
        const entryPoint = parseFloat(trade.entryPoint);
        const stopLoss = parseFloat(trade.stopLoss);
        const lotSize = parseFloat(trade.lotSize);
        const currency = trade.currency;
        
        if (!entryPoint || !stopLoss || !lotSize) return '0.00';
        
        // Calculer la perte potentielle en cas de SL
        const priceDiff = Math.abs(entryPoint - stopLoss);
        let potentialLoss = 0;
        
        if (currency === 'XAU/USD') {
            potentialLoss = priceDiff * lotSize * 100;
        } else if (currency.includes('JPY')) {
            const pipDiff = priceDiff * 100;
            potentialLoss = pipDiff * lotSize * 10;
        } else {
            const pipDiff = priceDiff * 10000;
            potentialLoss = pipDiff * lotSize * 10;
        }
        
        // Calculer le capital au moment du trade
        const closedTrades = this.trades.filter(t => t.status === 'closed' && t.createdAt < trade.createdAt);
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const capitalAtTradeTime = (this.accounts[this.currentAccount]?.capital || this.settings.capital) + totalPnL;
        
        // Calculer le pourcentage de risque réel
        const actualRiskPercent = (potentialLoss / capitalAtTradeTime) * 100;
        
        return actualRiskPercent.toFixed(2);
    }
    
    getRiskClass(actualRisk, targetRisk) {
        const actual = parseFloat(actualRisk);
        const target = parseFloat(targetRisk);
        const tolerance = 0.1; // Tolérance de 0.1%
        
        if (Math.abs(actual - target) <= tolerance) {
            return 'risk-perfect'; // Vert - Risque parfait
        } else if (actual < target) {
            return 'risk-low'; // Bleu - Risque plus faible
        } else {
            return 'risk-high'; // Rouge - Risque plus élevé
        }
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
        
        // Calculer le capital actuel avec tous les trades fermés
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const initialCapital = this.accounts[this.currentAccount]?.capital || this.settings.capital;
        const currentCapital = initialCapital + totalPnL;
        
        const dailyTarget = (currentCapital * this.settings.dailyTarget / 100);
        const weeklyTarget = (currentCapital * this.settings.weeklyTarget / 100);
        const monthlyTarget = (currentCapital * this.settings.monthlyTarget / 100);
        const yearlyTarget = (currentCapital * this.settings.yearlyTarget / 100);
        
        // Stats du jour actuel
        const todayStr = today.toISOString().split('T')[0];
        const todayTrades = this.trades.filter(t => t.date === todayStr && t.status === 'closed');
        const todayPnL = todayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Stats de la semaine courante (lundi à dimanche)
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si dimanche (0), alors 6 jours en arrière
        weekStart.setDate(today.getDate() - daysToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date + 'T00:00:00');
            return tradeDate >= weekStart && tradeDate <= weekEnd && t.status === 'closed';
        });
        const weekPnL = weekTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Stats du mois courant
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date + 'T00:00:00');
            return tradeDate.getFullYear() === currentYear && tradeDate.getMonth() === currentMonth && t.status === 'closed';
        });
        const monthPnL = monthTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Stats de l'année courante
        const yearTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date + 'T00:00:00');
            return tradeDate.getFullYear() === currentYear && t.status === 'closed';
        });
        const yearPnL = yearTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        
        // Calcul des WinRates
        const todayWinRate = todayTrades.length > 0 ? (todayTrades.filter(t => parseFloat(t.pnl || 0) > 0).length / todayTrades.length * 100).toFixed(0) : 0;
        const weekWinRate = weekTrades.length > 0 ? (weekTrades.filter(t => parseFloat(t.pnl || 0) > 0).length / weekTrades.length * 100).toFixed(0) : 0;
        const monthWinRate = monthTrades.length > 0 ? (monthTrades.filter(t => parseFloat(t.pnl || 0) > 0).length / monthTrades.length * 100).toFixed(0) : 0;
        const yearWinRate = yearTrades.length > 0 ? (yearTrades.filter(t => parseFloat(t.pnl || 0) > 0).length / yearTrades.length * 100).toFixed(0) : 0;
        
        // Progrès des objectifs
        const dailyProgress = dailyTarget > 0 ? Math.min((todayPnL / dailyTarget) * 100, 100).toFixed(1) : 0;
        const weekProgress = weeklyTarget > 0 ? Math.min((weekPnL / weeklyTarget) * 100, 100).toFixed(1) : 0;
        const monthProgress = monthlyTarget > 0 ? Math.min((monthPnL / monthlyTarget) * 100, 100).toFixed(1) : 0;
        const yearProgress = yearlyTarget > 0 ? Math.min((yearPnL / yearlyTarget) * 100, 100).toFixed(1) : 0;
        
        // Mise à jour des encarts avec toutes les informations
        // Objectif Journalier
        this.updateElement('dailyTargetPercent', `${this.settings.dailyTarget}%`);
        this.updateElement('dailyTarget', dailyTarget.toFixed(0));
        this.updateElement('dailyProgress', `${dailyProgress}%`);
        
        // Objectif Hebdomadaire
        this.updateElement('weeklyTargetPercent', `${this.settings.weeklyTarget}%`);
        this.updateElement('weeklyTarget', weeklyTarget.toFixed(0));
        this.updateElement('weekProgress', `${weekProgress}%`);
        
        // Objectif Mensuel
        this.updateElement('monthlyTargetPercent', `${this.settings.monthlyTarget}%`);
        this.updateElement('monthlyTarget', monthlyTarget.toFixed(0));
        this.updateElement('monthProgress', `${monthProgress}%`);
        this.updateElement('monthPnL', `$${monthPnL.toFixed(2)}`, monthPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('monthWinRate', `${monthWinRate}%`);
        
        // Objectif Annuel
        this.updateElement('yearlyTargetPercent', `${this.settings.yearlyTarget}%`);
        this.updateElement('yearlyTarget', yearlyTarget.toFixed(0));
        this.updateElement('yearProgress', `${yearProgress}%`);
        this.updateElement('yearPnL', `$${yearPnL.toFixed(2)}`, yearPnL >= 0 ? 'positive' : 'negative');
        this.updateElement('yearWinRate', `${yearWinRate}%`);
        
        // Calcul du rendement annuel total
        const yearReturn = ((totalPnL / initialCapital) * 100).toFixed(1);
        this.updateElement('yearReturn', `${yearReturn}%`);
        
        // Mise à jour des barres de progression
        const dailyProgressBar = document.getElementById('dailyProgressBar');
        const weekProgressBar = document.getElementById('weeklyProgressBar');
        const monthProgressBar = document.getElementById('monthlyProgressBar');
        const yearProgressBar = document.getElementById('yearlyProgressBar');
        
        console.log('Progress bars found:', {
            daily: !!dailyProgressBar,
            weekly: !!weekProgressBar, 
            monthly: !!monthProgressBar,
            yearly: !!yearProgressBar
        });
        
        if (dailyProgressBar) {
            dailyProgressBar.style.width = `${Math.min(dailyProgress, 100)}%`;
            dailyProgressBar.classList.toggle('completed', dailyProgress >= 100);
        }
        
        if (weekProgressBar) {
            weekProgressBar.style.width = `${Math.min(weekProgress, 100)}%`;
            weekProgressBar.classList.toggle('completed', weekProgress >= 100);
        }
        
        if (monthProgressBar) {
            monthProgressBar.style.width = `${Math.min(monthProgress, 100)}%`;
            monthProgressBar.classList.toggle('completed', monthProgress >= 100);
        }
        
        if (yearProgressBar) {
            yearProgressBar.style.width = `${Math.min(yearProgress, 100)}%`;
            yearProgressBar.classList.toggle('completed', yearProgress >= 100);
        }
        
        console.log('Stats mises à jour:', {
            today: todayStr,
            dailyPnL: todayPnL,
            dailyTrades: todayTrades.length,
            weeklyPnL: weekPnL,
            weeklyTrades: weekTrades.length,
            monthlyPnL: monthPnL,
            monthlyTrades: monthTrades.length,
            yearlyPnL: yearPnL,
            yearlyTrades: yearTrades.length,
            targets: { daily: dailyTarget, weekly: weeklyTarget, monthly: monthlyTarget, yearly: yearlyTarget },
            progress: { daily: dailyProgress, weekly: weekProgress, monthly: monthProgress, yearly: yearProgress }
        });
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
                this.initCorrelationMatrix();
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
            this.initCorrelationMatrix();
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

    initICTAnalysis() {
        this.calculateCorrelations();
        setInterval(() => this.calculateCorrelations(), 30000);
        this.watchForDataChanges();
        
        // Bouton de rafraîchissement
        const refreshBtn = document.getElementById('refreshCorrelations');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.calculateCorrelations();
                const originalHTML = refreshBtn.innerHTML;
                refreshBtn.innerHTML = '<i class="fas fa-check" style="color: #4ecdc4;"></i>';
                setTimeout(() => {
                    refreshBtn.innerHTML = originalHTML;
                }, 1000);
            });
        }
    }
    
    watchForDataChanges() {
        const firebaseUID = sessionStorage.getItem('firebaseUID');
        if (!firebaseUID) return;
        
        let lastDataHash = '';
        
        setInterval(() => {
            try {
                const savedData = localStorage.getItem(`dashboard_${firebaseUID}`);
                if (savedData) {
                    const currentHash = this.hashCode(savedData);
                    if (currentHash !== lastDataHash) {
                        lastDataHash = currentHash;
                        this.calculateCorrelations();
                        console.log('🔄 Données de trading mises à jour - Matrice ICT recalculée');
                    }
                }
            } catch (error) {
                console.error('Erreur surveillance données:', error);
            }
        }, 5000);
    }
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    
    calculateCorrelations() {
        const correlationMatrix = document.getElementById('correlationMatrix');
        if (!correlationMatrix) return;
        
        correlationMatrix.innerHTML = '';
        
        const tradeData = this.getTradeStepsData();
        
        const matrix = document.createElement('div');
        matrix.className = 'ict-correlation-matrix';
        
        const title = document.createElement('div');
        title.className = 'matrix-title';
        title.innerHTML = '<h3>🎯 Matrice de Corrélation ICT - Étapes de Trading</h3>';
        matrix.appendChild(title);
        
        const ictSteps = [
            { key: 'contextGlobal', name: 'Contexte Global', icon: '🌍' },
            { key: 'zoneInstitutionnelle', name: 'Zone Institutionnelle', icon: '🏦' },
            { key: 'structureMarche', name: 'Structure Marché', icon: '📈' },
            { key: 'timingKillzones', name: 'Timing Killzones', icon: '⏰' },
            { key: 'signalEntree', name: 'Signal Entrée', icon: '🎯' },
            { key: 'riskManagement', name: 'Risk Management', icon: '🛡️' },
            { key: 'discipline', name: 'Discipline', icon: '🧠' }
        ];
        
        const header = document.createElement('div');
        header.className = 'ict-correlation-row header';
        header.innerHTML = '<div class="ict-correlation-cell corner">Étapes ICT</div>';
        ictSteps.forEach(step => {
            header.innerHTML += `<div class="ict-correlation-cell header-cell">${step.icon}<br>${step.name}</div>`;
        });
        matrix.appendChild(header);
        
        ictSteps.forEach((step1, i) => {
            const row = document.createElement('div');
            row.className = 'ict-correlation-row';
            row.innerHTML = `<div class="ict-correlation-cell row-header">${step1.icon} ${step1.name}</div>`;
            
            ictSteps.forEach((step2, j) => {
                let correlation;
                if (i === j) {
                    correlation = 100;
                } else {
                    correlation = this.calculateICTStepCorrelation(step1.key, step2.key, tradeData);
                }
                
                const cell = document.createElement('div');
                cell.className = `ict-correlation-cell data-cell ${this.getICTCorrelationClass(correlation)}`;
                cell.innerHTML = `<div class="correlation-value">${correlation}%</div>`;
                cell.title = `Corrélation ${step1.name} ↔ ${step2.name}: ${correlation}%`;
                
                row.appendChild(cell);
            });
            
            matrix.appendChild(row);
        });
        
        const stats = this.calculateICTStats(tradeData);
        const statsDiv = document.createElement('div');
        statsDiv.className = 'ict-stats';
        statsDiv.innerHTML = `
            <div class="stats-row">
                <div class="stat-item">
                    <span class="stat-label">📈 Trades Analysés:</span>
                    <span class="stat-value">${stats.totalTrades}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">✅ Étapes Complètes:</span>
                    <span class="stat-value">${stats.completeSteps}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🎯 Efficacité Globale:</span>
                    <span class="stat-value">${stats.globalEfficiency}%</span>
                </div>
            </div>
        `;
        matrix.appendChild(statsDiv);
        
        const updateIndicator = document.createElement('div');
        updateIndicator.className = 'update-indicator';
        updateIndicator.innerHTML = `
            <small style="color: rgba(255, 255, 255, 0.6); text-align: center; display: block; margin-top: 10px;">
                🔄 Dernière mise à jour: ${new Date().toLocaleTimeString()}
                ${tradeData.hasData ? '| 📈 Données en temps réel' : '| ⚠️ Aucune donnée de trading'}
            </small>
        `;
        correlationMatrix.appendChild(updateIndicator);
        
        correlationMatrix.appendChild(matrix);
    }
    
    getTradeStepsData() {
        try {
            const firebaseUID = sessionStorage.getItem('firebaseUID');
            if (!firebaseUID) return { trades: [], hasData: false };
            
            const savedData = localStorage.getItem(`dashboard_${firebaseUID}`);
            if (savedData) {
                const data = JSON.parse(savedData);
                return {
                    trades: data.trades || [],
                    hasData: true
                };
            }
        } catch (error) {
            console.error('Erreur récupération données trades:', error);
        }
        return { trades: [], hasData: false };
    }
    
    calculateICTStepCorrelation(step1, step2, tradeData) {
        if (!tradeData.hasData || tradeData.trades.length === 0) {
            return 0;
        }
        
        const trades = tradeData.trades.filter(t => t.confluences && t.confluences[step1] && t.confluences[step2]);
        
        if (trades.length === 0) {
            return 0;
        }
        
        let positiveCorrelation = 0;
        let totalComparisons = 0;
        
        trades.forEach(trade => {
            const step1Value = this.getStepScore(trade.confluences[step1]);
            const step2Value = this.getStepScore(trade.confluences[step2]);
            const tradeResult = parseFloat(trade.pnl || 0) > 0 ? 1 : 0;
            
            if (step1Value >= 0.7 && step2Value >= 0.7 && tradeResult === 1) {
                positiveCorrelation++;
            }
            totalComparisons++;
        });
        
        const correlation = totalComparisons > 0 ? (positiveCorrelation / totalComparisons * 100) : 0;
        return Math.round(correlation);
    }
    
    getStepScore(stepValue) {
        const scores = {
            'Hausse + Discount': 0.9, 'Baisse + Premium': 0.9, 'Range': 0.5, 'Hausse + Premium': 0.3, 'Baisse + Discount': 0.3,
            'Order Block Valide': 0.9, 'Fair Value Gap': 0.8, 'Liquidity Grab': 0.7, 'Aucune Zone': 0.1,
            'CHOCH Confirmé': 0.9, 'BOS Confirmé': 0.8, 'Structure Unclear': 0.3, 'Faux Signal': 0.1,
            'Killzone Londres': 0.9, 'Killzone New York': 0.9, 'Overlap': 0.8, 'Hors Killzone': 0.2,
            'Pin Bar': 0.9, 'Doji': 0.8, 'Engulfing': 0.8, 'Signal Faible': 0.3,
            'R:R ≥ 1:3': 0.9, 'R:R = 1:2': 0.7, 'R:R < 1:2': 0.3, 'SL Trop Large': 0.1,
            'Plan Respecté': 0.9, 'Discipline OK': 0.8, 'Émotions Contrôlées': 0.7, 'Amélioration Nécessaire': 0.3
        };
        return scores[stepValue] || 0.5;
    }
    
    calculateICTStats(tradeData) {
        if (!tradeData.hasData || tradeData.trades.length === 0) {
            return { totalTrades: 0, completeSteps: 0, globalEfficiency: 0 };
        }
        
        const trades = tradeData.trades;
        const tradesWithSteps = trades.filter(t => t.confluences && Object.keys(t.confluences).length > 0);
        
        let totalStepsCompleted = 0;
        let totalPossibleSteps = 0;
        let winningTradesWithCompleteSteps = 0;
        
        tradesWithSteps.forEach(trade => {
            const stepCount = Object.keys(trade.confluences).length;
            totalStepsCompleted += stepCount;
            totalPossibleSteps += 7;
            
            if (stepCount === 7 && parseFloat(trade.pnl || 0) > 0) {
                winningTradesWithCompleteSteps++;
            }
        });
        
        const completeSteps = totalPossibleSteps > 0 ? Math.round((totalStepsCompleted / totalPossibleSteps) * 100) : 0;
        const globalEfficiency = tradesWithSteps.length > 0 ? Math.round((winningTradesWithCompleteSteps / tradesWithSteps.length) * 100) : 0;
        
        return { totalTrades: trades.length, completeSteps, globalEfficiency };
    }
    
    getICTCorrelationClass(value) {
        if (value >= 80) return 'ict-excellent';
        if (value >= 60) return 'ict-good';
        if (value >= 40) return 'ict-average';
        if (value >= 20) return 'ict-poor';
        return 'ict-none';
    }
    
    calculateRealCorrelations(conceptKeys) {
        const closedTrades = this.trades.filter(t => t.status === 'closed' && t.confluences);
        
        if (closedTrades.length === 0) {
            // Données par défaut si pas de trades
            return [
                [100, 50, 50, 50, 50, 50, 50],
                [50, 100, 50, 50, 50, 50, 50],
                [50, 50, 100, 50, 50, 50, 50],
                [50, 50, 50, 100, 50, 50, 50],
                [50, 50, 50, 50, 100, 50, 50],
                [50, 50, 50, 50, 50, 100, 50],
                [50, 50, 50, 50, 50, 50, 100]
            ];
        }
        
        const correlationMatrix = [];
        
        conceptKeys.forEach((key1, i) => {
            correlationMatrix[i] = [];
            conceptKeys.forEach((key2, j) => {
                if (i === j) {
                    correlationMatrix[i][j] = 100;
                } else {
                    const correlation = this.calculateStepCorrelation(key1, key2, closedTrades);
                    correlationMatrix[i][j] = correlation;
                }
            });
        });
        
        return correlationMatrix;
    }
    
    calculateStepCorrelation(step1, step2, trades) {
        let bothGoodAndWin = 0;
        let totalBothGood = 0;
        
        trades.forEach(trade => {
            const pnl = parseFloat(trade.pnl || 0);
            const isWinningTrade = pnl > 0;
            
            if (trade.confluences[step1] && trade.confluences[step2]) {
                const quality1 = this.getAnswerQuality(step1, trade.confluences[step1]);
                const quality2 = this.getAnswerQuality(step2, trade.confluences[step2]);
                
                // Si les deux étapes sont bien validées
                if (quality1 >= 0.7 && quality2 >= 0.7) {
                    totalBothGood++;
                    if (isWinningTrade) {
                        bothGoodAndWin++;
                    }
                }
            }
        });
        
        if (totalBothGood === 0) return 50;
        
        const correlation = (bothGoodAndWin / totalBothGood) * 100;
        return Math.round(correlation);
    }
    
    getAnswerQuality(conceptKey, answer) {
        // Définir la qualité des réponses pour chaque concept
        const qualityMap = {
            'contextGlobal': {
                'Hausse + Discount': 0.9,
                'Baisse + Premium': 0.9,
                'Hausse + Premium': 0.4,
                'Baisse + Discount': 0.4,
                'Range': 0.3
            },
            'zoneInstitutionnelle': {
                'Order Block Valide': 0.9,
                'Fair Value Gap': 0.8,
                'Liquidity Grab': 0.6,
                'Aucune Zone': 0.2
            },
            'structureMarche': {
                'CHOCH Confirmé': 0.9,
                'BOS Confirmé': 0.8,
                'Structure Unclear': 0.4,
                'Faux Signal': 0.1
            },
            'timingKillzones': {
                'Killzone Londres': 0.9,
                'Killzone New York': 0.9,
                'Overlap': 0.8,
                'Hors Killzone': 0.3
            },
            'signalEntree': {
                'Pin Bar': 0.9,
                'Doji': 0.7,
                'Engulfing': 0.8,
                'Signal Faible': 0.2
            },
            'riskManagement': {
                'R:R ≥ 1:3': 0.9,
                'R:R = 1:2': 0.7,
                'R:R < 1:2': 0.3,
                'SL Trop Large': 0.1
            },
            'discipline': {
                'Plan Respecté': 0.9,
                'Discipline OK': 0.8,
                'Émotions Contrôlées': 0.7,
                'Amélioration Nécessaire': 0.3
            }
        };
        
        return qualityMap[conceptKey]?.[answer] || 0.5;
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