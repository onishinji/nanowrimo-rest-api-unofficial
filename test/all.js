var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var should = require('chai').should(),
        expect = require('chai').expect,
        assert = require('chai').assert;

var Promise = require('bluebird');

var _ = require('lodash');

var express = require('express');
var request = require('supertest');

var app = require("../app")

describe('API', function() {
    this.timeout(0);
    var at = "user_a";

    describe('Users ', function() {

        it("should expose urls", function(done) {
            request(app)
                    .get('/')
                    .expect(function(res) {

                        if (!('users' in res.body))
                            return "missing users key";


                    })
                    .expect(200, done);
        });


        it("should throw error on /users", function(done) {
            request(app)
                    .get('/users')
                    .expect(500, done);
        });


        it("should success on /users/silwek", function(done) {
            request(app)
                    .get('/users/silwek')
                    .expect(200, done);
        });

        it("should throw error on /users/indzqdqzd", function(done) {
            request(app)
                    .get('/users/indzqdqzd')
                    .expect(404, done);
        });


        it("should grab friends", function(done) {
            request(app)
                    .get('/users/silwek/friends')
                    .expect(function(res) {

                        if (!('count' in res.body))
                            return "missing count key";

                        if (!('items' in res.body))
                            return "missing items key";

                        if (!('links' in res.body))
                            return "missing links key";

                    })
                    .expect(200, done);
        });

         it("should grab history", function(done) {
            request(app)
                    .get('/users/silwek/history')
                    .expect(function(res) {

                        if (!('count' in res.body))
                            return "missing count key";

                        if (!('items' in res.body))
                            return "missing items key";

                        if (!('links' in res.body))
                            return "missing links key";

                    })
                    .expect(200, done);
        });
    });
});