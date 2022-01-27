var mongoose = require('mongoose');
var Product = require('../model/product.js');
var ProductDefaults = require('../model/defaultProductRecords.js');

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
    insertProducts();
})
.catch((err) => {
    console.error(err);
});

async function insertProducts() {
    var allProducts = ProductDefaults.loadDefaultProducts();
    
    // Now that we've setup all our products, we can loop through them and save each one to our MongoDB instance
    allProducts.forEach(product => {
        product.save((err, savedProduct) => {
            if (err) {
                console.log("ERROR: " + err);
            }
            else {
                console.log("Saved Product: " + savedProduct.name);
            }
        });
    });

    // wait a bit for records to save
    sleep(10);

    while (true) {
        const query = await Product.find();
        console.log(query.length);

        if (query.length == allProducts.length) {
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

    do {
        now = Date.now();
    } while (now - start < milliseconds);
}