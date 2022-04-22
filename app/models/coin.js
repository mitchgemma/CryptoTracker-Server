// import dependencies
const mongoose = require('mongoose')

// COINS SUBDOCUMENT - coins array of the portfolio
const coinSchema = new mongoose.Schema({
    coinGeckId: {
        type: String,
        required: true
    },
    avgPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number
    }
}, {
    timestamps: true
})

module.exports = coinSchema