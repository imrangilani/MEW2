'use strict';
var mewProxy = require('./mewProxy'),
    Nipple   = require('nipple'),
    Joi      = require('joi'),
    parser   = require('./parsers/v4/recommendations'),
    uri;

module.exports = {
  description: 'v4 Product Recommendations',
  notes: 'Returns a recommended product list for the current product',
  tags: ['recommendations', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.CATALOGRECOMMENDATIONSV4_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.CATALOGRECOMMENDATIONSV4_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v4/recommendations');
        // Url.format internally runs encodeURIcomponent and this causes ? to encoded as '%3F'
        // So manually appending it after Url.format is run
        uri = request.url.format(request.url) + '&visitorid=' + mewProxy.getReqHeaderCookie(request.state, 'RTD');

        callback(null, uri, headers);
      },
      onResponse: function(err, res, request, reply) {

        if (err) { return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload); }

        Nipple.read(res, function(err, payload) {
          var replyStatusCode = res.statusCode;

          if (err) { return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload); }

          switch (true) {
            case res.statusCode === 200:
              return mewProxy.parseHandler(parser, request, res, payload, reply);
            default:
              // Context: PROS
              // Called after PDP loads
              // If not treated as a 200, error page will display for the PDP although PDP call succeeds

              // ex: PROS loads after PDP, if PDP returns a 200 and PROS returns a non-200, this will result in an error page
              replyStatusCode = 200;
              payload = [];
              break;
          }
          return reply(payload)
            .code(replyStatusCode)
            .type(res.headers['content-type'])
            .header('Upstream-Host', uri);
        });
      }
    }
  },
  validate: {
    path: {
      productId: Joi.string().description('the ID of the product')
    }
  }
};
