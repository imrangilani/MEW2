'use strict';
var	mewProxy = require('./mewProxy');

module.exports = {
	description: 'v3 Category Index',
	notes: 'All the items under the menu.',
	tags: ['categoryIndex', 'api'],
	handler: {
		proxy: {
			timeout: mewProxy.timeout,
			mapUri: function(request, callback) {
				var headers        = mewProxy.getHeaders(request, process.env.CATEGORYINDEXV3_KEY);
				request.url.host   = mewProxy.getHost(request, process.env.CATEGORYINDEXV3_HOST || process.env.API_HOST);
				request.app.parser = require('./parsers/v3/categoryIndex');

				callback(null, request.url.format(request.url), headers);
			},
			onResponse: mewProxy.defaultOnResponse
		}
	}
};
