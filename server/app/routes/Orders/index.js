var express = require('express');
var router = express.Router();
var passport = require('passport');

var rootPath = '../../../';
var User = require(rootPath + 'db').User;
var Order = require(rootPath + 'db').Order;
var OrderProduct = require(rootPath + 'db').OrderProduct;
var chalk = require('chalk');

//sv I just moved this bit out while I was reading to make it easier to see
function findOrCreateUser (req) {
    // user will be either req.user (logged in),
    // or we create one and log her in
    var user = req.user ? Promise.resolve(req.user) :
        User.create({
            firstName: 'Bella',
            lastName: 'Swan'
        })
        .then(function (createdUser) {
            req.logIn(createdUser, function (loginErr) {
                if (loginErr) return next(loginErr);
                // We respond with a response object that has user with _id and email.
                res.status(200).send({
                    user: createdUser.sanitize()
                });
            });
            return createdUser;
        });

    return user; 
}
//sv
function addProductToOrder (id, reqObj) {
    return OrderProduct.create({
        orderId: id,
        productId: reqObj.id,
        price: reqObj.price,
        title: reqObj.title,
        quantity: reqObj.inventory
    });
}
// find all orders 
router.get('/', function (req, res, next) {
    Order.findAll({
            where: req.query
        })
        .then(function (orders) {
            res.json(orders);
        })
        .catch(next);
});


//svare we ever using this?
router.get('/:id', function (req, res, next) {
    OrderProduct.findOne({
            where: {
                orderId: req.params.id
            }
        })
        .then(function (order) {
            res.json(order);
        })
        .catch(next);
});

// add to cart
router.post('/addToCart', function (req, res, next) {
    console.log("?????????????????");
    //sv- moved this bit out just for now
    var user = findOrCreateUser(req);
    user.then(createdUser => {
        Order.findOne({
            where: {
                userId: createdUser.id,
                status: 'inCart'
            }
        })
        .then(function (inCartOrder) {

            if (inCartOrder.length) {
                console.log("order exists", inCartOrder);
                var id = inCartOrder[0].id;
                addProductToOrder (id, req.body)
                .then(function (order) {
                    req.session.order = order;
                    res.json(order);
                })
                .catch(next);
            } else {
                console.log("no order")
                // if not, create Order first then add to OrderProduct
                Order.create({
                        userId: createdUser.id
                })
                .then(function (createdOrder) {
                    // console.log("HERE", req.body);
                    return addProductToOrder (createdOrder.id, req.body);
                })
                .then(function (addedProduct) {
                    req.session.orderId = order.orderId;
                    console.log("AFTER MAKE ORDER SESSION", req.session);
                    res.json(addedProduct);
                })
                .catch(next);
            }
        });
    });
});

// edit one item in the shopping cart
router.put('/:id/editItem', function (req, res, next) {
    OrderProduct.update(req.body, {
            where: {
                orderId: req.params.id,
                productId: req.body.productId
            }
        })
        .then(function (updatedItem) {
            res.json(updatedItem);
        })
        .catch(next);
});

// delete one item in the shopping cart, interesting enought that it's a put route
router.put('/:id/deleteItem', function (req, res, next) {
    OrderProduct.destroy({
            where: {
                orderId: req.params.id,
                productId: req.body.productId
            }
        })
        .then(function (removed) {
            res.json(removed)
        })
});


//find all products by order id
router.get('/:id/products', function (req, res, next) {
    console.log("SESSIONSSSS", req.session);
    OrderProduct.findAll({
            where: {
                orderId: req.params.id
            }
        })
        .then(function (order) {
            res.json(order);
        })
        .catch(next);
});



// admin should be able to edit everything in the order
// users should be able to cancel order 30 mins limit
router.put('/:orderid/product/:productid', function (req, res, next) {
    OrderProduct.update(req.body, {
            where: {
                productId: req.params.productid,
                orderId: req.params.orderid
            }
        })
        .then(function (product) {
            return product.update(req.body.product);
        })
        .then(function (product) {
            res.json(product);
        })
        .catch(next);

});

// clear the shopping cart
router.delete('/:id', function (req, res, next) {
    Order.destroy({
            where: {
                id: req.params.id
            }
        })
        .catch(next);
});


module.exports = router;
