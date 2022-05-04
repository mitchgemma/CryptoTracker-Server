// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for portfolio
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

// SHOW
// GET /portfolio
router.get('/portfolio', requireToken, (req, res, next) => {
  Portfolio.find({ owner: req.user.id })
    //if no portfolio is found
    .then(handle404)
    // respond with status 200 and JSON of the favorites
    .then((portfolio) => res.status(200).json({ portfolio: portfolio }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /portfolio
router.post('/portfolio', requireToken, (req, res, next) => {
    req.body.portfolio.owner = req.user.id
	Portfolio.create(req.body.portfolio)
		// respond to succesful `create` with status 201 and JSON of new "portfolio"
		.then((portfolio) => {
			res.status(201).json({ portfolio: portfolio.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})


// DELETE

// DELETE / portfolio

router.delete('/portfolio', requireToken, (req,res,next) => {
    Portfolio.find({owner: req.user._id})
        .then(handle404)
        .then(portfolio => {
            requireOwnership(req,portfolio[0])
            portfolio[0].deleteOne()
        })
        .then(()=>res.sendStatus(204))
        .catch(next)
})


module.exports = router
