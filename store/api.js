var request = require("request");
var util = require("util");
var _ = require("lodash");
var cheerio = require('cheerio');
var request = require("request");
var parseString = require('xml2js').parseString;
var moment = require("moment-timezone")

module.exports = function(app, config) {
    return new Store(app, config);
}

Store = function(app, config) {
    this.config = config;
    this.app = app;

    return this;
}

Store.prototype.getUserById = function (id) {
  var self = this;

  return new Promise(function(resolve, reject) {
    request.get(self.config.endpoint.replace(":username", id), { rejectUnauthorized: false, followRedirect: false }, function(error, response, body) {

      if (error) {
        return reject(error);
      }

      if (response.statusCode === 200) {
        $ = cheerio.load(response.body);
        var username = $("p.username a").text();

        console.log(username)

        return resolve({
          id: id,
          name: username
        })
      }

      if (response.statusCode === 302) {
        return resolve({
          id: id,
          name: id
        })
      }

      if (response.statusCode === 404) {
        return reject(new self.app.errorHandler.NotFoundError("", "user", id));
      }

      return reject(error);
    })
  })
}

Store.prototype.getProjectByUserId = function(id, timezone) {
    var self = this;

    return new Promise(function(resolve, reject) {
        request.get(self.config.endpoint.replace(":username", id), { rejectUnauthorized: false }, function(error, response, body) {
            if (!error && response.statusCode == 200) {

                $ = cheerio.load(response.body);

                var averageWordPerDay = parseInt($($("#camper_stats dd")[6]).text().replace(",", "")); // Your Average Per Day 6
                var wordcountToday = parseInt($($("#camper_stats dd")[2]).text().replace(",", "")); // Words Written Today
                var userWordToReach = parseInt($($("#camper_stats dd")[0]).text().replace(",", ""));
                var userWordCount = parseInt($($("#camper_stats dd")[3]).text().replace(",", ""));

                var nbDayRemaining = moment().tz(timezone).daysInMonth() - moment().tz(timezone).date() + 1

                var username = $("p.username a").text();

                var code = $($("script")[5]).text();

                var arr = code.match(/\[.*\]/g);

                // not data
                if(!arr) {
                    return reject(new self.app.errorHandler.NotFoundError("", "project", id));
                }

                var history = arr[1].replace("[", "").replace("]", "").split(",");

                var h = [];
                for(var i = 0; i < history.length; i++) {
                    var date = "";
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

                nbDayRemaining = nbDayRemaining || 0;
                wordcountToday = wordcountToday || 0;
                // 
                var dailyTarget = (userWordToReach - userWordCount + wordcountToday) / nbDayRemaining;

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
                return reject(new self.app.errorHandler.NotFoundError("", "project", id));
            }
        });
    });
}

Store.prototype.getCabinByUserId = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {

        request.get(self.config.endpoint.replace(":username", id), { rejectUnauthorized: false }, function(error, response, body) {

            // disabled cabin stats, in camp 04/2017 cabin stats aren't available
            return reject(new self.app.errorHandler.NotFoundError("", "cabin", id));
        });
    });
}

