
//Archived for now, might use for later dev


const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
	{
		coinGeckId: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true
		},
		price: {
			type: Number,
			required: true
		},
		amount: {
			type: Number,
			required: true,
			min: 0
		},
		datetime: {
			type: Date,
			required: true
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Transaction', transactionSchema)
