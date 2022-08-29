const admin = require('firebase-admin');
const qry = require(`${PROJECT_DIR}/utility/selectQueries`);
const dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);

const serviceAccount = require('../push-notifications-65c64-firebase-adminsdk-hqsvg-9452ba59a5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://push-notifications-65c64.firebaseio.com',
});

module.exports = {
  sendnotificationToDevice,
  sendNotificationToMultipleDevices,
};

async function sendnotificationToDevice(pushNotification, notification, data = {}) {
  try {
      const { user__c, firebase_token__c } = pushNotification;
      let tableName = SF_NOTIFICATIONS_TABLE_NAME;
      let notifications = `user__c, title, body, createddate`;
      let notificationsValues = [user__c, notification.title, notification.body, dtUtil.todayDatetime()];
      qry.insertRecord(notifications, notificationsValues, tableName);
      const res = await admin.messaging().sendToDevice(firebase_token__c, { notification, data });
    if (res.successCount) {
      console.log('Push notifiction sent successfully!');
    } else {
      console.log('Failed to send notifiction', res.results[0].error);
    }
  } catch (err) {
    console.log('Error in sendnotificationToDevice:', err);
  }
}

async function sendNotificationToMultipleDevices(tokens, notification, data = {}) {
  try {
    const res = await admin.messaging().sendMulticast({ tokens, notification, data });
    if (res.successCount) {
      console.log('Push notifiction sent successfully!');
    } else {
      console.log('Failed to send notifiction');
    }
  } catch (err) {
    console.log('Error in sendnotificationToDevice:', err);
  }
}
