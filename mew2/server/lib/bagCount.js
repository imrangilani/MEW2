'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
  description: 'v4 Bag Count',
  notes: 'Return a number of cart items for a sepcified userId',
  tags: ['bagCount', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.SHOPPINGBAGV2_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.SHOPPINGBAGV2_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v2/bagCount');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
    path: {
      userid: Joi.number().description('The user id for which the bag count is retrieved')
    }
  }
};
