const admin = require("firebase-admin");

// Inizializza Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // File JSON scaricato da Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
