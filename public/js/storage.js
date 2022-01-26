'use strict';

// The key we use to store our shopping cart details in HTML local storage
const ShoppingCartStorageKey = "shoppingcart";

// The key we use to store our temporarily cached product collection
const ProductCollectionCacheStorageKey = "cachedproducts";

// The key we use to store the cached time for our cached product collection
const ProductCollectionCacheTimeStorageKey = "cachedproductscachedate";

// Sets the shopping cart string in local storage
// Argument: 'cartValue': The string value representing a comma-separated list of productIds in the cart
function setShoppingCartInStorage(cartValue) {  
  localStorage.setItem(ShoppingCartStorageKey, cartValue);
}

// Loads the shopping cart string from local storage
// Returns: A comma-separated list of productIds in the cart
function getShoppingCartFromStorage() {
  return localStorage.getItem(ShoppingCartStorageKey);
}

// Complete removes the shopping cart data, used after a successful purchase is made
function resetShoppingCart() {
  localStorage.removeItem(ShoppingCartStorageKey);
}

// Attempts to load the products from our cached local storage
// Returns: Null if the cache does not exist or has expired, otherwise a JSON object containing the product data
function loadCacheFromStorage() {
  var cached = localStorage.getItem(ProductCollectionCacheStorageKey);
  if (cached != null) {
    // check if we can use the cached products - refresh cache every 60 seconds
    var now = new Date();
    var cacheDate = new Date(localStorage.getItem(ProductCollectionCacheTimeStorageKey));

    // difference in milliseconds
    var msTimeDiff = now - cacheDate;

    // convert to seconds
    msTimeDiff /= 1000;

    // round and check
    var seconds = Math.round(msTimeDiff);
    if (seconds <= 30) {
        console.log("Returning cached data...");
        return JSON.parse(cached);
    }
    else {
      // cache expired, return null to force a reload
      console.log("Cache has expired, please reload...");
      return null;
    }
  }
  else {
    // no cache found
    console.log("Cache does not exist, please reload...");
    return null;
  }
}

// Sets a collection of products as our cached item collection and updates the cached datetime
function setProductCacheInStorage(products) {
  localStorage.setItem(ProductCollectionCacheStorageKey, JSON.stringify(products));
  localStorage.setItem(ProductCollectionCacheTimeStorageKey, new Date());
}