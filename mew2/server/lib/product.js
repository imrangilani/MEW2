'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
  description: 'v4 Search',
  notes: 'Return a set (or subset) of products for a particular search term',
  tags: ['product', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.CATALOGPRODUCTV4_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.CATALOGPRODUCTV4_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v4/product');

        if (request.url.query.viewType === 'pdp') {
          request.url.pathname += '(productdetails,upcs(upcdetails),rebates,promotions,productcategory,reviews(statistics))';
        } else {
          request.url.pathname += '(productdetails,promotions,productcategory,reviews(statistics))';
        }

        if (request.url.query.viewType) {
          delete request.url.query.viewType;
        }

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
    path: {
      productId: Joi.string().description('the Web ID of the product')
    }
  }
};
