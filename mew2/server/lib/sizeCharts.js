'use strict';
var mewProxy = require('./mewProxy'),
    Joi      = require('joi');

module.exports = {
  description: 'v4 SizeChart - by product',
  notes: 'Return json used to render size charts',
  tags: ['sizeChart', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers          =  mewProxy.getHeaders(request, process.env.SIZECHARTV4_KEY || process.env.CATALOGPRODUCTV4_KEY);
        request.url.host     =  mewProxy.getHost(request, process.env.SIZECHART_HOST || process.env.API_HOST);
        request.app.parser   =  require('./parsers/v4/sizeCharts');

        callback(null, request.url.format(request.url), headers);
      },
      onResponse: mewProxy.defaultOnResponse
    }
  },
  validate: {
    query: {
      canvasId: Joi.number().description('The id of the canvas for the product size chart')
    }
  }
};
