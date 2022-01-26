'use strict';
const api = require('./lib/api');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

// Express setup
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(express.static('public'));

// Setup MongoDB connection
const COSMOSDB_USER = process.env.COSMOSDB_ACCOUNT_NAME;
const COSMOSDB_PASSWORD = process.env.COSMOSDB_PASSWORD;
const COSMOSDB_DBNAME = process.env.COSMOSDB_DATABASE_NAME;
const COSMOSDB_HOST = process.env.COSMOSDB_ACCOUNT_NAME + ".mongo.cosmos.azure.com";
const COSMOSDB_PORT = process.env.COSMOSDB_PORT;

// Connection built from Microsoft tutorial:  https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/connect-using-mongoose
mongoose.connect("mongodb://"+COSMOSDB_HOST+":"+COSMOSDB_PORT+"/"+COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
    auth: {
        username: COSMOSDB_USER,
        password: COSMOSDB_PASSWORD
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false
})
.catch((err) => {
    console.error(err);
});

// API functions routing
app.use('/api', api);

// default home router (routes calls to the bare url / to /home.html)
app.get('/', function (req, res) {
    res.redirect('/home.html');
})

// catch 404 errors and route to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

const port = 3000;

app.listen(port, () => {
    console.log(`NodeJS server running on port ${port}...`);
});