const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  transactionDate: {
    type: Date,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  purchasedProducts: [Number]
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;