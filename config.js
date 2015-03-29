'use strict';

exports.port = process.env.PORT || 1234;
exports.host = '0.0.0.0';
exports.debug = false;
exports.storeApi = 'api';

exports.endpoint = "http://campnanowrimo.org/campers/:username/stats";

if(exports.debug) {
    exports.endpoint = "http://new-class.com/nanowrimo/camp/test.html";
}

exports.security = {
    methods: {

    },
    rules: {
        
    }
};
