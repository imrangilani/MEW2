'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
  description: 'v4 Brand Index',
  notes: 'All the brands for the FOB.',
  tags: ['brandIndex', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.BRANDINDEXV4_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.BRANDINDEXV4_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v4/brandIndex');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
    path: {
      fobCatId: Joi.string().description('the ID of FOB category')
    }
  }
};
