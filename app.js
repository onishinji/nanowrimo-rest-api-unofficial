var config = require('./config'),
        express = require('express'),
        _ = require('lodash'),
        bodyParser = require('body-parser'),
        morgan = require('morgan'),
        RF = require('rest-framework');

var app = exports = module.exports = express();

app.utils = RF.Utils;

app.enable('trust proxy');
app.disable('x-powered-by');
app.enable('strict routing');

// Config
app.config = config;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: false}));

app.use(RF.Cors.middleware);
app.use(RF.Cors.redirect);

if (config.debug) {
    app.use(morgan('short'));
}

app.db = require('./model/model.js')(app, config);
app.use(function(req, res, next) {
    app.db.generateUrl = function(path) {
        return req.protocol + '://' + req.get('host') + path;
    };
    next();
});

var errorHandler = RF.Error(config);
app.errorHandler = errorHandler;

var Routing = RF.Routing(app, config.security, {
    pathControllers: process.cwd() + '/controllers'
}, errorHandler);

Routing.loadController('api', config);
Routing.loadController('user', config);

Routing.loadRoute('GET', '/', 'guest', 'api/main');
Routing.loadRoute('GET', '/users', 'guest', 'user/users');
Routing.loadRoute('GET', '/users/:id', 'guest', 'user/user');
Routing.loadRoute('GET', '/users/:id/friends', 'guest', 'user/friends');

if (config.debug) {
    console.log("Listening on " + app.config.host + ":" + app.config.port);
}

app.listen(app.config.port, app.config.host);