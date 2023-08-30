const functions = require("firebase-functions");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./firebase-key.json");
const cors = require("cors")({ origin: true });

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://weight-club-e16e5-default-rtdatabase.firebaseio.com",
});

const database = getFirestore();

exports.getMemberCount = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { date } = req.query;
      const ref = database.collection(date);
      const dateCollection = await ref.get();
      const memberCount = {};

      dateCollection.forEach((time) => {
        const count = time.data().members.length;
        memberCount[time.id] = count;
      });

      res.status(200).send(memberCount);
    } catch (err) {
      res.status(500).send("Error getting member counts");
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

      dateCollection.forEach((time) => {
        const membersAtTime = time.data().members;
        members[time.id] = membersAtTime;
      });

      res.status(200).send(members);
    } catch (err) {
      res.status(500).send("Error getting members.");
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

      dateCollection.forEach((time) => {
        const count = time.data().hso.length;
        hsoCount[time.id] = count;
      });

      res.status(200).send(hsoCount);
    } catch (err) {
      res.status(500).send("Error getting HSO counts.");
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

      dateCollection.forEach((time) => {
        const hsoAtTime = time.data().hso;
        hso[time.id] = hsoAtTime;
      });

      res.status(200).send(hso);
    } catch (err) {
      res.status(500).send("Error getting members.");
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

      dateCollection.forEach((time) => {
        times.push(time.id);
      });

      res.status(200).send(times);
    } catch (err) {
      res.status(500).send("Error getting members.");
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

exports.createTomorrowCollection = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("America/Chicago")
  .onRun(async (ctx) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Yesterday document going to be deleted, so actual tomorrow will be 2 days ahead.
    const collectionName = tomorrow.toISOString().split("T")[0];

    const range = isWeekday(tomorrow)
      ? generateTimeRange("6:00 AM", "8:45 PM")
      : generateTimeRange("8:00 AM", "5:45 PM");

    const batch = database.batch();
    const collectionRef = database.collection(collectionName);

    range.forEach((time) => {
      const docRef = collectionRef.doc(time);
      batch.set(docRef, {
        members: [],
        hso: [],
      });
    });

    return batch.commit();
  });

  function isWeekday(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

// Returns an array of time strings in 24 hour format inclusively inbetween two 12 hour times
function generateTimeRange(startTime12hr, endTime12hr) {
  function convertTo24HourFormat(time12hr) {
    const [time, period] = time12hr.split(" ");
    const [hours, minutes] = time.split(":");

    let hours24 = parseInt(hours);

    if (period.toLowerCase() === "pm" && hours24 !== 12) {
      hours24 += 12;
    } else if (period.toLowerCase() === "am" && hours24 === 12) {
      hours24 = 0;
    }

    const formattedHours = hours24.toString().padStart(2, "0");
    return `${formattedHours}:${minutes}`;
  }

  const start24hr = new Date(
    `1970-01-01 ${convertTo24HourFormat(startTime12hr)}`
  );
  const end24hr = new Date(`1970-01-01 ${convertTo24HourFormat(endTime12hr)}`);
  const timeArray = [];

  while (start24hr <= end24hr) {
    const timeString = start24hr.toTimeString().slice(0, 5);
    timeArray.push(timeString);
    start24hr.setMinutes(start24hr.getMinutes() + 15);
  }

  return timeArray;
}
