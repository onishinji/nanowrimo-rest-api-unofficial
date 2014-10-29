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



model.prototype.getFriends = function(user_id, pagination) {

    var self = this;

    return new Promise(function(resolve, reject) {
        self.storeCrawler.getBuddiesFor(user_id).then(function(results) {

            var data = [];
            _.each(results, function(item) {
                data.push(self.formatUser(item))
            })

            var page = pagination.page;
            var limit = pagination.limit;
            
            resolve(data.slice((page - 1) * limit, (page - 1) * limit + limit));

        }).catch(function(e) {
            reject(e);
        })

    });
}

model.prototype.getFriendsCount = function(user_id) {
    var self = this;

    return self.storeCrawler.getBuddiesFor(user_id).then(function(results) {
        return results.length;
    });
}


model.prototype.getUserById = function(id) {
    var self = this;

    return this.storeApi.getUserById(id).then(function(user){
        return self.formatUser(user);
    })
}

model.prototype.formatUser = function(data) {
    var self = this;

    
    return {
        id: data.id,
        name: data.name,
        wordcount: data.wordcount,
        links: {
            self: self.generateUrl("/users/" + data.id),
            friends: self.generateUrl("/users/" + data.id +"/friends")
        }
    }
}
