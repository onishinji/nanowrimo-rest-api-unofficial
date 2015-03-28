var request = require("request");
var util = require("util");
var _ = require("lodash");
var cheerio = require('cheerio');
var request = require("request");
var parseString = require('xml2js').parseString;

module.exports = function(app, config) {
    return new Store(app, config);
}

Store = function(app, config) {
    this.config = config;
    this.app = app;

    return this;
}

Store.prototype.getUserById = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {

        request.get(self.config.endpoint.replace(":username", id), function(error, response, body) {

            if (!error && response.statusCode == 200) {

                $ = cheerio.load(response.body);

                var wordcountToday = parseInt($($("#camper_stats dd")[2]).text().replace(",", ""));
                var userWordToReach = parseInt($($("#camper_stats dd")[3]).text().replace(",", ""));
                var userWordCount = parseInt($($("#camper_stats dd")[4]).text().replace(",", ""));

                var nbDayRemaining = parseInt($($("#camper_stats dd")[7]).text().replace(",", ""));
                var dailyTarget = parseInt($($("#camper_stats dd")[9]).text().replace(",", ""));

                var username = $("p.username a").text();


                var code = $($("script")[5]).text();

                var arr = code.match(/\[.*\]/g);
                var history = arr[1].replace("[", "").replace("]", "").split(",");

                var h = [];
                for(var i = 0; i < history.length; i++) {
                    var date = "day ";
                    date += i+1;
                    h.push({
                        date: date,
                        wordcount: history[i] ? history[i] : 0
                    })
                }

                return resolve({
                    id: username,
                    name: username,
                    wordcount: userWordCount,
                    userWordToReach: userWordToReach,
                    wordcountToday: wordcountToday != undefined ? wordcountToday : 0,
                    nbDayRemaining: nbDayRemaining != undefined ? nbDayRemaining : 0,
                    dailyTarget: dailyTarget,
                    historics: h
                });
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