const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../firebase-key.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://weight-club-e16e5-default-rtdb.firebaseio.com'
});

const database = getFirestore();

module.exports = { database };

