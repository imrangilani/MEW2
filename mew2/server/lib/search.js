'use strict';
var mewProxy = require('./mewProxy');

module.exports = {
  description: 'v4 Search',
  notes: 'Return a set (or subset) of products for a particular search term',
  tags: ['search', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.CATALOGSEARCHV4_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.CATALOGSEARCHV4_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v4/search');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  }
};
