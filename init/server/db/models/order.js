'use strict';
var crypto = require('crypto');
var _ = require('lodash');
var Sequelize = require('sequelize');

module.exports = function (db) {

    db.define('order', {
        total: {
            // the total price of all prodcuts add together
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.ENUM('received', 'processing', 'shipped', 'delivered', 'returnProcessing', 'returned')
        },
        returnable: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        purchaseDate: {
            type: Sequelize.DATE
        },
        products: {
            // [{productId: id, productPrice: price}, {productId: id, productPrice: price}]
            type: Sequelize.ARRAY(Sequelize.JSON)
        }
    }, {
        getterMethods: {
            total: function () {
                return this.products.reduce(function (a, b) {
                    return a.productPrice + b.productPrice;
                })
            }
        }
    });
};
