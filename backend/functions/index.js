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

exports.memberCheckIn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { date } = req.query;
    const { name, range } = req.body;
    const batch = database.batch();

    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      if (collection.exists) {
        for (const time of range) {
          const docRef = collectionRef.doc(time);
          const doc = await docRef.get();
          if (doc.exists) {
            const members = doc.data().members;
            if (!members.includes(name)) {
              members.push(name);
              batch.update(ref, { members: members });
            } else {
              res.status(409).send("Name already exists in time range.")
              return;
            }
          } else {
            res.status(404).send("Cannot check in at the given time. Please make sure the club is open during the time range.");
          }
        }
        await batch.commit();
        res.status(200).send("Batch check-in successful")
      } else {
        res.status(404).send(`Cannot check in to date ${date} yet.`);
        return;
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("There was an error checking in.");
    }
  });
});

exports.hsoCheckIn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { date } = req.query;
    const { name, range } = req.body;
    const batch = database.batch();

    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      if (collection.exists) {
        for (const time of range) {
          const docRef = collectionRef.doc(time);
          const doc = await docRef.get();
          if (doc.exists) {
            const hso = doc.data().hso;
            if (!hso.includes(name)) {
              hso.push(name);
              batch.update(ref, { hso: hso });
            } else {
              res.status(409).send("Name already exists in time range.")
              return;
            }
          } else {
            res.status(404).send("Cannot check in at the given time. Please make sure the club is open during the time range.");
          }
        }
        await batch.commit();
        res.status(200).send("Batch check-in successful")
      } else {
        res.status(404).send(`Cannot check in to date ${date} yet.`);
        return;
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("There was an error checking in.");
    }
  });
});



exports.createTomorrowCollection = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("America/Chicago")
  .onRun(async (ctx) => {
    const day = new Date();
    day.setDate(day.getDate() + 7);
    const collectionName = day.toLocaleString().split(", ")[0].replace(/\//g, "-")

    let range;
    let dayOfWeek = day.getDay();
  
    // weekday
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      range = generateTimeRange("6:00 AM", "8:45 PM");
    // saturday
    } else if (dayOfWeek == 6) {
      range = generateTimeRange("8:00 AM", "5:45 PM");
    // sunday
    } else {
      range = generateTimeRange("12:00 PM", "5:45 PM");
    }

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
