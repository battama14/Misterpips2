// Cloud Function pour envoyer les notifications FCM
// À déployer sur Firebase Functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendChatNotifications = functions.database.ref('/pendingNotifications/{notificationId}')
    .onCreate(async (snapshot, context) => {
        const notification = snapshot.val();
        
        if (notification.processed) {
            return null;
        }
        
        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
                icon: '/Misterpips.jpg'
            },
            data: {
                click_action: 'https://misterpips.netlify.app/trading-dashboard.html',
                type: 'chat_message'
            },
            tokens: notification.tokens
        };
        
        try {
            const response = await admin.messaging().sendMulticast(message);
            console.log('Notifications envoyées:', response.successCount, 'succès,', response.failureCount, 'échecs');
            
            // Marquer comme traité
            await snapshot.ref.update({ processed: true });
            
            return response;
        } catch (error) {
            console.error('Erreur envoi notifications:', error);
            return null;
        }
    });