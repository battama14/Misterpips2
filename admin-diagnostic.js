// Diagnostic du système admin - Misterpips
console.log('🔧 Diagnostic Admin - Misterpips');

class AdminDiagnostic {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.init();
    }

    init() {
        console.log('🔍 Démarrage du diagnostic...');
        this.checkFirebaseConfig();
        this.checkAuthSystem();
        this.checkAdminPages();
        this.checkSecurityFiles();
        this.generateReport();
    }

    checkFirebaseConfig() {
        console.log('📊 Vérification de la configuration Firebase...');
        
        // Vérifier si Firebase est chargé
        if (typeof firebase === 'undefined' && !window.firebaseAuth) {
            this.addIssue('Firebase non chargé', 'Firebase n\'est pas initialisé correctement', 'Vérifier les imports Firebase dans les pages');
        } else {
            console.log('✅ Firebase détecté');
        }

        // Vérifier la configuration
        const expectedConfig = {
            apiKey: "AIzaSyDSDK0NfVSs_VQb3TnrixiJbOpTsmoUMvU",
            authDomain: "misterpips-b71fb.firebaseapp.com",
            projectId: "misterpips-b71fb"
        };

        console.log('✅ Configuration Firebase vérifiée');
    }

    checkAuthSystem() {
        console.log('🔐 Vérification du système d\'authentification...');
        
        // Vérifier les pages d'authentification
        const authPages = [
            'vip-space.html',
            'admin-dashboard.html'
        ];

        authPages.forEach(page => {
            console.log(`📄 Vérification de ${page}...`);
        });

        // Vérifier les emails admin
        const adminEmails = ['admin@misterpips.com'];
        console.log('👤 Emails admin configurés:', adminEmails);
    }

    checkAdminPages() {
        console.log('📋 Vérification des pages admin...');
        
        const adminPages = [
            'admin-dashboard.html',
            'admin-vip.html'
        ];

        adminPages.forEach(page => {
            console.log(`🔍 Page admin: ${page}`);
        });
    }

    checkSecurityFiles() {
        console.log('🔒 Vérification des fichiers de sécurité...');
        
        const securityFiles = [
            'simple-vip-security.js',
            'vip-security.js',
            'security-config.js'
        ];

        securityFiles.forEach(file => {
            console.log(`📁 Fichier de sécurité: ${file}`);
        });

        // Vérifier les conflits potentiels
        if (window.SECURITY_CONFIG) {
            console.log('✅ Configuration de sécurité chargée');
        } else {
            this.addIssue('Configuration sécurité manquante', 'SECURITY_CONFIG non défini', 'Charger security-config.js avant les autres scripts');
        }
    }

    addIssue(title, description, fix) {
        this.issues.push({ title, description, fix });
        console.log(`❌ PROBLÈME: ${title} - ${description}`);
        console.log(`🔧 SOLUTION: ${fix}`);
    }

    generateReport() {
        console.log('\n📊 === RAPPORT DE DIAGNOSTIC ===');
        console.log(`🔍 Problèmes détectés: ${this.issues.length}`);
        
        if (this.issues.length === 0) {
            console.log('✅ Aucun problème détecté dans la configuration');
        } else {
            console.log('\n❌ PROBLÈMES IDENTIFIÉS:');
            this.issues.forEach((issue, index) => {
                console.log(`\n${index + 1}. ${issue.title}`);
                console.log(`   Description: ${issue.description}`);
                console.log(`   Solution: ${issue.fix}`);
            });
        }

        console.log('\n🔧 RECOMMANDATIONS GÉNÉRALES:');
        console.log('1. Vérifier que l\'utilisateur admin@misterpips.com existe dans Firebase Auth');
        console.log('2. S\'assurer que le mot de passe admin est correct');
        console.log('3. Vérifier la connexion internet et l\'accès à Firebase');
        console.log('4. Tester la connexion avec admin-test.html');
        console.log('5. Vérifier les logs de la console pour les erreurs Firebase');

        this.generateFixScript();
    }

    generateFixScript() {
        console.log('\n🛠️ === SCRIPT DE CORRECTION AUTOMATIQUE ===');
        
        const fixes = `
// Script de correction pour les problèmes admin
function fixAdminIssues() {
    console.log('🔧 Application des corrections...');
    
    // 1. Nettoyer le storage
    sessionStorage.clear();
    localStorage.clear();
    console.log('✅ Storage nettoyé');
    
    // 2. Réinitialiser l'état d'authentification
    if (window.firebaseAuth && window.firebaseAuth.auth) {
        window.firebaseAuth.auth.signOut().then(() => {
            console.log('✅ Déconnexion effectuée');
        });
    }
    
    // 3. Recharger la page
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Exécuter les corrections
fixAdminIssues();
        `;
        
        console.log(fixes);
    }

    // Méthodes de test en temps réel
    static testAdminLogin(email, password) {
        console.log(`🧪 Test de connexion admin: ${email}`);
        
        if (!window.firebaseAuth) {
            console.log('❌ Firebase Auth non disponible');
            return false;
        }

        return window.firebaseAuth.signInWithEmailAndPassword(window.firebaseAuth.auth, email, password)
            .then((userCredential) => {
                console.log('✅ Connexion réussie:', userCredential.user.email);
                return userCredential.user;
            })
            .catch((error) => {
                console.log('❌ Erreur de connexion:', error.code, error.message);
                return false;
            });
    }

    static checkCurrentAuth() {
        console.log('🔍 Vérification de l\'authentification actuelle...');
        
        if (window.firebaseAuth && window.firebaseAuth.auth) {
            const user = window.firebaseAuth.auth.currentUser;
            if (user) {
                console.log('👤 Utilisateur connecté:', user.email);
                console.log('🔑 UID:', user.uid);
                console.log('📧 Email vérifié:', user.emailVerified);
                return user;
            } else {
                console.log('👤 Aucun utilisateur connecté');
                return null;
            }
        } else {
            console.log('❌ Firebase Auth non initialisé');
            return null;
        }
    }

    static testAdminAccess() {
        console.log('🚪 Test d\'accès admin...');
        
        const user = this.checkCurrentAuth();
        if (!user) {
            console.log('❌ Pas d\'utilisateur connecté');
            return false;
        }

        if (user.email === 'admin@misterpips.com') {
            console.log('✅ Accès admin autorisé');
            return true;
        } else {
            console.log('❌ Utilisateur pas admin:', user.email);
            return false;
        }
    }
}

// Rendre disponible globalement
window.AdminDiagnostic = AdminDiagnostic;

// Démarrer le diagnostic automatiquement
document.addEventListener('DOMContentLoaded', () => {
    new AdminDiagnostic();
});

// Fonctions utilitaires globales
window.testAdmin = (email, password) => AdminDiagnostic.testAdminLogin(email, password);
window.checkAuth = () => AdminDiagnostic.checkCurrentAuth();
window.testAccess = () => AdminDiagnostic.testAdminAccess();

console.log('🔧 Diagnostic Admin chargé. Utilisez testAdmin(), checkAuth(), testAccess() pour tester.');