'use strict';
var path = require('path');
var session = require('express-session');
var passport = require('passport');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var chalk = require('chalk')
var ENABLED_AUTH_STRATEGIES = [
    'local',
    'facebook',
    'google'
];

module.exports = function (app, db) {

    var dbStore = new SequelizeStore({
        db: db
    });

    var User = db.model('user');
    var Order = db.model('order');

    dbStore.sync();

    // First, our session middleware will set/read sessions from the request.
    // Our sessions will get stored in Mongo using the same connection from
    // mongoose. Check out the sessions collection in your MongoCLI.
    app.use(session({
        secret: app.getValue('env').SESSION_SECRET,
        store: dbStore,
        resave: false,
        saveUninitialized: false
    }));

    // Initialize passport and also allow it to read
    // the request session information.
    app.use(passport.initialize());
    app.use(passport.session());

    // When we give a cookie to the browser, it is just the userId (encrypted with our secret).
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // When we receive a cookie from the browser, we use that id to set our req.user
    // to a user found in the database.
    passport.deserializeUser(function (id, done) {
        User.findById(id)
            .then(function (user) {
                done(null, user);
            })
            .catch(done);
    });

    // We provide a simple GET /session in order to get session information directly.
    // This is used by the browser application (Angular) to determine if a user is
    // logged in already.
    app.get('/session', function (req, res) {
        // tc: this will attach inCart order id to session as well, but when get('/products'), the session orderId is still null
        if (req.user) {
            var uId = req.user.id
            Order.findOne({
                    where: {
                        userId: uId,
                        status: 'inCart'
                    }
                })
                .then(function (order) {
                    req.session.orderId = order.id
                    console.log(chalk.red("when session"))
                    console.log(req.session)
                })
            res.send({
                user: req.user.sanitize()
            });
        } else {
            res.status(401).send('No authenticated user.');
        }
    });

    // Simple /logout route.
    app.get('/logout', function (req, res) {
        //sv we need to talk this
        req.session.orderId = null;
        req.logout();
        res.status(200).end();
    });

    // Each strategy enabled gets registered.
    ENABLED_AUTH_STRATEGIES.forEach(function (strategyName) {
        require(path.join(__dirname, strategyName))(app, db);
    });

};
