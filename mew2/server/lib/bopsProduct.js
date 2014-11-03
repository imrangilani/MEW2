'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
  description: 'v4 BOPS - by product',
  notes: 'Buy Online - Pickup in store, return details for a product at a specific location',
  tags: ['bopsProduct', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers          =  mewProxy.getHeaders(request, process.env.CATALOGBOPSV4_KEY);
        request.url.host     =  mewProxy.getHost(request, process.env.CATALOGBOPSPRODUCTV4_HOST || process.env.API_HOST);
        request.url.pathname += '(upcs,stores)';
        request.app.parser   =  require('./parsers/v4/bopsProduct');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
    path: {
      productId: Joi.number().description('the Web ID of the product')
    },
    query: {
      locationNumber: Joi.number().description('The identifier for the location on which to do the BOPS lookup')
    }
  }
};
