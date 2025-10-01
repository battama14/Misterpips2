// Dashboard Mobile - Version optimisée tactile
class MobileTradingDashboard {
    constructor() {
        this.currentUser = sessionStorage.getItem('firebaseUID');
        this.currentAccount = 'compte1';
        this.trades = [];
        this.settings = { 
            capital: 1000, 
            riskPerTrade: 2,
            dailyTarget: 1,
            weeklyTarget: 3,
            monthlyTarget: 15
        };
        this.currentCalendarDate = new Date();
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateStats();
        this.renderTrades();
        this.renderCalendar();
        this.updateObjectives();
        this.initCharts();
        this.loadRanking();
    }

    async loadData() {
        try {
            if (window.firebaseDB) {
                const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const userRef = ref(window.firebaseDB, `dashboards/${this.currentUser}`);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    this.trades = data.trades || [];
                    this.settings = data.settings || this.settings;
                }
            } else {
                const savedData = localStorage.getItem(`dashboard_${this.currentUser}`);
                if (savedData) {
                    const data = JSON.parse(savedData);
                    this.trades = data.trades || [];
                    this.settings = data.settings || this.settings;
                }
            }
        } catch (error) {
            console.error('Erreur chargement données:', error);
        }
    }

    async saveData() {
        try {
            const data = {
                trades: this.trades,
                settings: this.settings,
                lastUpdated: new Date().toISOString()
            };

            if (window.firebaseDB) {
                const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const userRef = ref(window.firebaseDB, `dashboards/${this.currentUser}`);
                await set(userRef, data);
            }
            
            localStorage.setItem(`dashboard_${this.currentUser}`, JSON.stringify(data));
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        }
    }

    setupEventListeners() {
        // Menu mobile
        document.getElementById('menuToggle').onclick = () => {
            document.getElementById('mobileMenu').classList.add('open');
        };

        document.getElementById('closeMenu').onclick = () => {
            document.getElementById('mobileMenu').classList.remove('open');
        };

        // Modal trade
        document.getElementById('newTradeBtn').onclick = () => this.showTradeModal();
        document.getElementById('addTradeBtn').onclick = () => this.showTradeModal();
        document.getElementById('closeTradeModal').onclick = () => this.hideTradeModal();
        document.getElementById('saveMobileTradeBtn').onclick = () => this.saveTrade();

        // Calendrier
        document.getElementById('prevMonthMobile').onclick = () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
            this.renderCalendar();
        };

        document.getElementById('nextMonthMobile').onclick = () => {
            this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
            this.renderCalendar();
        };

        // Paramètres
        document.getElementById('saveSettingsBtn').onclick = () => this.saveSettings();

        // Chat mobile
        document.getElementById('mobileChatToggle').onclick = () => {
            document.getElementById('mobileChatWindow').classList.toggle('show');
        };

        document.getElementById('closeMobileChat').onclick = () => {
            document.getElementById('mobileChatWindow').classList.remove('show');
        };

        document.getElementById('sendMobileMessage').onclick = () => this.sendChatMessage();
        
        document.getElementById('mobileChatInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        };

        // Fermer menu en touchant ailleurs
        document.onclick = (e) => {
            const menu = document.getElementById('mobileMenu');
            const menuBtn = document.getElementById('menuToggle');
            if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
                menu.classList.remove('open');
            }
        };
    }

    updateStats() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const winRate = closedTrades.length > 0 ? 
            (closedTrades.filter(t => parseFloat(t.pnl || 0) > 0).length / closedTrades.length * 100).toFixed(1) : 0;
        const currentCapital = this.settings.capital + totalPnL;

        document.getElementById('mobileCapital').textContent = `$${currentCapital.toFixed(2)}`;
        document.getElementById('mobileWinRate').textContent = `${winRate}%`;
        document.getElementById('mobilePnL').textContent = `$${totalPnL.toFixed(2)}`;
        
        // Couleurs
        const pnlElement = document.getElementById('mobilePnL');
        pnlElement.className = totalPnL >= 0 ? 'stat-value positive' : 'stat-value negative';
    }

    renderTrades() {
        const container = document.getElementById('mobileTradesList');
        const recentTrades = this.trades.slice(-10).reverse();

        container.innerHTML = recentTrades.map(trade => {
            const pnl = parseFloat(trade.pnl || 0);
            const pnlClass = pnl > 0 ? 'positive' : pnl < 0 ? 'negative' : '';
            
            return `
                <div class="trade-card">
                    <div class="trade-header">
                        <span class="trade-pair">${trade.currency}</span>
                        <span class="trade-status ${trade.status}">${trade.status.toUpperCase()}</span>
                    </div>
                    <div class="trade-details">
                        <div class="trade-detail">
                            <span class="trade-detail-label">Date:</span>
                            <span>${trade.date}</span>
                        </div>
                        <div class="trade-detail">
                            <span class="trade-detail-label">Entrée:</span>
                            <span>${trade.entryPoint}</span>
                        </div>
                        <div class="trade-detail">
                            <span class="trade-detail-label">Lot:</span>
                            <span>${trade.lotSize}</span>
                        </div>
                        <div class="trade-detail">
                            <span class="trade-detail-label">P&L:</span>
                            <span class="trade-pnl ${pnlClass}">$${pnl.toFixed(2)}</span>
                        </div>
                    </div>
                    ${trade.status === 'open' ? `
                        <div class="trade-actions">
                            <button class="action-btn edit" onclick="mobileDashboard.editTrade(${this.trades.indexOf(trade)})">✏️ Modifier</button>
                            <button class="action-btn close" onclick="mobileDashboard.closeTrade(${this.trades.indexOf(trade)})">🔒 Clôturer</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    renderCalendar() {
        const container = document.getElementById('mobileCalendar');
        const monthYear = document.getElementById('monthYearMobile');
        
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        monthYear.textContent = new Intl.DateTimeFormat('fr-FR', { 
            month: 'long', 
            year: 'numeric' 
        }).format(this.currentCalendarDate);

        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '';
        
        // En-têtes des jours
        ['D', 'L', 'M', 'M', 'J', 'V', 'S'].forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Jours du calendrier
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateStr = currentDate.getFullYear() + '-' + 
                String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                String(currentDate.getDate()).padStart(2, '0');
            
            const dayTrades = this.trades.filter(t => t.date === dateStr && t.status === 'closed');
            const dayPnL = dayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
            
            let dayClass = 'calendar-day';
            if (currentDate.getMonth() !== month) dayClass += ' other-month';
            if (dayTrades.length > 0) {
                dayClass += ' has-trades';
                if (dayPnL > 0) dayClass += ' profit-day';
                else if (dayPnL < 0) dayClass += ' loss-day';
            }

            html += `
                <div class="${dayClass}">
                    <div class="calendar-date">${currentDate.getDate()}</div>
                    ${dayTrades.length > 0 ? `<div class="calendar-pnl">$${dayPnL.toFixed(0)}</div>` : ''}
                </div>
            `;
        }

        container.innerHTML = html;
    }

    updateObjectives() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const currentCapital = this.settings.capital + totalPnL;

        // Objectifs en dollars
        const dailyTarget = (currentCapital * this.settings.dailyTarget / 100);
        const weeklyTarget = (currentCapital * this.settings.weeklyTarget / 100);
        const monthlyTarget = (currentCapital * this.settings.monthlyTarget / 100);

        // P&L aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const todayTrades = this.trades.filter(t => t.date === today && t.status === 'closed');
        const todayPnL = todayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);

        // Progrès
        const dailyProgress = dailyTarget > 0 ? Math.min((todayPnL / dailyTarget) * 100, 100) : 0;

        // Mise à jour des éléments
        document.getElementById('mobileDailyTarget').textContent = `$${dailyTarget.toFixed(0)}`;
        document.getElementById('mobileWeeklyTarget').textContent = `$${weeklyTarget.toFixed(0)}`;
        document.getElementById('mobileMonthlyTarget').textContent = `$${monthlyTarget.toFixed(0)}`;

        document.getElementById('mobileDailyProgress').style.width = `${dailyProgress}%`;
        document.getElementById('mobileDailyPercent').textContent = `${dailyProgress.toFixed(1)}%`;
    }

    initCharts() {
        this.initPerformanceChart();
        this.initWinRateChart();
    }

    initPerformanceChart() {
        const ctx = document.getElementById('mobilePerformanceChart');
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
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
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
        const ctx = document.getElementById('mobileWinRateChart');
        if (!ctx) return;

        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const wins = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0).length;
        const losses = closedTrades.length - wins;

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
                plugins: { legend: { display: false } }
            }
        });
    }

    async loadRanking() {
        const container = document.getElementById('mobileRankingList');
        
        try {
            if (window.firebaseDB) {
                const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const usersRef = ref(window.firebaseDB, 'users');
                const snapshot = await get(usersRef);
                
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    const rankings = await this.calculateRankings(users);
                    this.displayRanking(rankings);
                    return;
                }
            }
        } catch (error) {
            console.error('Erreur chargement classement:', error);
        }

        // Données de démonstration
        const demoRankings = [
            { name: 'Trader Pro', dailyPnL: 250.50, tradeCount: 8 },
            { name: 'Expert FX', dailyPnL: 180.25, tradeCount: 5 },
            { name: 'Vous', dailyPnL: 0, tradeCount: 0 },
            { name: 'Master Pips', dailyPnL: -45.30, tradeCount: 15 }
        ];
        
        this.displayRanking(demoRankings);
    }

    async calculateRankings(users) {
        const today = new Date().toISOString().split('T')[0];
        const rankings = [];
        
        for (const [userId, userData] of Object.entries(users)) {
            if (userData.isVIP) {
                const { dailyPnL, tradeCount } = await this.getUserStats(userId, today);
                const displayName = userData.nickname || userData.email?.split('@')[0] || 'Membre VIP';
                rankings.push({
                    name: displayName,
                    dailyPnL,
                    tradeCount,
                    userId
                });
            }
        }
        
        rankings.sort((a, b) => b.dailyPnL - a.dailyPnL);
        return rankings;
    }

    async getUserStats(userId, date) {
        try {
            if (window.firebaseDB) {
                const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const tradesRef = ref(window.firebaseDB, `dashboards/${userId}/trades`);
                const snapshot = await get(tradesRef);
                
                if (snapshot.exists()) {
                    const trades = snapshot.val();
                    const todayTrades = trades.filter(t => t.date === date && t.status === 'closed');
                    const dailyPnL = todayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
                    return { dailyPnL, tradeCount: todayTrades.length };
                }
            }
        } catch (error) {
            console.error('Erreur stats utilisateur:', error);
        }
        return { dailyPnL: 0, tradeCount: 0 };
    }

    displayRanking(rankings) {
        const container = document.getElementById('mobileRankingList');
        
        container.innerHTML = rankings.map((trader, index) => {
            const isCurrentUser = trader.userId === this.currentUser || trader.name === 'Vous';
            const pnlClass = trader.dailyPnL > 0 ? 'positive' : trader.dailyPnL < 0 ? 'negative' : '';
            
            return `
                <div class="ranking-item ${isCurrentUser ? 'current-user' : ''}">
                    <div class="ranking-position">${index + 1}</div>
                    <div class="ranking-info">
                        <div class="ranking-name">${trader.name}${isCurrentUser ? ' (Vous)' : ''}</div>
                        <div class="ranking-trades">${trader.tradeCount} trades</div>
                    </div>
                    <div class="ranking-pnl ${pnlClass}">$${trader.dailyPnL.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }

    showTradeModal() {
        document.getElementById('mobileTradeModal').classList.add('show');
    }

    hideTradeModal() {
        document.getElementById('mobileTradeModal').classList.remove('show');
        document.getElementById('mobileTradeForm').reset();
    }

    async saveTrade() {
        const currency = document.getElementById('mobileCurrency').value;
        const entryPoint = parseFloat(document.getElementById('mobileEntryPoint').value);
        const stopLoss = parseFloat(document.getElementById('mobileStopLoss').value);
        const takeProfit = parseFloat(document.getElementById('mobileTakeProfit').value);
        const lotSize = parseFloat(document.getElementById('mobileLotSize').value);

        if (!currency || !entryPoint || !stopLoss || !takeProfit || !lotSize) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        const trade = {
            id: `${this.currentUser}_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
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
        await this.saveData();
        this.hideTradeModal();
        this.updateAll();
        this.showNotification('Trade ajouté !');
    }

    async closeTrade(index) {
        const result = prompt('Résultat (TP/SL/BE):', 'TP');
        if (!result) return;

        const trade = this.trades[index];
        trade.result = result.toUpperCase();
        trade.status = 'closed';
        
        if (result === 'TP') {
            trade.closePrice = trade.takeProfit;
        } else if (result === 'SL') {
            trade.closePrice = trade.stopLoss;
        } else {
            trade.closePrice = trade.entryPoint;
        }
        
        trade.pnl = this.calculatePnL(trade);
        
        await this.saveData();
        this.updateAll();
        this.showNotification(`Trade clôturé en ${result}`);
    }

    calculatePnL(trade) {
        const entryPoint = parseFloat(trade.entryPoint);
        const closePrice = parseFloat(trade.closePrice);
        const lotSize = parseFloat(trade.lotSize);
        
        if (!entryPoint || !closePrice || !lotSize) return 0;
        
        let priceDiff = closePrice - entryPoint;
        const isLong = parseFloat(trade.takeProfit) > entryPoint;
        if (!isLong) priceDiff = -priceDiff;
        
        let pnl = 0;
        if (trade.currency === 'XAU/USD') {
            pnl = priceDiff * lotSize * 100;
        } else if (trade.currency.includes('JPY')) {
            pnl = priceDiff * 100 * lotSize * 10;
        } else {
            pnl = priceDiff * 10000 * lotSize * 10;
        }
        
        return parseFloat(pnl.toFixed(2));
    }

    async saveSettings() {
        this.settings.capital = parseFloat(document.getElementById('mobileCapitalInput').value) || 1000;
        this.settings.riskPerTrade = parseFloat(document.getElementById('mobileRiskInput').value) || 2;
        this.settings.dailyTarget = parseFloat(document.getElementById('mobileDailyTargetInput').value) || 1;
        
        await this.saveData();
        this.updateAll();
        this.showNotification('Paramètres sauvegardés !');
    }

    async sendChatMessage() {
        const input = document.getElementById('mobileChatInput');
        const message = input.value.trim();
        if (!message) return;

        try {
            if (window.firebaseDB) {
                const { ref, push } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const messagesRef = ref(window.firebaseDB, 'vip_chat');
                
                await push(messagesRef, {
                    userId: this.currentUser,
                    nickname: 'Mobile User',
                    message: message,
                    timestamp: Date.now(),
                    date: new Date().toISOString().split('T')[0]
                });
                
                input.value = '';
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
        }
    }

    updateAll() {
        this.updateStats();
        this.renderTrades();
        this.renderCalendar();
        this.updateObjectives();
        this.loadRanking();
        
        // Recréer les graphiques
        setTimeout(() => {
            this.initCharts();
        }, 100);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #00d4ff, #5b86e5);
            color: white;
            padding: 15px 20px;
            border-radius: 25px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Navigation entre sections
function showSection(sectionId) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Afficher la section demandée
    document.getElementById(sectionId).classList.add('active');
    
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
    
    // Fermer le menu mobile
    document.getElementById('mobileMenu').classList.remove('open');
}

// Initialisation
let mobileDashboard;

document.addEventListener('DOMContentLoaded', () => {
    // Attendre l'authentification Firebase
    const checkAuth = setInterval(() => {
        const firebaseUID = sessionStorage.getItem('firebaseUID');
        if (firebaseUID) {
            mobileDashboard = new MobileTradingDashboard();
            window.mobileDashboard = mobileDashboard;
            clearInterval(checkAuth);
        }
    }, 100);
});

console.log('Mobile dashboard script loaded');