const functions = require('firebase-functions')
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const serviceAccount = require('./firebase-key.json')
const cors = require('cors')({ origin: true })

initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://weight-club-e16e5-default-rtdatabase.firebaseio.com',
})

const db = getFirestore()

exports.addIndividualCheckin = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        // Ensure that the request method is POST
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed')
        }

        try {
            // Extract the data from the request body
            const { name, date, startTime, endTime, isHso, isAnonymous } = req.body

            // Validate required fields
            if (!name || !date || !startTime || !endTime) {
                return res.status(400).send('Missing required fields')
            }

            // Create a new check-in document in the 'checkins' collection
            const newCheckIn = {
                name: name,
                date: date,
                startTime: startTime,
                endTime: endTime,
                isHso: isHso || false,
                isAnonymous: isAnonymous || false,
                createdAt: FieldValue.serverTimestamp(),
            }

            // Add the new check-in document to Firestore
            const checkinRef = db.collection('checkins').doc()
            await checkinRef.set(newCheckIn)

            // Send a success response
            res.status(201).send({
                message: 'Check-in added successfully',
                id: checkinRef.id,
            })
        } catch (error) {
            console.error('Error adding check-in:', error)
            res.status(500).send('Internal Server Error')
        }
    })
})

exports.addRepeatingCheckin = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed')
        }

        try {
            // Extract the data from the request body
            const { name, days, startTime, endTime, isHso, isAnonymous } = req.body

            // Validate required fields
            if (!name || !days || !startTime || !endTime) {
                return res.status(400).send('Missing required fields')
            }

            // Create a new check-in document in the 'repeating_checkins' collection
            const newCheckIn = {
                name: name,
                days: days.split(','),
                startTime: startTime,
                endTime: endTime,
                isHso: isHso || false,
                isAnonymous: isAnonymous || false,
                createdAt: FieldValue.serverTimestamp(),
            }

            // Add the new check-in document to Firestore
            const checkinRef = db.collection('repeating_checkins').doc()
            await checkinRef.set(newCheckIn)

            // Send a success response
            res.status(201).send({
                message: 'Check-in added successfully',
                id: checkinRef.id,
            })
        } catch (error) {
            console.error('Error adding check-in:', error)
            res.status(500).send('Internal Server Error')
        }
    })
})

exports.getIndividualCheckins = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        // Ensure that the request method is GET
        if (req.method !== 'GET') {
            return res.status(405).send('Method Not Allowed')
        }

        try {
            // Extract the name and date from the query parameters
            const { name, date } = req.query

            // Validate required parameters
            if (!name || !date) {
                return res
                    .status(400)
                    .send('Missing required query parameters: name and date')
            }

            // Query Firestore for check-ins that match the specified name and date
            const checkinsRef = db
                .collection('checkins')
                .where('name', '==', name)
                .where('date', '==', date)
            const snapshot = await checkinsRef.get()

            // Check if any documents were found
            if (snapshot.empty) {
                return res.status(200).send([]) // Return an empty array if no check-ins found
            }

            // Map over the snapshot to extract check-in data
            const checkins = snapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    name: data.name,
                    date: data.date,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    isHso: data.isHso,
                    isAnonymous: data.isAnonymous,
                }
            })

            // Send the check-ins data as the response
            res.status(200).send(checkins)
        } catch (error) {
            console.error('Error fetching check-ins by name and date:', error)
            res.status(500).send('Internal Server Error')
        }
    })
})

exports.getRepeatingCheckins = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        // Ensure that the request method is GET
        if (req.method !== 'GET') {
            return res.status(405).send('Method Not Allowed')
        }

        try {
            // Extract the name and date from the query parameters
            const { name } = req.query

            // Validate required parameters
            if (!name) {
                return res.status(400).send('Missing required query parameter: name')
            }

            // Query Firestore for check-ins that match the specified name and date
            const checkinsRef = db
                .collection('repeating_checkins')
                .where('name', '==', name)
            const snapshot = await checkinsRef.get()

            // Check if any documents were found
            if (snapshot.empty) {
                return res.status(200).send([]) // Return an empty array if no check-ins found
            }

            // Map over the snapshot to extract check-in data
            const checkins = snapshot.docs.map((doc) => {
                const data = doc.data()
                return {
                    id: doc.id,
                    name: data.name,
                    days: data.days.join(','),
                    startTime: data.startTime,
                    endTime: data.endTime,
                    isHso: data.isHso,
                    isAnonymous: data.isAnonymous,
                }
            })

            // Send the check-ins data as the response
            res.status(200).send(checkins)
        } catch (error) {
            console.error('Error fetching check-ins by name and date:', error)
            res.status(500).send('Internal Server Error')
        }
    })
})

