const express = require('express');
const cors = require('cors');
const app = express();
const { database } = require('./firebase');

app.use(express.json());
app.use(cors());

/*
POST:


GET:
- View member count at certain time
- View which members are going to be there at certain time

PUT:
- Member check ins
    - Name
    - Date
    - Check in time (hour, min)
    - Check out time (hour, min)
- HSO check ins

DELETE:
- Delete check in
*/

app.get('/availability/count', async (req, res) => {
    const { date, time } = req.query;
    const ref = database.collection(date).doc(time);
    await ref.get().then(doc => {
        if (doc.exists) {
            const count = String(doc.data().members.length); // express doesn't like numbers
            res.status(200).send(count);
        } else {
            res.status(404).send('Document does not exist.')
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send('Error getting document.');
    });
});

app.get('/availability/members', async (req, res) => {
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

app.put('/checkin/member/:date', async (req, res) => {
    const { date } = req.params;
    const { name, time } = req.body;

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
    })
    res.status(200).send('Successfully updated document.');
});


app.post('/checkin/HSO', async (req, res) => {

});

const port = process.env.PORT || 4000;
const host = 'localhost';

app.listen(port, () => {
    console.log(`App listening at http://%s:%s`, host, port);
});