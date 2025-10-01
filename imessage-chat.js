// Chat Ultra-Performant Style iMessage
class iMessageChat {
    constructor() {
        this.currentUser = sessionStorage.getItem('firebaseUID') || 'user_' + Date.now();
        this.nickname = null;
        this.messages = [];
        this.typingUsers = new Set();
        this.lastMessageTime = 0;
        this.messageCache = new Map();
        this.isTyping = false;
        this.typingTimeout = null;
        this.virtualScrollOffset = 0;
        this.visibleMessages = 50;
        
        this.init();
    }
    
    async init() {
        this.nickname = await this.getNickname();
        this.createChatUI();
        this.setupEventListeners();
        this.loadMessages();
        this.setupRealtimeListener();
        this.startPerformanceOptimizations();
    }
    
    createChatUI() {
        // Remplacer l'ancien chat par le nouveau
        const oldChat = document.getElementById('chatWindow');
        const oldToggle = document.getElementById('chatToggle');
        
        if (oldChat) oldChat.remove();
        if (oldToggle) oldToggle.remove();
        
        // Créer le nouveau chat
        const chatHTML = `
            <div id="chatToggle" class="chat-toggle">
                💬
                <div id="chatBadge" class="chat-badge" style="display: none;">0</div>
            </div>
            
            <div id="chatWindow" class="chat-window">
                <div class="chat-header">
                    <div>
                        <h4>💬 Chat VIP</h4>
                        <div class="chat-status">
                            <div class="status-dot"></div>
                            <span id="chatStatus">En ligne</span>
                        </div>
                    </div>
                    <div class="chat-controls">
                        <button class="chat-control-btn" id="chatSettings" title="Paramètres">⚙️</button>
                        <button class="chat-control-btn" id="closeChatBtn" title="Fermer">✕</button>
                    </div>
                </div>
                
                <div class="chat-messages" id="chatMessages">
                    <div class="welcome-message">
                        <div class="message-bubble other">
                            <div class="message-author">Misterpips Bot</div>
                            Bienvenue dans le chat VIP ! 🚀
                            <div class="message-time">Maintenant</div>
                        </div>
                    </div>
                </div>
                
                <div id="typingIndicator" class="typing-indicator" style="display: none;">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    <span id="typingText">Quelqu'un écrit...</span>
                </div>
                
                <div class="chat-input-area">
                    <div class="input-container">
                        <div class="input-actions">
                            <button class="input-action-btn" id="emojiBtn" title="Emojis">😀</button>
                            <button class="input-action-btn" id="attachBtn" title="Fichier">📎</button>
                        </div>
                        <textarea 
                            id="chatInput" 
                            class="chat-input" 
                            placeholder="Tapez votre message..."
                            rows="1"
                            maxlength="500"
                        ></textarea>
                        <button id="sendBtn" class="send-btn input-action-btn" title="Envoyer">
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }
    
    setupEventListeners() {
        const chatToggle = document.getElementById('chatToggle');
        const chatWindow = document.getElementById('chatWindow');
        const closeChatBtn = document.getElementById('closeChatBtn');
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const emojiBtn = document.getElementById('emojiBtn');
        const attachBtn = document.getElementById('attachBtn');
        const chatSettings = document.getElementById('chatSettings');
        
        // Toggle chat
        chatToggle.addEventListener('click', () => this.toggleChat());
        closeChatBtn.addEventListener('click', () => this.closeChat());
        
        // Input handling avec debouncing
        chatInput.addEventListener('input', this.debounce(() => {
            this.handleInputChange();
        }, 100));
        
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        emojiBtn.addEventListener('click', () => this.toggleEmojiPanel());
        attachBtn.addEventListener('click', () => this.handleFileAttachment());
        chatSettings.addEventListener('click', () => this.showSettings());
        chatInput.addEventListener('input', () => this.autoResizeTextarea());
        this.setupMessageReactions();
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    handleInputChange() {
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (input.value.trim()) {
            sendBtn.classList.add('active');
        } else {
            sendBtn.classList.remove('active');
        }
        
        this.sendTypingIndicator();
    }
    
    autoResizeTextarea() {
        const textarea = document.getElementById('chatInput');
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 100);
        textarea.style.height = newHeight + 'px';
    }
    
    sendTypingIndicator() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.broadcastTyping(true);
        }
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.broadcastTyping(false);
        }, 2000);
    }
    
    async broadcastTyping(isTyping) {
        try {
            if (window.firebaseDB) {
                const { ref, set, remove } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const typingRef = ref(window.firebaseDB, `chat_typing/${this.currentUser}`);
                
                if (isTyping) {
                    await set(typingRef, {
                        nickname: this.nickname,
                        timestamp: Date.now()
                    });
                } else {
                    await remove(typingRef);
                }
            }
        } catch (error) {
            console.error('Erreur indicateur frappe:', error);
        }
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        const sendBtn = document.getElementById('sendBtn');
        sendBtn.style.transform = 'scale(0.8)';
        setTimeout(() => {
            sendBtn.style.transform = 'scale(1)';
        }, 150);
        
        input.value = '';
        sendBtn.classList.remove('active');
        this.autoResizeTextarea();
        
        this.isTyping = false;
        this.broadcastTyping(false);
        
        const messageData = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: this.currentUser,
            nickname: this.nickname,
            message: message,
            timestamp: Date.now(),
            type: 'text'
        };
        
        this.addMessageToUI(messageData, true);
        
        try {
            if (window.firebaseDB) {
                const { ref, push } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const messagesRef = ref(window.firebaseDB, 'vip_chat_v2');
                await push(messagesRef, messageData);
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
            this.showErrorMessage('Erreur d\'envoi. Vérifiez votre connexion.');
        }
    }
    
    addMessageToUI(messageData, isOptimistic = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const isOwn = messageData.userId === this.currentUser;
        
        const lastMessageGroup = messagesContainer.lastElementChild;
        const shouldGroup = lastMessageGroup && 
            lastMessageGroup.dataset.userId === messageData.userId &&
            (messageData.timestamp - parseInt(lastMessageGroup.dataset.timestamp)) < 60000;
        
        let messageElement;
        
        if (shouldGroup && !lastMessageGroup.classList.contains('welcome-message')) {
            messageElement = this.createMessageBubble(messageData, isOwn, false);
            lastMessageGroup.appendChild(messageElement);
        } else {
            const messageGroup = document.createElement('div');
            messageGroup.className = 'message-group';
            messageGroup.dataset.userId = messageData.userId;
            messageGroup.dataset.timestamp = messageData.timestamp;
            
            messageElement = this.createMessageBubble(messageData, isOwn, true);
            messageGroup.appendChild(messageElement);
            messagesContainer.appendChild(messageGroup);
        }
        
        if (isOptimistic) {
            messageElement.style.opacity = '0.7';
            messageElement.style.transform = 'scale(0.95)';
        }
        
        this.scrollToBottom();
        
        if ('vibrate' in navigator && isOwn) {
            navigator.vibrate(50);
        }
    }
    
    createMessageBubble(messageData, isOwn, showAuthor) {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${isOwn ? 'own' : 'other'}`;
        bubble.dataset.messageId = messageData.id;
        
        const timeStr = this.formatTime(messageData.timestamp);
        
        let content = '';
        if (showAuthor && !isOwn) {
            content += `<div class="message-author">${messageData.nickname}</div>`;
        }
        
        content += `
            <div class="message-content">${this.formatMessage(messageData.message)}</div>
            <div class="message-time">${timeStr}</div>
        `;
        
        bubble.innerHTML = content;
        this.setupBubbleReactions(bubble);
        
        return bubble;
    }
    
