// Mobile Optimizations - Misterpips
// Corrections spécifiques pour les appareils mobiles

(function() {
    'use strict';
    
    // Détection mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // Initialisation mobile
    document.addEventListener('DOMContentLoaded', function() {
        if (isMobile) {
            initMobileOptimizations();
            fixMobileChat();
            preventZoomOnInputs();
            optimizeTouchInteractions();
            fixViewportIssues();
        }
    });
    
    function initMobileOptimizations() {
        console.log('🔧 Initialisation optimisations mobile');
        
        // Ajouter classe mobile au body
        document.body.classList.add('mobile-device');
        if (isIOS) document.body.classList.add('ios-device');
        if (isAndroid) document.body.classList.add('android-device');
        
        // Optimiser les performances
        optimizePerformance();
        
        // Corriger les problèmes de scroll
        fixScrollIssues();
        
        // Améliorer les interactions tactiles
        improveTouchFeedback();
    }
    
    function fixMobileChat() {
        console.log('💬 Correction chat mobile');
        
        // Attendre que le chat soit initialisé
        const checkChatInterval = setInterval(() => {
            const chatInput = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendMessage');
            const chatWindow = document.getElementById('chatWindow');
            
            if (chatInput && sendBtn && chatWindow) {
                clearInterval(checkChatInterval);
                
                // Corriger l'envoi de messages
                fixMessageSending(chatInput, sendBtn);
                
                // Optimiser le clavier virtuel
                optimizeVirtualKeyboard(chatInput, chatWindow);
                
                // Améliorer la navigation tactile
                improveChatNavigation(chatWindow);
                
                console.log('✅ Chat mobile optimisé');
            }
        }, 500);
        
        // Arrêter après 10 secondes si pas trouvé
        setTimeout(() => clearInterval(checkChatInterval), 10000);
    }
    
    function fixMessageSending(chatInput, sendBtn) {
        // Supprimer les anciens event listeners
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        const newChatInput = chatInput.cloneNode(true);
        chatInput.parentNode.replaceChild(newChatInput, chatInput);
        
        // Ajouter nouveaux event listeners optimisés
        let isProcessing = false;
        
        function sendMessage() {
            if (isProcessing) return;
            
            const message = newChatInput.value.trim();
            if (!message) return;
            
            isProcessing = true;
            newSendBtn.disabled = true;
            newSendBtn.style.opacity = '0.6';
            
            // Appeler la fonction de chat VIP si disponible
            if (window.vipChat && typeof window.vipChat.sendMessage === 'function') {
                window.vipChat.sendMessage();
            } else {
                // Fallback simple
                console.log('Envoi message:', message);
                newChatInput.value = '';
            }
            
            // Réactiver après délai
            setTimeout(() => {
                isProcessing = false;
                newSendBtn.disabled = false;
                newSendBtn.style.opacity = '1';
            }, 1000);
        }
        
        // Event listeners tactiles
        newSendBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.95)';
        });
        
        newSendBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1)';
            sendMessage();
        });
        
        // Fallback pour click
        newSendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
        
        // Enter key
        newChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        console.log('📱 Envoi de messages optimisé pour mobile');
    }
    
    function optimizeVirtualKeyboard(chatInput, chatWindow) {
        let originalViewportHeight = window.innerHeight;
        
        chatInput.addEventListener('focus', function() {
            // Ajuster la fenêtre de chat quand le clavier apparaît
            setTimeout(() => {
                if (window.innerHeight < originalViewportHeight * 0.75) {
                    chatWindow.style.height = (window.innerHeight - 100) + 'px';
                    chatWindow.style.bottom = '0px';
                    
                    // Scroll vers le bas des messages
                    const chatMessages = document.getElementById('chatMessages');
                    if (chatMessages) {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                }
            }, 300);
        });
        
        chatInput.addEventListener('blur', function() {
            // Restaurer la taille normale
            setTimeout(() => {
                if (isMobile) {
                    chatWindow.style.height = '100vh';
                } else {
                    chatWindow.style.height = '500px';
                }
            }, 300);
        });
        
        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', function() {
            if (Math.abs(window.innerHeight - originalViewportHeight) > 150) {
                // Clavier probablement ouvert
                if (chatWindow.classList.contains('show')) {
                    chatWindow.style.height = window.innerHeight + 'px';
                }
            } else {
                // Clavier fermé
                originalViewportHeight = window.innerHeight;
                if (isMobile && chatWindow.classList.contains('show')) {
                    chatWindow.style.height = '100vh';
                }
            }
        });
    }
    
    function improveChatNavigation(chatWindow) {
        // Améliorer le swipe pour fermer
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        chatWindow.addEventListener('touchstart', function(e) {
            if (e.target === chatWindow || e.target.classList.contains('chat-header')) {
                startY = e.touches[0].clientY;
                isDragging = true;
            }
        });
        
        chatWindow.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) {
                // Glissement vers le bas
                chatWindow.style.transform = `translateY(${deltaY}px)`;
            }
        });
        
        chatWindow.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            
            const deltaY = currentY - startY;
            
            if (deltaY > 100) {
                // Fermer le chat
                chatWindow.classList.remove('show');
            }
            
            // Réinitialiser
            chatWindow.style.transform = '';
            isDragging = false;
        });
    }
    
    function preventZoomOnInputs() {
        // Empêcher le zoom sur les inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type !== 'file') {
                input.style.fontSize = '16px';
            }
        });
        
        // Observer pour les nouveaux inputs
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        const newInputs = node.querySelectorAll ? node.querySelectorAll('input, textarea, select') : [];
                        newInputs.forEach(input => {
                            if (input.type !== 'file') {
                                input.style.fontSize = '16px';
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    function optimizeTouchInteractions() {
        // Améliorer les interactions tactiles
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            input, textarea {
                -webkit-user-select: text;
                user-select: text;
            }
            
            button, .btn, a, .clickable {
                cursor: pointer;
                touch-action: manipulation;
            }
            
            .chat-message, .price-card, .session-card {
                touch-action: pan-y;
            }
        `;
        document.head.appendChild(style);
    }
    
    function fixScrollIssues() {
        // Corriger les problèmes de scroll sur mobile
        document.body.style.overscrollBehavior = 'none';
        
        // Smooth scrolling pour les éléments avec scroll
        const scrollElements = document.querySelectorAll('.chat-messages, .table-container, .modal-content');
        scrollElements.forEach(el => {
            el.style.webkitOverflowScrolling = 'touch';
            el.style.overscrollBehavior = 'contain';
        });
    }
    
    function fixViewportIssues() {
        // Corriger les problèmes de viewport
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        // Viewport adaptatif
        function updateViewport() {
            const isLandscape = window.innerWidth > window.innerHeight;
            if (isLandscape && isMobile) {
                viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            } else {
                viewportMeta.content = 'width=device-width, initial-scale=1.0';
            }
        }
        
        updateViewport();
        window.addEventListener('orientationchange', updateViewport);
        window.addEventListener('resize', updateViewport);
    }
    
    function optimizePerformance() {
        // Optimiser les performances sur mobile
        
        // Lazy loading pour les images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
        
        // Réduire les animations sur les appareils lents
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Optimiser les requêtes réseau
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Réduire la fréquence des mises à jour
                console.log('📶 Connexion lente détectée, optimisation activée');
                window.SLOW_CONNECTION = true;
            }
        }
    }
    
    function improveTouchFeedback() {
        // Améliorer le feedback tactile
        const interactiveElements = document.querySelectorAll('button, .btn, a, .clickable, .tool-btn, .send-btn');
        
        interactiveElements.forEach(el => {
            el.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
                this.style.opacity = '0.8';
            });
            
            el.addEventListener('touchend', function() {
                this.style.transform = '';
                this.style.opacity = '';
            });
            
            el.addEventListener('touchcancel', function() {
                this.style.transform = '';
                this.style.opacity = '';
            });
        });
    }
    
    // Fonction utilitaire pour déboguer sur mobile
    window.mobileDebug = function(message) {
        if (isMobile) {
            console.log('📱 Mobile Debug:', message);
            
            // Afficher aussi dans une div si nécessaire
            const debugDiv = document.getElementById('mobile-debug') || (() => {
                const div = document.createElement('div');
                div.id = 'mobile-debug';
                div.style.cssText = `
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 5px;
                    font-size: 12px;
                    z-index: 9999;
                    max-width: 200px;
                    word-wrap: break-word;
                `;
                document.body.appendChild(div);
                return div;
            })();
            
            debugDiv.textContent = message;
            setTimeout(() => debugDiv.textContent = '', 3000);
        }
    };
    
    // Exposer les fonctions utiles
    window.MobileOptimizations = {
        isMobile,
        isIOS,
        isAndroid,
        fixMobileChat,
        preventZoomOnInputs,
        optimizeTouchInteractions
    };
    
    console.log('🚀 Optimisations mobile chargées');
    
})();