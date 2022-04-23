// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Coin = require('../models/coin')
const Portfolio = require('../models/portfolio')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()


// CREATE -> adds a coin to assets
// POST /coin
router.post('/coin', requireToken, (req, res, next) => {
    const coin = req.body.coin
    const coinGeckId = req.body.coin.coinGeckId
    req.body.coin.owner = req.user.id
	Portfolio.find({owner:req.user.id})
    // updates assets with new coin
    .then((portfolio)=> {
        let assets = portfolio[0].assets
        let assetIndex = assets.findIndex(i=>i.coinGeckId == coinGeckId)
        requireOwnership(req, portfolio[0])
        // updates coin in portfolio assets
        if (assetIndex>-1) {
            let assetCoin = assets[assetIndex]
            assetCoin.avgPrice = (assetCoin.avgPrice+coin.avgPrice)/2
            assetCoin.quantity += coin.quantity
        }
        // adds coin to portfolio assets
        else {
            portfolio[0].assets.push(coin)
        }
        return portfolio[0].save()
    })
    // respond to succesful `create` with status 201 and JSON of new "portfolio"
		.then((portfolio) => {
			res.status(201).json({ portfolio: portfolio })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})


module.exports = router