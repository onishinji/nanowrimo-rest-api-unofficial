var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function(app, config) {
    return new model(app, config);
}


model = function(app, config) {
    this.config = config;
    this.app = app;

    this.storeApi = require('../store/' + config.storeApi + '.js')(app, config);

    return this;
}

model.prototype.getUserHistory = function(user_id, timezone) {
    var self = this;

    return self.storeApi.getProjectByUserId(user_id, timezone).then(function(user) {

        var results = user.historics;
        var data = [];
        _.each(results, function(item) {
            data.push(item)
        })

        return data;
    });
}

model.prototype.getProjectByUserId = function(id, timezone) {
    var self = this;

    return Promise.props({
        user: this.storeApi.getProjectByUserId(id, timezone)
    }).then(function(results) {

        var user = results.user;

        return self.formatOneProject(user);
    });
}

model.prototype.getCabinHistory = function(user_id) {
    var self = this;

    return self.storeApi.getCabinByUserId(user_id).then(function(user) {

        var results = user.historics;
        var data = [];
        _.each(results, function(item) {
            data.push(item)
        })

        return data;
    });
}

model.prototype.getCabinByUserId = function(id, date) {
    var self = this;

    return Promise.props({
        user: this.storeApi.getCabinByUserId(id)
    }).then(function(results) {

        var user = results.user;

        var cabin = self.formatOneProject(user);
        if(isNaN(cabin.wordcount) && isNaN(cabin.userGoal)) {
            return Promise.reject(new self.app.errorHandler.NotFoundError("", "cabin", id));
        }

        cabin.links = {
            self: self.generateUrl("/cabin/" + cabin.id),
            history: self.generateUrl("/cabin/" + cabin.id + "/history"), 
        }

        return cabin;
    });
}

model.prototype.formatOneProject = function(data) {
    var self = this;

    var userWordToday = data.wordcountToday != undefined ? data.wordcountToday : 0;
    var dailyTarget = data.dailyTarget;
    var nbDayRemaining = data.nbDayRemaining;
    var dailyTargetRemaining = 0;

    var userWordCount = data.wordcount;
    var userWordToReach = data.userWordToReach;

    var wordRemaining = userWordToReach - userWordCount;

    dailyTargetRemaining = dailyTarget - userWordToday > 0 ? dailyTarget - userWordToday : 0;

    return {
        id: data.id,
        name: data.name,
        wordcount: parseInt(data.wordcount),
        wordCountToday: Math.ceil(userWordToday),
        dailyTarget: Math.ceil(dailyTarget),
        dailyTargetRemaining: Math.ceil(dailyTargetRemaining),
        nbDayRemaining: nbDayRemaining,
        userGoal: userWordToReach,
        averageWordPerDay: data.averageWordPerDay,
        links: {
            self: self.generateUrl("/users/" + data.id),
            history: self.generateUrl("/users/" + data.id + "/history"),
            cabin: self.generateUrl("/cabin/" + data.id)
        }
    }
}


model.prototype.getUserById = function(id, timezone) {
  var self = this;

  return Promise.props({
    user: this.storeApi.getUserById(id, timezone)
  }).then(function(results) {

    var user = results.user;

    return user;
  });
}
