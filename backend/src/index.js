const express = require('express');
const mongodb = require('mongodb');
const app = express();

app.get('/', (req, res) => {

});


const port = process.env.PORT || 4000;
const host = 'localhost';
app.listen(port, () => {
    console.log(`App listening at http://%s:%s`, host, port);
});