exports.getMemberCounts = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { date } = req.query

            // Generate time intervals based on day of the week
            const intervals = generateTimeIntervals(date)
            const memberCounts = {}
            const hsoCounts = {}

            intervals.forEach((interval) => {
                memberCounts[interval] = 0
                hsoCounts[interval] = 0
            })

            // Query Firestore for all check-ins on the specified date
            const checkinsRef = db.collection('checkins').where('date', '==', date)
            const snapshot = await checkinsRef.get()

            if (snapshot.empty) {
                return res.status(200).send({ memberCounts, hsoCounts }) // Return empty counts if no check-ins found
            }

            // Process each check-in and update the counts for each overlapping interval
            snapshot.forEach((doc) => {
                const data = doc.data()
                const startTime = new Date(`${date}T${data.startTime}:00`)
                const endTime = new Date(`${date}T${data.endTime}:00`)

                intervals.forEach((interval) => {
                    const intervalTime = new Date(`${date}T${interval}:00`)

                    // Check if interval falls within the check-in start and end times
                    if (intervalTime >= startTime && intervalTime <= endTime) {
                        if (data.isHso) {
                            hsoCounts[interval]++
                        } else {
                            memberCounts[interval]++
                        }
                    }
                })
            })

            // Return the aggregated counts
            res.status(200).send({ memberCounts, hsoCounts })
        } catch (error) {
            console.error('Error fetching interval counts:', error)
            res.status(500).send('Error getting interval counts.')
        }
    })
})

exports.getMemberNames = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            const { date } = req.query

            // Generate time intervals based on the day of the week
            const intervals = generateTimeIntervals(date)
            const memberNames = {}
            const hsoNames = {}

            // Initialize memberNames and hsoNames for each interval
            intervals.forEach((interval) => {
                memberNames[interval] = []
                hsoNames[interval] = []
            })

            // Query Firestore for all check-ins on the specified date
            const checkinsRef = db.collection('checkins').where('date', '==', date)
            const snapshot = await checkinsRef.get()

            if (snapshot.empty) {
                return res.status(200).send({ memberNames, hsoNames }) // Return empty arrays if no check-ins found
            }

            // Process each check-in and categorize names based on the time interval
            snapshot.forEach((doc) => {
                const data = doc.data()
                const startTime = new Date(`${date}T${data.startTime}:00`)
                const endTime = new Date(`${date}T${data.endTime}:00`)

                intervals.forEach((interval) => {
                    const intervalTime = new Date(`${date}T${interval}:00`)

                    // Check if the interval falls within the check-in start and end times
                    if (intervalTime >= startTime && intervalTime <= endTime) {
                        if (!data.isAnonymous) {
                            if (data.isHso) {
                                hsoNames[interval].push(data.name)
                            } else {
                                memberNames[interval].push(data.name)
                            }
                        }
                    }
                })
            })

            // Return the categorized names for each time interval
            res.status(200).send({ memberNames, hsoNames })
        } catch (error) {
            console.error('Error fetching names per interval:', error)
            res.status(500).send('Error getting names per interval.')
        }
    })
})

exports.updateIndividualCheckin = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'PUT') {
            return res.status(405).send('Method Not Allowed')
        }

        try {
            const { id, startTime, endTime, isHso, isAnonymous } = req.body

            if (!id || !startTime || !endTime) {
                return res.status(400).send('Missing required fields')
            }

            const checkinRef = db.collection('checkins').doc(id)
            await checkinRef.update({
                startTime: startTime,
                endTime: endTime,
                isHso: isHso,
                isAnonymous: isAnonymous,
            })

            res.status(200).send({ message: 'Check-in updated successfully' })
        } catch (error) {
            console.error('Error updating check-in:', error)
            res.status(500).send('Internal Server Error')
        }
    })
})

