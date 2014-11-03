'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
	description: 'v3 Ad Media',
	notes: 'Banners for homepage, splash pages, etc',
	tags: ['adMedia', 'api'],
	handler: {
		proxy: {
			timeout: mewProxy.timeout,
			mapUri: function(request, callback) {
				var headers          = mewProxy.getHeaders(request, process.env.ADMEDIAGLOBALV3_KEY);
				request.url.host     = mewProxy.getHost(request, process.env.ADMEDIAGLOBALV3_HOST || process.env.API_HOST);
				request.url.pathname = request.url.pathname.replace('marketmedia', 'admedia');
				request.app.parser   = require('./parsers/v3/admediaGlobal');

				callback(null, request.url.format(request.url), headers);
			},
			onResponse: mewProxy.defaultOnResponse
		}
	},
	validate: {
		query: {
			poolName: Joi.string().description('The Astra pool name for this ad media pool.')
		}
	}
};
