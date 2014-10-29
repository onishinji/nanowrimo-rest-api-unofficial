var request = require("request");
var libxmljs = require("libxmljs");
var util = require("util");

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
 
        request.get(self.config.endpoint + "/wc/" + id, function(error, response, body) {
            if (!error && response.statusCode == 200) {

                var xmlDoc = libxmljs.parseXml(response.body);
                
                var gchild = xmlDoc.get('//error');
                if (gchild != undefined) {
                    var error = new self.app.errorHandler.NotFoundError("", "user", id);
                    return reject(error);
                }

                var gchild = xmlDoc.get('//uname');
                var username = gchild.text();


                var gchild = xmlDoc.get('//user_wordcount');
                var user_wordcount = gchild.text();

                var uid = username.toLowerCase().trim();

                return resolve({
                    id: uid,
                    name: username,
                    wordcount: user_wordcount
                });
            } else {
                return reject();
            }
        });

    });
}