exports.updateRepeatingCheckin = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'PUT') {
            return res.status(405).send('Method Not Allowed')
        }

        try {
            const { id, days, startTime, endTime, isHso, isAnonymous } = req.body

            if (!id || !days || !startTime || !endTime) {
                return res.status(400).send('Missing required fields')
            }

            const checkinRef = db.collection('repeating_checkins').doc(id)
            await checkinRef.update({
                days: days.split(','),
                startTime: startTime,
                endTime: endTime,
                isHso: isHso,
                isAnonymous: isAnonymous,
            })

            res.status(200).send({ message: 'Check-in updated successfully' })
        } catch (error) {
            console.error('Error updating check-in:', error)
            res.status(500).send('Internal Server Error')
        }
    })
})

exports.deleteCheckin = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'DELETE') {
            return res.status(405).send('Method Not Allowed')
        }

        try {
            const { id, repeating } = req.query

            if (!id || !repeating) {
                return res
                    .status(400)
                    .send('Missing required query parameter: id or repeating')
            }

            const collectionName =
                repeating === 'true' ? 'repeating_checkins' : 'checkins'
            const checkinRef = db.collection(collectionName).doc(id)
            await checkinRef.delete()

            res.status(200).send({ message: 'Check-in deleted successfully' })
        } catch (error) {
            console.error('Error deleting check-in:', error)
            res.status(500).send('Internal Server Error')
        }
    })
})

exports.createWeeklyCheckins = functions.pubsub
    .schedule('every sunday 00:00')
    .onRun(async (ctx) => {
        try {
            // Fetch all documents from the 'repeating_checkins' collection
            const repeatingCheckinsSnapshot = await db
                .collection('repeating_checkins')
                .get()

            if (repeatingCheckinsSnapshot.empty) {
                console.log('No repeating check-ins found.')
                return null
            }

            // Iterate through each repeating check-in document
            repeatingCheckinsSnapshot.forEach(async (doc) => {
                const data = doc.data()
                const { name, days, startTime, endTime, isHso, isAnonymous } = data

                // Create check-ins for each day in the current week
                days.forEach(async (day) => {
                    // Get the date for the current day in the current week
                    const checkinDate = getNextWeekdayDate(day)

                    // Create a new check-in document in the 'checkins' collection
                    const newCheckIn = {
                        name: name,
                        date: checkinDate,
                        startTime: startTime,
                        endTime: endTime,
                        isHso: isHso || false,
                        isAnonymous: isAnonymous || false,
                        createdAt: FieldValue.serverTimestamp(),
                    }

                    // Add the new check-in document to Firestore
                    await db.collection('checkins').add(newCheckIn)
                })
            })

            console.log('Weekly check-ins created successfully.')
            return null
        } catch (error) {
            console.error('Error creating weekly check-ins:', error)
            return null
        }
    })

function generateTimeIntervals(date) {
    const dateObj = new Date(date)
    const dayIndex = dateObj.getDay()
    const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ]
    const dayOfWeek = daysOfWeek[dayIndex]

    const hours = {
        Monday: ['06:00', '23:59'],
        Tuesday: ['06:00', '23:59'],
        Wednesday: ['06:00', '23:59'],
        Thursday: ['06:00', '23:59'],
        Friday: ['06:00', '22:00'],
        Saturday: ['08:00', '18:00'],
        Sunday: ['08:00', '23:59'],
    }

    // Get the start and end times for the given day
    const [startTime, endTime] = hours[dayOfWeek]

    const start = new Date(`1970-01-01T${startTime}:00`)
    const end = new Date(`1970-01-01T${endTime}:00`)
    const intervals = []

    // Generate 15-minute intervals between the start and end times
    while (start <= end) {
        intervals.push(start.toTimeString().slice(0, 5)) // 'HH:MM' format
        start.setMinutes(start.getMinutes() + 15)
    }

    return intervals
}

function getNextWeekdayDate(dayOfWeek) {
    const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ]
    const today = new Date()
    const currentDayIndex = today.getDay()
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek)

    // Calculate the number of days until the next occurrence of the target day
    const daysUntilNext = (targetDayIndex + 7 - currentDayIndex) % 7

    // Calculate the date of the next occurrence of the target day
    const nextWeekday = new Date(today)
    nextWeekday.setDate(today.getDate() + daysUntilNext)

    // Format the date as 'YYYY-MM-DD'
    const year = nextWeekday.getFullYear()
    const month = String(nextWeekday.getMonth() + 1).padStart(2, '0')
    const day = String(nextWeekday.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}
