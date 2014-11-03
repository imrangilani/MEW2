'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
  description: 'v2 Store Detail',
  notes: 'Returns the store details.',
  tags: ['storeDetails', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.STOREV2_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.STOREV2_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v2/storeDetails');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
    path: {
      locnbr: Joi.string().description('store location number')
    }
  }
};
