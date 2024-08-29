const functions = require("firebase-functions");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./firebase-key.json");
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
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
        const membersAtTime = time.data().members.filter(member => !member.startsWith("ANON"));
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
        const hsoAtTime = time.data().hso.filter(hso => !hso.startsWith("ANON"));
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
    const { date, name } = req.query;
    const { range } = req.body;
    const batch = database.batch();

    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      if (!collection.empty) {
        for (const time of range) {
          const docRef = collectionRef.doc(time);
          const doc = await docRef.get();
          if (doc.exists) {
            const members = doc.data().members;
            if (!members.includes(name)) {
              members.push(name);
              batch.update(docRef, { members: members });
            } 
          } else {
            res
              .status(404)
              .send(
                "Cannot check in at the given time. Please make sure the club is open during the time range."
              );
            return;
          }
        }
        await batch.commit();
        res.status(200).send("Batch check-in successful");
      } else {
        res.status(404).send(`Cannot check in to date ${date} yet.`);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("There was an error checking in.");
    }
  });
});

exports.hsoCheckIn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { date, name } = req.query;
    const { range } = req.body;
    const batch = database.batch();

    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      if (!collection.empty) {
        for (const time of range) {
          const docRef = collectionRef.doc(time);
          const doc = await docRef.get();
          if (doc.exists) {
            const hso = doc.data().hso;
            if (!hso.includes(name)) {
              hso.push(name);
              batch.update(docRef, { hso: hso });
            }
          } else {
            res.status(404).send("Cannot check in at the given time. Please make sure the club is open during the time range.");
            return;
          }
        }
        await batch.commit();
        res.status(200).send("Batch check-in successful");
      } else {
        res.status(404).send(`Cannot check in to date ${date} yet.`);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("There was an error checking in.");
    }
  });
});

exports.deleteMemberCheckIn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { date, name } = req.query;
    const { range } = req.body;
    const batch = database.batch();

    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      if (!collection.empty) {
        for (const time of range) {
          const docRef = collectionRef.doc(time);
          const doc = await docRef.get();
          if (doc.exists) {
            const data = doc.data();
            if (data.members.includes(name)) {
              const members = data.members.filter(member => member !== name);
              batch.update(docRef, {
                members: members
              });
            } else if (data.members.includes(`ANON ${name}`)) {
              const members = data.members.filter(member => member !== `ANON ${name}`);
              batch.update(docRef, {
                members: members
              });
            }
          } else {
            res.status(404).send(`Cannot delete document ${time} on ${date} because document does not exist.`);
            return;
          }
        };

        await batch.commit();
        res.status(200).send("Successfully deleted checkin.")
      } else {
        res.status(404).send(`Cannot delete range at date ${date} because the date does not exist.`)
      }

    } catch (err) {
      res.status(500).send("There was an error deleting the checkin.")
    }
  });
});

exports.deleteHsoCheckIn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { date, name } = req.query;
    const { range } = req.body;
    const batch = database.batch();

    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      if (!collection.empty) {
        for (const time of range) {
          const docRef = collectionRef.doc(time);
          const doc = await docRef.get();
          if (doc.exists) {
            const data = doc.data();
            if (data.hso.includes(name)) {
              const hso = data.hso.filter(hso => hso !== name)
              batch.update(docRef, {
                hso: hso
              });
            } else if (data.hso.includes(`ANON ${name}`)) {
              const hso = data.hso.filter(hso => hso !== `ANON ${name}`)
              batch.update(docRef, {
                hso: hso
              });
            }
          } else {
            res.status(404).send(`Cannot delete document ${time} on ${date} because document does not exist.`);
            return;
          }
        };

        await batch.commit();
        res.status(200).send("Successfully deleted checkin.")
      } else {
        res.status(404).send(`Cannot delete range at date ${date} because the date does not exist.`)
      }

    } catch (err) {
      res.status(500).send("There was an error deleting the checkin.")

    }
  });
});

exports.getCheckedInTimeRanges = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { date, name } = req.query;
    const ranges = [];
    let checkInTime = ""
    let checkOutTime = "";
    let isHso = false;

    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      if (!collection.empty) {
        collection.forEach(doc => {
          const data = doc.data();
          if (data.members.includes(name) || data.hso.includes(name)) {
            if (checkInTime === "" && checkOutTime === "") {
              checkInTime = doc.id;
              isHso = data.hso.includes(name);
            } else if (checkInTime !== "") {
              checkOutTime = doc.id;
            }
          } else if (data.members.includes(`ANON ${name}`) || data.hso.includes(`ANON ${name}`)) {
            if (checkInTime === "" && checkOutTime === "") {
              checkInTime = doc.id;
              isHso = data.hso.includes(`ANON ${name}`);
            } else if (checkInTime !== "") {
              checkOutTime = doc.id;
            }
          } else if (checkInTime !== "" && checkOutTime !== "") {
              ranges.push({
                checkIn: checkInTime,
                checkOut: checkOutTime,
                isHso: isHso
              });
              checkInTime = "";
              checkOutTime = "";
              isHso = false;
            }
          });
        res.status(200).send(ranges);
      } else {
        res.status(404).send(`Date ${date} does not exist yet.`);
      }
    } catch (err) {
      res.status(500).send("There was an error.");
    }
  });
});

exports.collectionExists = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { date } = req.query;
    try {
      const collectionRef = database.collection(date);
      const collection = await collectionRef.get();
      // date collection doesn't exist
      if (collection.empty) {
        res.status(200).send(false);
        return;
      } else {
        res.status(200).send(true);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("There was an error.");
    }
  });
});

