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

                var averageWordPerDay = parseInt($($("#camper_stats dd")[0]).text().replace(",", ""));
                var wordcountToday = parseInt($($("#camper_stats dd")[2]).text().replace(",", ""));
                var userWordToReach = parseInt($($("#camper_stats dd")[3]).text().replace(",", ""));
                var userWordCount = parseInt($($("#camper_stats dd")[4]).text().replace(",", ""));

                var nbDayRemaining = parseInt($($("#camper_stats dd")[7]).text().replace(",", ""));
                var dailyTarget = parseInt($($("#camper_stats dd")[9]).text().replace(",", ""));

                var username = $("p.username a").text();

                var code = $($("script")[5]).text();

                var arr = code.match(/\[.*\]/g);

                // not data
                if(!arr) {
                    return reject(new self.app.errorHandler.NotFoundError("", "user", id));
                }

                var history = arr[1].replace("[", "").replace("]", "").split(",");

                var h = [];
                for(var i = 0; i < history.length; i++) {
                    var date = "day ";
                    date += i+1;
                    var wordcount = history[i] ? history[i] : 0;

                    if(i > 0) {
                        var previous = history[i-1] ? history[i-1] : 0;
                        wordcount = wordcount - previous;
                    }                    

                    h.push({
                        date: date,
                        wordcount: parseInt(wordcount)
                    })
                }

                nbDayRemaining = nbDayRemaining != undefined ? nbDayRemaining : 0;
                wordcountToday = wordcountToday != undefined ? wordcountToday : 0;
                // 
                dailyTarget = (userWordToReach - userWordCount + wordcountToday) / nbDayRemaining;

                return resolve({
                    id: id,
                    name: username,
                    wordcount: userWordCount,
                    userWordToReach: userWordToReach,
                    wordcountToday: wordcountToday,
                    nbDayRemaining: nbDayRemaining,
                    dailyTarget: dailyTarget,
                    averageWordPerDay: averageWordPerDay,
                    historics: h
                });
            } else {
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