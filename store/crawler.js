var cheerio = require('cheerio');
var request = require("request");
var _ = require("lodash");

module.exports = function(app, config) {
    return new Store(app, config);
}

Store = function(app, config) {
    this.config = config;
    this.app = app;

    return this;
}


Store.prototype.getBuddiesFor = function(id) {
    var self = this;
    
    var firstPage = self.config.endpoint_crawler + "/" + id + "/buddies";
    // First hit, analyse pagination and return urls
    var p = self.grabPaginationsForPage(firstPage);
    return p.then(function(pages) {

        var promises = [];
        pages.push(firstPage);

        _.each(pages, function(item) {
            var p = self.grabBuddiesForPage(item);
            promises.push(p);
        });

        return Promise.all(promises).then(function(results) {
            var friends = [];
            _.each(results, function(result){

                _.each(result, function(buddy){
                    friends.push(buddy);
                })

            });

            return _.sortBy(friends, 'name');
        });
    })

}

Store.prototype.grabPaginationsForPage = function(url) {
    return new Promise(function(resolve, reject) {
        var links = [];
        request.get(url, function(error, response, body) {

            if (!error && response.statusCode == 200) {
                $ = cheerio.load(response.body);

                $(".pagination a").each(function(i, elem) {
                    var link = $(this).attr('href');
                    links[link] = "http://nanowrimo.org/" + link;
                });

                return resolve(_.values(links));
            } else {
                return reject();
            }
        });
    });
}

Store.prototype.grabBuddiesForPage = function(url, pagination) {

    return new Promise(function(resolve, reject) {

        request.get(url, function(error, response, body) {

            if (!error && response.statusCode == 200) {

                $ = cheerio.load(response.body);

                var items = [];
                $("a.user_link").each(function(i, elem) {

                    var link = $(this).attr('href');
                    var parts = link.split("/");
                    var id = parts[parts.length - 1];

                    items.push({
                        name: $(this).text(),
                        id: id
                    });
                });

                return resolve(items);
            } else {
                return reject();
            }
        });

    })
}