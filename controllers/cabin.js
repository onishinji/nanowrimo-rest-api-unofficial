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

Controller.prototype.getCabinValidation = function() {
    return [{
            rules: {
                id: {
                    isString: {value: true}
                }
            },
            on: 'params'
        }];
}

Controller.prototype.getCabinAction = function(req, res) {
    var self = this;

    var user_id = req.validatedValues.params("id");

    return self.app.db.getCabinByUserId(user_id, req.query.date).then(function(result) {
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

    return self.app.db.getCabinHistory(user_id).then(function(results) {

        return Promise.props({
            count: results.length,
            items: results,
            links: {}
        });
    });
}