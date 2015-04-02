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

model.prototype.getHistory = function(user_id) {
    var self = this;

    return self.storeApi.getUserById(user_id).then(function(user) {

        var results = user.historics;
        var data = [];
        _.each(results, function(item) {
            data.push(item)
        })

        return data;
    });
}

model.prototype.getUserById = function(id, date) {
    var self = this;

    return Promise.props({
        user: this.storeApi.getUserById(id)
    }).then(function(results) {

        var user = results.user;

        return self.formatOneUser(user, date);

    });

}


model.prototype.formatOneUser = function(data, date) {
    var self = this;

    var date = new Date();

    if (date != undefined) {
        date = new Date(date);
    }

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
            history: self.generateUrl("/users/" + data.id + "/history")
        }
    }
}
