var request = require("request");
var util = require("util");
var _ = require("lodash");
var parseString = require('xml2js').parseString;

module.exports = function(app, config) {
    return new Store(app, config);
}

Store = function(app, config) {
    this.config = config;
    this.app = app;

    return this;
}

Store.prototype.getUsers = function(pagination) {
    return new Promise(function(resolve, reject) {

        var items = [];
        for (var i = 0; i < 10; i++) {
            items.push({
                id: i,
                name: 'name ' + i
            })
        }

        return resolve(items);

    });
}

Store.prototype.getUsersCount = function() {
    return new Promise(function(resolve, reject) {
        return resolve(10);
    });
}

Store.prototype.getUserById = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {
        request.get(self.config.endpoint + "/wc/" + id,{timeout: 1500}, function(error, response, body) {
            
            if (!error && response.statusCode === 200) {

                parseString(response.body, function(err, result) {

                    if (err) {
                        return reject(new self.app.errorHandler.NotFoundError("", "user", id));
                    }

                    var user = result.wc;
                    if (user.error !== undefined && user.error.includes("user does not exist")) {
                        return reject(new self.app.errorHandler.NotFoundError("", "user", id));
                    }
                    
                    var username = user.uname && user.uname.length > 0 ? user.uname[0] : id;
                    var user_wordcount = user.user_wordcount && user.user_wordcount.length > 0 ? parseInt(user.user_wordcount[0]) : 0;
                    var uid = id;

                    var hasNovel = !(user.error !== undefined && user.error.includes("user does not have a current novel"))

                    return resolve({
                        id: uid,
                        name: username,
                        wordcount: user_wordcount,
                        hasStartedNovel: hasNovel
                    });
                })

            } else {
                if(error.code && error.code === 'ETIMEDOUT') {
                    error.statusCode = 503;
                    return reject(error);
                }

                return reject(new self.app.errorHandler.NotFoundError("", "user", id));
            }
        });

    });
}

Store.prototype.getHistory = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {

        request.get(self.config.endpoint + "/wchistory/" + id, function(error, response, body) {
            if (!error && response.statusCode == 200) {

                parseString(response.body, function(err, result) {
                    var items = [];

                    if (result.wchistory.wordcounts != undefined && result.wchistory.wordcounts.length > 0) {
                        _.each(result.wchistory.wordcounts[0].wcentry, function(item) {

                            items.push({
                                wordcount: item.wc[0],
                                date: item.wcdate[0],
                            })
                        })
                    }

                    return resolve(items);
                });

            } else {
                return reject(new self.app.errorHandler.NotFoundError("", "user", id));
            }
        });

    });
}