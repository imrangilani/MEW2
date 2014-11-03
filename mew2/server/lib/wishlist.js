'use strict';
var mewProxy = require('./mewProxy');

module.exports = {
  description: 'v1 wishlist',
  notes: 'Return the results of adding item to wishlist',
  tags: ['wishlist', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      passThrough: true,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.WISHLISTV1_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.WISHLISTV1_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v1/wishlist');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
  }
};