exports.createNextDateCollection = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("America/Chicago")
  .onRun(async (ctx) => {
    const day = new Date();
    day.setDate(day.getDate() + 7);
    const collectionName = day.toISOString().split("T")[0];

    let range;
    let dayOfWeek = day.getDay();

    // mon, tues, wed, pr thur
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      range = generateTimeRange("6:00 AM", "11:45 PM");
      // friday
    } else if (dayOfWeek == 5) {
      range = generateTimeRange("6:00 AM", "9:45 PM");
      // saturday
    } else if (dayOfWeek == 6) {
      range = generateTimeRange("8:00 AM", "5:45 PM");
      // sunday
    } else {
      range = generateTimeRange("8:00 AM", "11:45 PM");
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

  exports.generateHistogram = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        try {
            const histogramData = await calculateWeeklyAverages();

            const width = 1500;
            const height = 800;
            const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            // Create a dataset for members and HSOs
            const membersData = [];
            const hsoData = [];
            const labels = [];

            daysOfWeek.forEach((day, dayIndex) => {
                const dayHours = Object.keys(histogramData[day].members); // Get the hours for each day
                dayHours.forEach((time, index) => {
                    membersData.push(histogramData[day].members[time].average);
                    hsoData.push(histogramData[day].hso[time].average);
                    labels.push(`${index % 2 == 0 ? time : ''}`); // Use full time label for clarity
                });

                // Add a gap after each day except the last one
                if (dayIndex < daysOfWeek.length - 1) {
                    membersData.push(null); // Add a null entry for members
                    hsoData.push(null); // Add a null entry for HSOs
                    labels.push(''); // Add an empty label for the gap
                }
            });

            const data = {
                labels: labels,
                datasets: [
                    {
                        label: 'HSOs',
                        data: hsoData,
                        backgroundColor: "rgba(28, 217, 78, 0.8)",
                        borderWidth: 2,
                        borderColor: "rgb(28, 217, 78)",
                    },
                    {
                        label: 'Members',
                        data: membersData,
                        backgroundColor: "rgba(54, 162, 235, 0.8)",
                        borderWidth: 2,
                        borderColor: "rgb(54, 162, 235)",
                    }
                ]
            };

            const configuration = {
                type: 'bar',
                data: data,
                options: {
                    scales: {
                        x: {
                            stacked: true,
                            ticks: {
                                autoSkip: false
                            }
                        },
                        y: {
                            display: true,
                            title: {
                              display: true,
                              text: "Average # of Members",
                              font: {
                                family: 'Roboto',
                                size: 18,
                                weight: 'bold',
                              },
                            },
                            stacked: true
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'ISU Weight Club 2023-2024 Member Data',
                            font: {
                              family: 'Roboto',
                              size: 24,
                              weight: 'bold',
                            },
                        }
                    }
                }
            };

            const image = await chartJSNodeCanvas.renderToBuffer(configuration);
            res.set('Content-Type', 'image/png');
            res.send(image);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error generating histogram');
        }
    });
});
  
async function calculateWeeklyAverages() {
  const collections = await database.listCollections();
  const weekData = {
    "Monday": { members: {}, hso: {} },
    "Tuesday": { members: {}, hso: {} },
    "Wednesday": { members: {}, hso: {} },
    "Thursday": { members: {}, hso: {} },
    "Friday": { members: {}, hso: {} },
    "Saturday": { members: {}, hso: {} },
    "Sunday": { members: {}, hso: {} },
  };

  for (const collection of collections) {
    const date = new Date(collection.id);
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const snapshot = await collection.get();

    snapshot.forEach((doc) => {
      const time = convertTo12HourFormat(doc.id);
      const hour = time.split(':')[0] + ':00 ' + time.split(' ')[1]; // Extract the hour part and set minutes to '00'
      const membersCount = doc.data().members.length;
      const hsoCount = doc.data().hso.length;

      const membersWeight = membersCount > 0 ? 2 : 1; // Weighted count assuming 50% of people don't check into website


      if (!weekData[dayOfWeek].members[hour]) {
        weekData[dayOfWeek].members[hour] = { total: 0, count: 0 };
      }
      if (!weekData[dayOfWeek].hso[hour]) {
        weekData[dayOfWeek].hso[hour] = { total: 0, count: 0 };
      }

      weekData[dayOfWeek].members[hour].total += membersCount * membersWeight;
      weekData[dayOfWeek].members[hour].count += 1;

      weekData[dayOfWeek].hso[hour].total += hsoCount;
      weekData[dayOfWeek].hso[hour].count += 1;
    });
  }

  // Calculate averages
  for (const day in weekData) {
    for (const hour in weekData[day].members) {
      weekData[day].members[hour].average = Math.round(weekData[day].members[hour].total / weekData[day].members[hour].count);
    }
    for (const hour in weekData[day].hso) {
      weekData[day].hso[hour].average = Math.round(weekData[day].hso[hour].total / weekData[day].hso[hour].count);
    }
  }

  return weekData;
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

function convertTo12HourFormat(time24hr) {
  const [hours, minutes] = time24hr.split(":");
  let hours12 = parseInt(hours);
  let period = "AM";

  if (hours12 >= 12) {
    period = "PM";
    if (hours12 > 12) {
      hours12 -= 12;
    }
  } else if (hours12 === 0) {
    hours12 = 12;
  }

  // No leading zero for hours
  const formattedHours = hours12.toString();
  return `${formattedHours}:${minutes} ${period}`;
}
