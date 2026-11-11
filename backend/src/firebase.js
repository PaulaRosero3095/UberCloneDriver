// backend/src/firebase.js
// AI-assisted: see docs/AI_LOG.md #14
// Firebase Admin: full access to Firestore and FCM. The service-account key is read from
// GOOGLE_APPLICATION_CREDENTIALS or, by default, backend/serviceAccountKey.json (never committed).

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const keyPath = path.resolve(BACKEND_ROOT, process.env.GOOGLE_APPLICATION_CREDENTIALS || 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  throw new Error(
    `Firebase key not found at ${keyPath}. Download it from Firebase console > Project settings > ` +
      'Service accounts > Generate new private key, and save it as backend/serviceAccountKey.json'
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))) });
}

module.exports = {
  admin,
  db: admin.firestore(),
  messaging: admin.messaging(),
  FieldValue: admin.firestore.FieldValue,
};
