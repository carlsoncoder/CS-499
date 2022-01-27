var mongoose = require('mongoose');
var Transaction = require('../model/transaction.js');
var ProductDefaults = require('../model/defaultProductRecords.js');

const BatchSize = 50;
const TotalBatches = 6;

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
    var allProducts = ProductDefaults.loadDefaultProducts();

    // call the batch insert multiple times
    for (var i = 0; i < TotalBatches; i++) {
        await insertTransactionBatch(allProducts);
    }

    // figure out how many records we SHOULD have
    var expectedRecords = BatchSize * TotalBatches;
    while (true) {
        const query = await Transaction.find();

        if (query.length == expectedRecords) {
            process.exit();
        }
        else {
            sleep(3);
        }
    }
}

async function insertTransactionBatch(allProducts) {
    // Only do a batch of 50 at a time - more than that cases rate-limiting (HTTP 429) in CosmosDB
    var totalTransactionCount = 50;
    var possibleProductCount = [1, 2, 3];
    var allTransactions = [];

    // Generate X (totalTransactionCount) random transaction records
    for (var i = 0; i < totalTransactionCount; i++) {
        // Get a random item count for this transaction (between 1 and 3 inclusive)
        var itemCount = possibleProductCount[Math.floor(Math.random() * possibleProductCount.length)];

        // Now we pick X products at random from our product array
        var productsForTransaction = [];
        var productIdsAlreadyUsed = [];
        for (var j = 0; j < itemCount; j++) {
            var product = allProducts[Math.floor(Math.random() * allProducts.length)];
            if (productIdsAlreadyUsed.includes(product.productId)) {
                // Duplicate - keep trying random ones until we get one we don't have
                while (true) {
                    product = allProducts[Math.floor(Math.random() * allProducts.length)];
                    if (productIdsAlreadyUsed.indexOf(product.productId) === -1) {
                        break;
                    }
                }
            }

            productIdsAlreadyUsed.push(product.productId);
            productsForTransaction.push(product);
        }

        // calculate transaction cost
        var transactionCost = 0.00;
        productsForTransaction.forEach(product => {
            transactionCost += product.price;
        });

        // make sure we only have two decimal places since JavaScript doesn't know how to do math right
        transactionCost = transactionCost.toFixed(2);

        // create our Transaction object
        allTransactions.push(new Transaction({ transactionDate: Date.now(), totalCost: transactionCost, purchasedProducts: productIdsAlreadyUsed }));
    }

    // Now that we've setup all our transactions, we can loop through them and save each one to our MongoDB instance
    allTransactions.forEach(transaction => {
        transaction.save((err, savedTransaction) => {
            if (err) {
                console.log("ERROR: " + err);
            }
            else {
                console.log("Saved Transaction!");
            }
        });
    });

    // wait a bit for records to save and to avoid rate-limiting
    sleep(10);
}

// Derived from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(seconds) {
    var milliseconds = seconds * 1000;
    const start = Date.now();
    var now = null;

    do {
        now = Date.now();
    } while (now - start < milliseconds);
}