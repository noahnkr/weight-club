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
        try {
            const { date } = req.query;
            const ref = database.collection(date);
            const dateCollection = await ref.get();
            const memberCount = {};

            dateCollection.forEach(time => {
                const count = time.data().members.length;
                memberCount[time.id] = count;
            });

            res.status(200).json(memberCount);
        } catch (err) {
            res.status(500).send('Error getting member counts');
        }
    });
});

exports.getMembers = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { date } = req.query;
            const ref = database.collection(date);
            const dateCollection = await ref.get();
            const members = {};

            dateCollection.forEach(time => {
                const membersAtTime = time.data().members;
                members[time.id] = membersAtTime;
            });

            res.status(200).json(members);
        } catch (err) {
            res.status(500).send('Error getting members.');
        }
    });
});


exports.getHsoCount = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { date } = req.query;
            const ref = database.collection(date);
            const dateCollection = await ref.get();
            const hsoCount = {};

            dateCollection.forEach(time => {
                const count = time.data().hso.length;
                hsoCount[time.id] = count;
            });

            res.status(200).json(hsoCount);
        } catch (err) {
            res.status(500).send('Error getting HSO counts.');
        }
    });
});

exports.getHso = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { date } = req.query;
            const ref = database.collection(date);
            const dateCollection = await ref.get();
            const hso = {};

            dateCollection.forEach(time => {
                const hsoAtTime = time.data().hso;
                hso[time.id] = hsoAtTime;
            });

            res.status(200).json(hso);
        } catch (err) {
            res.status(500).send('Error getting members.');
        }
    });
});

exports.getTimes = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { date } = req.query;
            const ref = database.collection(date);
            const dateCollection = await ref.get();
            const times = [];

            dateCollection.forEach(time => {
                times.push(time.id);
            });

            res.status(200).send(times);
        } catch (err) {
            res.status(500).send('Error getting members.');
        }
    });
});


exports.checkIn = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        const { date, time } = req.query;
        const { name, isHso } = req.body;

        const ref = database.collection(date).doc(time);
        await ref.get().then(doc => {
            if (doc.exists) {
                if (isHso) {
                    const hso = doc.data().hso;
                    hso.push(name);
                    ref.update({ hso: hso });
                } else {
                    const members = doc.data().members;
                    members.push(name);
                    ref.update({ members: members });
                }
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


exports.createTomorrowCollection = functions.pubsub.schedule('0 0 * * *')
    .timeZone('America/Chicago')
    .onRun(async (ctx) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); // Yesterday document going to be deleted, so actual tomorrow will be 2 days ahead.
        const collectionName = tomorrow.toISOString().split('T')[0]; 

        const timeIntervals = generateTimeIntervals();
        
        const batch = database.batch();
        const collectionRef = database.collection(collectionName);

        timeIntervals.forEach((interval) => {
            const docRef = collectionRef.doc(interval);
            batch.set(docRef, {
                members: [],
                hso: []
            });
        });

        return batch.commit();
});



// Function to generate time intervals from 6:00 AM to 9:00 PM in 15-minute increments
function generateTimeIntervals() {
    const intervals = [];
    const startTime = new Date();
    startTime.setHours(6, 0, 0, 0); // 6:00 AM
  
    for (let i = 0; i < 60; i++) { // 60 intervals (6:00 AM to 9:00 PM)
      const intervalTime = new Date(startTime.getTime() + i * 15 * 60 * 1000);
      intervals.push(intervalTime.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }
  
    return intervals;
  }

