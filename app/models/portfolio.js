const mongoose = require('mongoose')
const coinSchema = require('./coin')


const portfolioSchema = new mongoose.Schema(
	{
        assets: [coinSchema],
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

module.exports = mongoose.model('Portfolio', portfolioSchema)