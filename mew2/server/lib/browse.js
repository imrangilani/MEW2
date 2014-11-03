'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
	description: 'v3 Category Browse Products',
	notes: 'Returns a set (or subset) of products for a particular category',
	tags: ['browse', 'api'],
	handler: {
		proxy: {
			timeout: mewProxy.timeout,
			mapUri: function(request, callback) {
				var headers        = mewProxy.getHeaders(request, process.env.CATALOGCATEGORYBROWSEPRODUCTV3_KEY);
				request.url.host   = mewProxy.getHost(request, process.env.CATALOGCATEGORYBROWSEPRODUCTV3_HOST || process.env.API_HOST);
				request.app.parser = require('./parsers/v3/categoryBrowseProducts');

				callback(null, request.url.format(request.url), headers);
			},
			onResponse: mewProxy.defaultOnResponse
		}
	},
  validate: {
    path: {
      categoryId: Joi.number().description('The ID of the category for which to browse products')
    }
  }
};