    formatMessage(message) {
        return message
            .replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank" rel="noopener">$&</a>')
            .replace(/\n/g, '<br>');
    }
    
    formatTime(timestamp) {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffMinutes = Math.floor((now - messageTime) / 60000);
        
        if (diffMinutes < 1) return 'Maintenant';
        if (diffMinutes < 60) return `${diffMinutes}min`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
        
        return messageTime.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    setupBubbleReactions(bubble) {
        let longPressTimer;
        
        bubble.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                this.showReactionsPanel(bubble, e.touches[0]);
            }, 500);
        });
        
        bubble.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        
        bubble.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showReactionsPanel(bubble, e);
        });
    }
    
    showReactionsPanel(bubble, event) {
        const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
        
        const panel = document.createElement('div');
        panel.className = 'reactions-panel show';
        
        reactions.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'reaction-btn';
            btn.textContent = emoji;
            btn.onclick = () => {
                this.addReaction(bubble.dataset.messageId, emoji);
                panel.remove();
            };
            panel.appendChild(btn);
        });
        
        bubble.appendChild(panel);
        
        setTimeout(() => {
            if (panel.parentNode) panel.remove();
        }, 3000);
    }
    
    async addReaction(messageId, emoji) {
        try {
            if (window.firebaseDB) {
                const { ref, push } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const reactionsRef = ref(window.firebaseDB, `message_reactions/${messageId}`);
                await push(reactionsRef, {
                    userId: this.currentUser,
                    emoji: emoji,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Erreur ajout réaction:', error);
        }
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
    
    toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        const isOpen = chatWindow.classList.contains('show');
        
        if (isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');
        
        chatWindow.classList.add('show');
        chatToggle.style.display = 'none';
        
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 400);
        
        this.markAsRead();
    }
    
    closeChat() {
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');
        
        chatWindow.classList.remove('show');
        chatToggle.style.display = 'flex';
    }
    
    markAsRead() {
        const badge = document.getElementById('chatBadge');
        badge.style.display = 'none';
        badge.textContent = '0';
        this.lastMessageTime = Date.now();
    }
    
    updateBadge(count) {
        const badge = document.getElementById('chatBadge');
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    async getNickname() {
        try {
            if (window.firebaseDB) {
                const { ref, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const nicknameRef = ref(window.firebaseDB, `users/${this.currentUser}/nickname`);
                const snapshot = await get(nicknameRef);
                
                if (snapshot.exists()) {
                    return snapshot.val();
                }
            }
        } catch (error) {
            console.error('Erreur récupération pseudo:', error);
        }
        
        return 'Membre VIP';
    }
    
    async loadMessages() {
        try {
            if (window.firebaseDB) {
                const { ref, query, orderByKey, limitToLast, get } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                const messagesRef = ref(window.firebaseDB, 'vip_chat_v2');
                const recentMessagesQuery = query(messagesRef, orderByKey(), limitToLast(this.visibleMessages));
                const snapshot = await get(recentMessagesQuery);
                
                if (snapshot.exists()) {
                    const messages = Object.values(snapshot.val());
                    this.renderMessages(messages);
                }
            }
        } catch (error) {
            console.error('Erreur chargement messages:', error);
        }
    }
    
    renderMessages(messages) {
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        messagesContainer.innerHTML = '';
        if (welcomeMessage) messagesContainer.appendChild(welcomeMessage);
        
        messages.forEach(message => {
            this.addMessageToUI(message, false);
        });
    }
    
    async setupRealtimeListener() {
        try {
            if (window.firebaseDB) {
                const { ref, query, orderByKey, limitToLast, onValue } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                
                const messagesRef = ref(window.firebaseDB, 'vip_chat_v2');
                const recentMessagesQuery = query(messagesRef, orderByKey(), limitToLast(this.visibleMessages));
                
                onValue(recentMessagesQuery, (snapshot) => {
                    if (snapshot.exists()) {
                        const messages = Object.values(snapshot.val());
                        const newMessages = messages.filter(msg => msg.timestamp > this.lastMessageTime);
                        
                        newMessages.forEach(message => {
                            if (message.userId !== this.currentUser) {
                                this.addMessageToUI(message, false);
                                this.showNotification(message);
                            }
                        });
                    }
                });
                
                const typingRef = ref(window.firebaseDB, 'chat_typing');
                onValue(typingRef, (snapshot) => {
                    this.updateTypingIndicator(snapshot.val());
                });
            }
        } catch (error) {
            console.error('Erreur listener temps réel:', error);
        }
    }
    
    updateTypingIndicator(typingData) {
        const indicator = document.getElementById('typingIndicator');
        const typingText = document.getElementById('typingText');
        
        if (!typingData) {
            indicator.style.display = 'none';
            return;
        }
        
        const typingUsers = Object.entries(typingData)
            .filter(([userId, data]) => userId !== this.currentUser && (Date.now() - data.timestamp) < 3000)
            .map(([userId, data]) => data.nickname);
        
        if (typingUsers.length > 0) {
            const text = typingUsers.length === 1 
                ? `${typingUsers[0]} écrit...`
                : `${typingUsers.length} personnes écrivent...`;
            typingText.textContent = text;
            indicator.style.display = 'flex';
        } else {
            indicator.style.display = 'none';
        }
    }
    
    showNotification(message) {
        const chatWindow = document.getElementById('chatWindow');
        const isOpen = chatWindow.classList.contains('show');
        
        if (!isOpen) {
            this.updateBadge(1);
            
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`💬 ${message.nickname}`, {
                    body: message.message.substring(0, 50),
                    icon: '/Misterpips.jpg',
                    tag: 'vip-chat'
                });
            }
        }
    }
    
    startPerformanceOptimizations() {
        setInterval(() => {
            if (this.messageCache.size > 1000) {
                const entries = Array.from(this.messageCache.entries());
                entries.slice(0, 500).forEach(([key]) => {
                    this.messageCache.delete(key);
                });
            }
        }, 300000);
        
        const messagesContainer = document.getElementById('chatMessages');
        let scrollTimeout;
        messagesContainer.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleVirtualScroll();
            }, 100);
        });
    }
    
    handleVirtualScroll() {
        const messagesContainer = document.getElementById('chatMessages');
        const messages = messagesContainer.querySelectorAll('.message-group');
        
        if (messages.length > this.visibleMessages) {
            const scrollTop = messagesContainer.scrollTop;
            const containerHeight = messagesContainer.clientHeight;
            
            messages.forEach((message, index) => {
                const messageTop = message.offsetTop;
                const messageHeight = message.offsetHeight;
                
                if (messageTop + messageHeight < scrollTop - containerHeight ||
                    messageTop > scrollTop + containerHeight * 2) {
                    message.style.display = 'none';
                } else {
                    message.style.display = 'block';
                }
            });
        }
    }
    
    toggleEmojiPanel() {
        const emojis = ['😀', '😂', '❤️', '👍', '🔥', '💯', '🚀', '💰', '📈', '🎯'];
        const input = document.getElementById('chatInput');
        
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        input.value += randomEmoji;
        this.handleInputChange();
        input.focus();
    }
    
    handleFileAttachment() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.size < 5 * 1024 * 1024) {
                this.sendFileMessage(file);
            } else {
                alert('Fichier trop volumineux (max 5MB)');
            }
        };
        input.click();
    }
    
    async sendFileMessage(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const messageData = {
                id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: this.currentUser,
                nickname: this.nickname,
                message: `📎 ${file.name}`,
                timestamp: Date.now(),
                type: 'file',
                fileData: e.target.result,
                fileName: file.name,
                fileType: file.type
            };
            
            this.addMessageToUI(messageData, true);
            
            try {
                if (window.firebaseDB) {
                    const { ref, push } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');
                    const messagesRef = ref(window.firebaseDB, 'vip_chat_v2');
                    await push(messagesRef, messageData);
                }
            } catch (error) {
                console.error('Erreur envoi fichier:', error);
            }
        };
        reader.readAsDataURL(file);
    }
    
    showSettings() {
        alert('Paramètres du chat - À implémenter');
    }
    
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff3b30;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }\n}\n\n// Initialisation automatique\ndocument.addEventListener('DOMContentLoaded', () => {\n    // Attendre que Firebase soit prêt\n    setTimeout(() => {\n        if (sessionStorage.getItem('firebaseUID')) {\n            console.log('🚀 Initialisation iMessage Chat...');
        window.iMessageChat = new iMessageChat();
        console.log('✅ iMessage Chat créé');\n        }\n    }, 2000);\n});