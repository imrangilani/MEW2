'use strict';
var mewProxy = require('./mewProxy');

module.exports = {
  description: 'v2 Add To Bag',
  notes: 'Return the results of adding item to the shopping bag',
  tags: ['addToBag', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      passThrough: true,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.SHOPPINGBAGV2_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.SHOPPINGBAGV2_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v2/addToBag');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
  }
};
