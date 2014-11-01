var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function(app, config) {
    return new model(app, config);
}


model = function(app, config) {
    this.config = config;
    this.app = app;

    this.storeApi = require('../store/' + config.storeApi + '.js')(app, config);
    this.storeCrawler = require('../store/' + config.storeCrawler + '.js')(app, config);

    return this;
}


model.prototype.getUsers = function(pagination) {

    var self = this;

    return new Promise(function(resolve, reject) {
        self.storeApi.getUsers(pagination).then(function(results) {

            var data = [];
            _.each(results, function(item) {
                data.push(self.formatUser(item))
            })

            resolve(data);

        }).catch(function(e) {
            reject(e);
        })

    });
}

model.prototype.getUsersCount = function() {
    return this.storeApi.getUsersCount();
}



model.prototype.getFriends = function(user_id) {

    var self = this;

    return self.storeCrawler.getBuddiesFor(user_id).then(function(results) {

        var data = [];
        _.each(results, function(item) {
            data.push(self.formatUser(item))
        })

        return data;
    })
}

model.prototype.getHistory = function(user_id) {
    var self = this;

    return self.storeApi.getHistory(user_id).then(function(results) {

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
        user: this.storeApi.getUserById(id),
        history: this.storeApi.getHistory(id)
    }).then(function(results) {

        var user = results.user;
        var today = new Date();

        if (date != undefined) {
            today = new Date(date);
        }
        _.each(results.history, function(item) {
            var month = today.getMonth() + 1;
            if (item.date == today.getFullYear() + "-" + month + "-" + today.getDate()) {
                user.wordcountToday = item.wordcount;
            }
        })

        return self.formatOneUser(user, date);

    });

}


model.prototype.formatOneUser = function(data, date) {
    var self = this;

    var date = new Date();

    if (date != undefined) {
        date = new Date(date);
    }

    var userWordToday = 0;
    var dailyTarget = 0;
    var nbDayRemaining = null;
    var dailyTargetRemaining = 0;
    // we are in november
    if (date.getMonth() + 1 == '11') {

        var currentDay = date.getDate() - 1;
        var lastDay = 30;

        var nbDayRemaining = lastDay - currentDay;

        var userWordCount = data.wordcount;
        var userWordToReach = 50000;

        var wordRemaining = userWordToReach - userWordCount;

        userWordToday = data.wordcountToday != undefined ? data.wordcountToday : 0;

        dailyTarget = (wordRemaining - userWordToday) / nbDayRemaining;

        dailyTargetRemaining = dailyTarget - userWordToday > 0 ? dailyTarget - userWordToday : 0;
    }

    return {
        id: data.id,
        name: data.name,
        wordcount: parseInt(data.wordcount),
        wordCountToday: Math.ceil(userWordToday),
        dailyTarget: Math.ceil(dailyTarget),
        dailyTargetRemaining: Math.ceil(dailyTargetRemaining),
        nbDayRemaining: nbDayRemaining,
        links: {
            self: self.generateUrl("/users/" + data.id),
            friends: self.generateUrl("/users/" + data.id + "/friends"),
            history: self.generateUrl("/users/" + data.id + "/history")
        }
    }
}


model.prototype.formatUser = function(data) {
    var self = this;


    return {
        id: data.id,
        name: data.name,
        wordcount: parseInt(data.wordcount),
        links: {
            self: self.generateUrl("/users/" + data.id),
            friends: self.generateUrl("/users/" + data.id + "/friends"),
            history: self.generateUrl("/users/" + data.id + "/history")
        }
    }
}
