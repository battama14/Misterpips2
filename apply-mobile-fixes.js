// Script d'application automatique des corrections mobile
// À exécuter pour appliquer les corrections à toutes les pages

const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'vip-space.html',
    'trading-dashboard.html',
    'admin-dashboard.html',
    'planning-forex.html',
    'add-vip-user.html'
];

const cssToAdd = '    <link rel="stylesheet" href="mobile-fixes-complete.css">';
const jsToAdd = '    <script src="mobile-menu-complete.js"></script>';

htmlFiles.forEach(filename => {
    if (fs.existsSync(filename)) {
        let content = fs.readFileSync(filename, 'utf8');
        
        // Ajouter le CSS s'il n'existe pas déjà
        if (!content.includes('mobile-fixes-complete.css')) {
            content = content.replace(
                /<link rel="stylesheet" href="mobile-responsive\.css">/,
                '<link rel="stylesheet" href="mobile-responsive.css">\n' + cssToAdd
            );
        }
        
        // Ajouter le JS s'il n'existe pas déjà
        if (!content.includes('mobile-menu-complete.js')) {
            content = content.replace(
                /<script src="mobile-menu\.js"><\/script>/,
                '<script src="mobile-menu.js"></script>\n' + jsToAdd
            );
        }
        
        fs.writeFileSync(filename, content);
        console.log(`✅ ${filename} mis à jour`);
    } else {
        console.log(`⚠️  ${filename} non trouvé`);
    }
});

console.log('🎉 Application des corrections mobile terminée !');