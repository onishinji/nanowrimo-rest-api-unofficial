module.exports = function(app, config) {
    return new Controller(app, config);
}

var _ = require('lodash');

var Promise = require('bluebird');

Controller = function(app, config) {
    this.config = config;
    this.app = app;

    return this;
}

Controller.prototype.getMainAction = function(req, res) {
    var self = this;
    
    return {
        users: self.app.db.generateUrl("/users/:username")
    };   
}