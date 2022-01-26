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

// Returns a collection of all products available
api.get('/products', async (req, res, next) => {
    console.log('Querying for all products');

    var products = await loadProducts();
    try {
        res.send(products);
    } catch (ex) {
        console.log(`'/products' operation returned an error: ${ex}`);
        res.status(500).json(ex.message);
    }
});

// Returns the details for a given product
api.get('/products/:productId', async (req, res, next) => {
    console.log(`Querying for product with ID: ${req.params.productId}`);

    var products = await loadProducts();
    var foundProduct = null;
    products.forEach(product => {
        if (product.productId.toString() == req.params.productId) {
            foundProduct = product;
        }
    });

    try {
        if (foundProduct == null) {
            res.status(500).json("Invalid Product ID");
        }
        else {
            res.send(foundProduct)
        }
    } catch (ex) {
        console.log(`'/products/productId' operation returned an error: ${ex}`);
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

module.exports = api;