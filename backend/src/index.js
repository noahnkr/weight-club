const express = require('express');
const app = express();

const admin = require('firebase-admin');
const serviceAccount = require('../service-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://weight-club-e16e5-default-rtdb.firebaseio.com/'
});

const database = admin.database();

app.post('/create', async (req, res) => {
    try {
        const newData = req.body;
        await database.ref('/').push(newData);
        res.status(200).send('Database updated successfully')

    } catch (err) {
        console.log('Error updating database: ', err);
        res.status(500).send('Error updating databse');
    }
});


const port = process.env.PORT || 4000;
const host = 'localhost';
app.listen(port, () => {
    console.log(`App listening at http://%s:%s`, host, port);
});