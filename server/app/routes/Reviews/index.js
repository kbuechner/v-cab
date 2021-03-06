'use strict';
var router = require('express').Router();
var rootPath = '../../../';
var Review = require(rootPath + 'db').Review;
var HttpError = require('../../../utils/HttpError');

router.param('id', function (req, res, next, id) {
  User.findById(id)
  .then(function (user) {
    if (!user) throw HttpError(404);
    req.requestedUser = user;
    next();
  })
  .catch(next);
});

function assertIsLoggedIn (req, res, next) {
  if (req.user) next();
  else next(HttpError(401));
}

function assertAdmin (req, res, next) {
  if (req.user && req.user.isAdmin) next();
  else next(HttpError(403));
}


// only admin users can see all reviews
router.get('/', assertAdmin, function (req, res, next) {
    Review.findAll({})
        .then(function (reviews) {
            res.json(reviews);
        })
        .catch(next);
});

//find by id
router.get('/:id', function (req, res, next) {
    Review.findById(req.params.id)
        .then(function (review) {
            //check to be sure theres a book w that id*sv
            if (review) res.json(review);
            else res.status(404).send("Not Found");
        })
        .catch(next);
});

//create review*sv
router.post('/', assertIsLoggedIn, function (req, res, next) {
    Review.create(req.body)
        .then(function (added) {
            res.json(added);
        })
        .catch(next);
});

//delete review*sv for the admin or your own review
router.delete('/:id', assertAdmin, function (req, res, next) {
    Review.destroy({
            where: {
                id: req.params.id
            }
        })
        .then(function (review) {
            if (review) res.status(204).json(review);
            else res.sendStatus(404);
        })
        .catch(next);
});

//update
router.put('/:id', assertAdmin, function (req, res, next) {
    Review.update(req.body, {
            where: {
                id: req.params.id
            }
        }).then(function (updated) {
            if (updated) res.status(204).json(updated);
            else res.status(404).end();
        })
        //send status if it's an invalid id
        .then(function (err) {
            console.log(err);
            res.status(500).send("Invalid Id");
        }).catch(next)
});

module.exports = router;
