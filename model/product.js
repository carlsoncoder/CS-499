const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },  
  image: {
    type: String,
    required: true
  },
  video: {
    type: String,
    required: true
  }
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;