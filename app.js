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

app.db = require('./model/model.js')(app, config);
app.use(function(req, res, next) {
    app.db.generateUrl = function(path) {
        return req.protocol + '://' + req.get('host') + path;
    };
    next();
});

var winston = require('winston');
require('winston-papertrail').Papertrail;

var winstonPapertrail = new winston.transports.Papertrail({
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT
});

var logger = new winston.Logger({
    transports: [winstonPapertrail]
});

logger.stream = {
    write: function(message){
        logger.info(message);
    }
};

app.use(morgan('combined', { stream: logger.stream }));

var errorHandler = RF.Error(config);
errorHandler.formatError = function(statusCode, message, details) {
    switch (statusCode) {
        case 404:
            logger.warn(statusCode, message, details);
            break;
        default:
            logger.error(statusCode, message, details);
    }

    return {
        statusCode: statusCode,
        error: message,
        details: details,
        date: new Date()
    }
};

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
Routing.loadRoute('GET', '/users/:id/history', 'guest', 'user/history');

if (config.debug) {
    console.log("Listening on " + app.config.host + ":" + app.config.port);
}

app.listen(app.config.port, app.config.host);