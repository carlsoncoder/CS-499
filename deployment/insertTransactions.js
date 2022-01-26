var mongoose = require('mongoose');
var Transaction = require('../model/transaction.js');

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
.then(() => {
    insertTransactions();
})
.catch((err) => {
    console.error(err);
});

async function insertTransactions() {
    var allTransactions = [];

    allTransactions.push(new Transaction({ transactionDate: Date.now(), totalCost: 99.95, purchasedProducts: [1, 2, 5] }));
    allTransactions.push(new Transaction({ transactionDate: Date.now(), totalCost: 99.95, purchasedProducts: [2, 4, 5] }));
    allTransactions.push(new Transaction({ transactionDate: Date.now(), totalCost: 99.95, purchasedProducts: [6, 7] }));
    allTransactions.push(new Transaction({ transactionDate: Date.now(), totalCost: 99.95, purchasedProducts: [9] }));
    allTransactions.push(new Transaction({ transactionDate: Date.now(), totalCost: 99.95, purchasedProducts: [5, 11] }));
    allTransactions.push(new Transaction({ transactionDate: Date.now(), totalCost: 99.95, purchasedProducts: [7, 8, 10] }));

    // Now that we've setup all our transactions, we can loop through them and save each one to our MongoDB instance
    allTransactions.forEach(transaction => {
        transaction.save((err, savedTransaction) => {
            console.log(err);
            console.log("Saved Transaction!");
        });
    });

    // wait a bit for records to save
    sleep(10);

    while (true) {
        const query = await Transaction.find();
        console.log(query.length);

        if (query.length == allTransactions.length) {
           process.exit();
        }
        else {
           sleep(2);
        }
    }
}

// Derived from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(seconds) {
    var milliseconds = seconds * 1000;
    const start = Date.now();
    var now = null;
    let currentDate = null;

    do {
        now = Date.now();
    } while (now - start < milliseconds);
}