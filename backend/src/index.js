const express = require('express');
const app = express();
const { database } = require('./firebase');


app.use(express.json());

app.post('/availability/checkIn', async (req, res) => {
    const { time, count } = req.body;
    const ref = database.collection('weightclub').doc('availability');
    await ref.set({
        time: time,
        count: count
    });
    res.status(200).send('Successfully posted to database')
});

const port = process.env.PORT || 4000;
const host = 'localhost';

app.listen(port, () => {
    console.log(`App listening at http://%s:%s`, host, port);
});