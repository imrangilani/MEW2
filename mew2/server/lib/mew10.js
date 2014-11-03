'use strict';
var mewProxy = require('./mewProxy');

module.exports = {
  get: {
    description: 'mew 1 proxy',
    notes: 'Redirect urls that mew 2 does not process to mew 1',
    tags: ['mew1'],

    handler: function(request, reply) {
      reply.proxy ({
        timeout: mewProxy.timeout,
        passThrough: true,
        mapUri: function(request, callback) {
          // sends the 'X-Integration-Host' header to MEW1 so it knows the host being requested from the browser
          // its value is used on MEW1 to build absolute urls
          var uri = 'http://' + process.env.MEW10_HOST + request.path + (request.url.search || ''),
              headers = { 'X-Integration-Host': process.env.INTEGRATION_HOST };

          callback(null, uri, headers);
        },
        onResponse: mewProxy.onResponseRedirect
      });
    }
  },
  post: {
    description: 'mew 1 proxy',
    notes: 'Redirect urls that mew 2 does not process to mew 1',
    tags: ['mew1'],

    payload: {
      output: 'stream',
      parse: false,
      failAction: 'error'
    },
    handler: function(request, reply) {
      reply.proxy ({
        timeout: mewProxy.timeout,
        passThrough: true,
        mapUri: function(request, callback) {
          // sends the 'X-Integration-Host' header to MEW1 so it knows the host being requested from the browser
          // its value is used on MEW1 to build absolute urls
          var uri = 'http://' + process.env.MEW10_HOST + request.path + (request.url.search || ''),
              headers = { 'X-Integration-Host': process.env.INTEGRATION_HOST };

          callback(null, uri, headers);
        },
        onResponse: mewProxy.onResponseRedirect
      });
    }
  }
};
