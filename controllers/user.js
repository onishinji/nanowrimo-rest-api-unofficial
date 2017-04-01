module.exports = function(app, config) {
    return new Controller(app, config);
}

var _ = require('lodash')

var Promise = require('bluebird');
var RF = require('rest-framework');

Controller = function(app, config) {

    var self = this;

    this.config = config;
    this.app = app;

    return this;
}

Controller.prototype.getUserValidation = function() {
    return [{
            rules: {
                id: {
                    isString: {value: true}
                }
            },
            on: 'params'
        }];
}

Controller.prototype.getUserAction = function(req, res) {
    var self = this;

    var user_id = req.validatedValues.params("id");

    return self.app.db.getUserById(user_id, req.query.timeZone || 'Europe/Paris').then(function(result) {
        return result;
    });
}

Controller.prototype.getHistoryValidation = function() {
    return [{
            rules: {
                id: {
                    isString: {value: true}
                }
            },
            on: 'params'
        }];
}

Controller.prototype.getHistoryAction = function(req, res) {
    var self = this;

    var user_id = req.validatedValues.params("id");

    return self.app.db.getUserHistory(user_id, req.query.timeZone || 'Europe/Paris').then(function(results) {

        return Promise.props({
            count: results.length,
            items: results,
            links: {}
        });
    });
}