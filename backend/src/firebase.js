// backend/src/firebase.js
// AI-assisted: see docs/AI_LOG.md #14
// Firebase Admin: full access to Firestore and FCM. Credentials come from the service-account
// file named in GOOGLE_APPLICATION_CREDENTIALS (never committed).

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

module.exports = {
  admin,
  db: admin.firestore(),
  messaging: admin.messaging(),
  FieldValue: admin.firestore.FieldValue,
};
