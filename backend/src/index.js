const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello world!')
});


const port = process.env.PORT || 4000;
const host = 'localhost';
app.listen(port, () => {
    console.log(`App listening at http://%s:%s`, host, port);
});