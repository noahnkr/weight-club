const functions = require('firebase-functions')
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebase-key.json');
const cors = require('cors')({ origin: true });

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://weight-club-e16e5-default-rtdatabase.firebaseio.com'
});

const database = getFirestore();

exports.getMemberCount = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { date, time } = req.query;
        const ref = database.collection(date).doc(time);
        await ref.get().then(doc => {
            if (doc.exists) {
                const count = String(doc.data().members.length);
                res.status(200).send(count);
            } else {
                res.status(404).send('Document does not exist.')
            }
        }).catch(err => {
            console.error(err);
            res.status(500).send('Error getting document.');
        });
    });
});

exports.getMembers = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { date, time } = req.query;
        const ref = database.collection(date).doc(time);
        await ref.get().then(doc => {
            if (doc.exists) {
                const members = doc.data().members;
                res.status(200).send(members);
            } else {
                res.status(404).send('Document does not exist.');
            }
        }).catch(err => {
            console.error(err);
            res.status(500).send('Error getting document.');
        });
    });
});

exports.checkIn = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { date, time } = req.query;
        const { name } = req.body;

        const ref = database.collection(date).doc(time);
        await ref.get().then(doc => {
            if (doc.exists) {
                const members = doc.data().members;
                members.push(name);
                ref.update({ members: members });
            } else {
                res.status(404).send('Document does not exist.');
            }
        }).catch(err => {
            console.error(err);
            res.status(500).send('Error updating document.')
        });
        res.status(200).send('Successfully updated document.');
    });
});


exports.createTomorrowCollection = functions.pubsub.schedule('59 23 * * * *')
    .timeZone('America/Chicago')
    .onRun(async (ctx) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2); // Yesterday document going to be deleted, so actual tomorrow will be 2 days ahead.
        const collectionName = tomorrow.toISOString().split('T')[0]; 

        const timeIntervals = generateTimeIntervals();
        
        const batch = database.batch();
        const collectionRef = database.collection(collectionName);

        timeIntervals.forEach((interval) => {
            const docRef = collectionRef.doc(interval);
            batch.set(docRef, {
                members: [],
                hoa: []
            });
        });

        return batch.commit();
});

// Function to generate time intervals from 6:00 AM to 9:00 PM in 15-minute increments
function generateTimeIntervals() {
    const intervals = [];
    const startTime = new Date();
    startTime.setHours(6, 0, 0, 0); // 6:00 AM
  
    for (let i = 0; i < 60; i++) { // 36 intervals (6:00 AM to 9:00 PM)
      const intervalTime = new Date(startTime.getTime() + i * 15 * 60 * 1000);
      intervals.push(intervalTime.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }
  
    return intervals;
  }


