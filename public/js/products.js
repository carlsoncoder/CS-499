'use strict';

// Loads all product details from a remote API endpoint
function loadProductsFromApi() {
    var cached = loadCacheFromStorage();
    if (cached != null) {
        // found cached data, return it
        return cached;
    }
    else {
        // need to call the API to load our data and cache it locally
        var products = [];

        $.ajax({
            type: 'GET',
            url: "api/products",
            dataType: "json",
            success: function(result) {
                $.each(result, function(index, item) {
                    products.push(item);
                })
            },
            data: {},
            async: false
        });

        // set the cache
        setProductCacheInStorage(products);

        // return the value
        return products;
    }
}

// Loads a given product by ID
// Argument: 'productId': The id of the product to load
// Returns: A product object, if it was found, otherwise 'undefined'
function loadProductByIdFromApi(productId) {
    productId = productId.trim();

    var foundProductDetails = null;

    $.ajax({
        type: 'GET',
        url: "api/products/" + productId,
        dataType: "json",
        success: function(result) {
            foundProductDetails = result;
        },
        data: {},
        async: false
    });

    return foundProductDetails;
}

// Loads all products where the brand, name, or type of the pedal contains the searchTerm that was provided
// Search is NOT case-sensitive!
// Argument: 'searchTerm': The text to search for in the product name, brand, or type
// Returns: An array of product objects
function loadProductsBySearchTerm(searchTerm) {
    var products = loadProductsFromApi();
    var foundProducts = [];
    searchTerm = searchTerm.toUpperCase().trim();

    products.forEach(product => {
        if (product.brand.toUpperCase().includes(searchTerm) || product.name.toUpperCase().includes(searchTerm) || product.type.toUpperCase().includes(searchTerm)) {
            foundProducts.push(product);
        }
    });
    
    return foundProducts;
}

// Checks if a given productId is present in the users cart or not
// Argument: 'productId': The id of the product to check for in the cart
// Returns: True if the product exists in the cart, otherwise false
function doesProductExistInShoppingCart(productId) {
    productId = productId.trim();
    var ids = getShoppingCartList();
    var exists = false;
    ids.forEach(id => {
        if (id.toString() === productId.toString()) {
            exists = true;
        }
    });

    return exists;
}

// Adds a given productId to the users shopping cart
// Argument: 'productId': The id of the product to add to the cart
function addToShoppingCart(productId) {
    // first, get the current shopping cart string
    var shoppingCartString = getShoppingCartFromStorage();

    if (shoppingCartString == "" || shoppingCartString == null || shoppingCartString == undefined) {
        // brand new shopping cart
        setShoppingCartInStorage(productId);
    }
    else {
        // check if the productId is already in the cart, only add it if not already present
        if (!shoppingCartString.includes(productId)) {

            // list is comma-separated, so add a comma and then the product id
            shoppingCartString = shoppingCartString + "," + productId;
            setShoppingCartInStorage(shoppingCartString);
        }
    }
}

// Removes a given productId from the users shopping cart
// Argument: 'productId': The id of the product to remove from the cart
function removeFromShoppingCart(productId) {
    // first, get the current shopping cart string
    var shoppingCartString = getShoppingCartFromStorage();

    // if the string is somehow empty, don't bother doing anything
    if (shoppingCartString != "" && shoppingCartString != null && shoppingCartString != undefined) {
        
        // only try to remove it if it's actually present
        if (shoppingCartString.includes(productId)) {
            
            // get the current array of id's
            var ids = getShoppingCartList(shoppingCartString);

            // find the array index of the one to delete
            var indexToDelete = -1;
            for (var i = 0; i < ids.length; i++) {
                if (ids[i] == productId) {
                    indexToDelete = i;
                    break;
                }
            }

            // remove it from the array
            if (indexToDelete > -1) {
                ids.splice(indexToDelete, 1);
            }

            // build a new comma-separated string of id's
            var newShoppingCartString = ids.join(",");

            // set the cart
            setShoppingCartInStorage(newShoppingCartString);
        }
    }
}

// Loads the list of items in the users current shopping cart
// Argument: 'shoppingCartString': The shopping cart string from storage
    // NOTE: If null or empty, we will just load the full string ourselves then search
// Returns: Any array of productIds
function getShoppingCartList(shoppingCartString) {
    if (shoppingCartString == null || shoppingCartString == "") {
        shoppingCartString = getShoppingCartFromStorage();
    }

    var productList = [];
    if (shoppingCartString == null || shoppingCartString == "" || shoppingCartString == undefined) {
        return productList;
    }
    else {
        return shoppingCartString.split(",");
    }
}

// Posts the purchase items to the backend API
// Returns: true if successful, otherwise false
function purchaseProducts() {
  var productIds = getShoppingCartList();
  var postData = {
    "productIds": []
  };

  productIds.forEach(function(id) {
      postData.productIds.push(parseInt(id))
  });

  var returnResponseHandler = function(operationResult) {
    result = operationResult;
  }

  var result = false;
  $.ajax({
    type: 'POST',
    url: "api/purchase",
    dataType: "json",
    success: function(result) {
      returnResponseHandler(true);
    },
    error: function(xhr,status,error) {
      console.log("ERROR");
      console.log(error);
      returnResponseHandler(false);
    },
    data: postData,
    async: false
  });

  return result;
}