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


Controller.prototype.getUsersAction = function(req, res) {
    var self = this;

    throw new Error("NYI");

    var collection = RF.Collection();

    var dataFunction = function(pagination) {
        return self.app.db.getUsers(pagination);
    };
    var countFunction = function() {
        return self.app.db.getUsersCount();
    }

    return collection.returnCollection(req, res, dataFunction, countFunction);
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

    return self.app.db.getUserById(user_id, req.query.date).then(function(result) {
        return result;
    });
}


Controller.prototype.getFriendsValidation = function() {
    return [{
            rules: {
                id: {
                    isString: {value: true}
                }
            },
            on: 'params'
        }];
}

Controller.prototype.getFriendsAction = function(req, res) {
    var self = this;

    var user_id = req.validatedValues.params("id");

    return self.app.db.getFriends(user_id).then(function(results) {

        return Promise.props({
            count: results.length,
            items: results,
            links: {}
        });
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

    return self.app.db.getHistory(user_id).then(function(results) {

        return Promise.props({
            count: results.length,
            items: results,
            links: {}
        });
    });
}