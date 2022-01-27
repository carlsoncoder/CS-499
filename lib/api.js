'use strict';

const express = require('express');
const api = express();
const mongoose = require('mongoose');
const Product = require('../model/product.js');
const Transaction = require('../model/transaction.js');

async function loadProducts() {
    const products = await Product.find();
    return products;
}

async function loadProductById(productId) {
    const product = await Product.findOne({ "productId": productId });
    return product;
}

async function loadRelatedProducts(productId) {
    // create a hashmap to track the occurrences per product ID
    // There are 12 product ids.  The key is the product id, and the value is the count of occurrences
    var results = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0
    };

    const query = await Transaction.find();
    query.forEach(transaction => {
        // only process the "similar purchased" products algorithm on transactions...
            // With more than 1 product
            // And containing our ID we're looking for
        if (transaction.purchasedProducts.length > 1 && transaction.purchasedProducts.includes(productId)) {
            transaction.purchasedProducts.forEach(id => {
                // Don't include our search product ID!
                if (id != productId) {
                    results[id]++;
                }
            });
        }
    });

    // now we have the results, we'll pick the top two occurrences (excluding any zero numbers)
    var highestCount = { "id": 0, "count": 0 }
    var secondHighestCount = { "id": 0, "count": 0 }
    for (var i = 1; i < 13; i++) {
        var currentCount = results[i];
        
        // only process records where the current count is greater than 0 and NOT our searched for ID
        if (i != productId && currentCount > 0) {
            if (currentCount >= highestCount.count) {
                // We have a new top record!
                
                // Move the highest values to the second highest values
                secondHighestCount.id = highestCount.id;
                secondHighestCount.count = highestCount.count;

                // And put these values in the highest values
                highestCount.id = i;
                highestCount.count = currentCount;
            }
            else if (currentCount >= secondHighestCount.count) {
                // replace the values in the second highest object with our current values
                secondHighestCount.id = i;
                secondHighestCount.count = currentCount;
            }
        }
    }

    var firstRelatedProduct = null;
    var secondRelatedProduct = null;

    if (highestCount.id != 0) {
        firstRelatedProduct = await loadProductById(highestCount.id)
    }

    if (secondHighestCount.id != 0) {
        secondRelatedProduct = await loadProductById(secondHighestCount.id);
    }

    var relatedProducts = {
        "firstRelatedProduct": firstRelatedProduct,
        "secondRelatedProduct": secondRelatedProduct
    };

    return relatedProducts;
}

// Returns a collection of all products available
api.get('/products', async (req, res, next) => {
    console.log('Querying for all products');

    try {
        var products = await loadProducts();
        res.send(products);
    }
    catch (ex) {
        console.log(`'/products' operation returned an error: ${ex}`);
        res.status(500).json(ex.message);
    }
});

// Returns the details for a given product
api.get('/products/:productId', async (req, res, next) => {
    console.log(`Querying for product with ID: ${req.params.productId}`);

    try {
        var foundProduct = await loadProductById(req.params.productId);
        if (foundProduct == null) {
            res.status(500).json("Invalid Product ID");
        }
        else {
            res.send(foundProduct)
        }
    }
    catch (ex) {
        console.log(`'/products/:productId' operation returned an error: ${ex}`);
        res.status(500).json(ex.message);
    }
});

// Posts a new purchase to the database
api.post('/purchase', async (req, res, next) => {
    console.log("Completing purchase");

    try {
        // Calculate the grand total
        var totalTransactionCost = 0.00;
        var products = await loadProducts();
        products.forEach(product => {
            req.body.productIds.forEach(purchasedProductId => {
                if (product.productId.toString() == purchasedProductId.toString()) {
                    var priceAsFloat = parseFloat(product.price);
                    totalTransactionCost += priceAsFloat;
                }
            });
        });

        var transaction = new Transaction(
        {
            transactionDate: Date.now(),
            totalCost: totalTransactionCost,
            purchasedProducts: req.body.productIds
        });

        transaction.save((err, savedTransaction) => {
            if (err) {
                res.status(500).json(err);
            }
            else {
                // return successful response to the caller
                console.log("Transaction saved successfully!");
                res.send({"success": "true"});
            }
        });
    }
    catch (ex) {
        console.log(`'/purchase' operation returned an error: ${ex}`);
        res.status(500).json(ex.message);
    }
});

api.get('/relatedproducts/:productId', async (req, res, next) => {
    console.log(`'Searching for related products for product ID: ${req.params.productId}`);

    try {
        var results = await loadRelatedProducts(req.params.productId);
        res.send(results);
    }
    catch (ex) {
        console.log(`'/relatedproducts/:productId' operation returned an error: ${ex}`);
        res.status(500).json(ex.message);
    }
});

module.exports = api;