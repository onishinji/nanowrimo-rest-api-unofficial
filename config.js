'use strict';

exports.port = process.env.PORT || 1234;
exports.host = '0.0.0.0';
exports.debug = false;
exports.storeApi = 'api';
exports.storeCrawler = 'crawler';

exports.endpoint = "http://nanowrimo.org/wordcount_api"
exports.endpoint_crawler = "http://nanowrimo.org/participants"

exports.security = {
    methods: {

    },
    rules: {
        
    }
};
