// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Transaction = require('../models/transaction')

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

// CREATE -> creates a new transaction 
// POST /transaction
router.post('/transaction', requireToken, (req, res, next) => {
    req.body.transaction.owner = req.user.id
	Transaction.create(req.body.transaction)
		// respond to succesful `create` with status 201 and JSON of new "portfolio"
		.then((transaction) => {
			res.status(201).json({ transaction: transaction.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})


// SHOW coin transaction -> displays tranactions for a coin
// GET /transaction/:coin
router.get('/transaction/:coin', requireToken, (req, res, next) => {
    const coin = req.params.coin
    Transaction.find({ $and: [{ owner: req.user.id }, { coinGeckId: coin }] })
      //if no transaction is found
      .then(handle404)
      // respond with status 200 and JSON of the favorites
      .then((transaction) => res.status(200).json({ transaction: transaction }))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

// SHOW single transaction -> displays individual transaction
// GET /transaction/tid/:transId
router.get('/transaction/tid/:transId', requireToken, (req, res, next) => {
    // transId == transaction id
    const transId = req.params.transId
    console.log('transId',req.params)
    Transaction.findById(transId)
      //if no transaction is found
      .then(handle404)
      // respond with status 200 and JSON of the favorites
      .then((transaction) => res.status(200).json({ transaction: transaction }))
      // if an error occurs, pass it to the handler
      .catch(next)
  })

  // UPDATE -> updates transaction
// PATCH /transaction/tid/:transId
router.patch('/transaction/tid/:transId', requireToken, removeBlanks, (req, res, next) => {
    const transId = req.params.transId
    Transaction.findById(transId)
        //if Transaction isn't found, throw 404
        .then(handle404)
        //Transaction found
        .then(transaction => {
            // checks if user is owner
            requireOwnership(req, transaction)
            // updates and saves transaction
            transaction.set(req.body.transaction)
            return transaction.save()
        })
        // send 204 no content
        .then(() => res.sendStatus(204))
        .catch(next)
  })
  
// DELETE -> removes transaction
// DELETE /transaction/tid/:transId
router.delete('/transaction/tid/:transId', requireToken, (req, res, next) => {
    const transId = req.params.transId
	Transaction.findById(transId)
    //removes transaction 
    .then((transaction)=> {
        requireOwnership(req, transaction)
        return transaction.remove()
    })
		.then((transaction) => {
			res.status(201).json({ transaction: transaction })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})


// DELETE all coin transactions -> removes ALL coin transaction
// DELETE /transaction/:coin
router.delete('/transaction/:coin', requireToken, (req, res, next) => {
    const coin = req.params.coin
	Transaction.deleteMany({ $and: [{ owner: req.user.id }, { coinGeckId: coin }] })
        .then((transaction) => {
            res.status(201).json({ transaction: transaction })
        })
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

module.exports = router
