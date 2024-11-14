const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes.js');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static HTML files

app.use('/api', userRoutes); // Prefix for user routes

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
