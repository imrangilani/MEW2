'use strict';
var mewProxy = require('./mewProxy'),
    parser   = require('./parsers/v2/store'),
    Nipple = require('nipple');

module.exports = {
  description: 'v2 Store Detail',
  notes: 'The search feature to find stores.',
  tags: ['store', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers        = mewProxy.getHeaders(request, process.env.STOREV2_KEY);
        request.url.host   = mewProxy.getHost(request, process.env.STOREV2_HOST || process.env.API_HOST);
        request.app.parser = require('./parsers/v2/store');

        callback(null, request.url.format(request.url), headers);
      },
      // we handle the 400 response as a 200, because it is just a "no stores found" situation
      onResponse: function(err, res, request, reply) {
        var uri = request.url.format(request.url);
        if (err) { return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload); }

        Nipple.read(res, function(err, payload) {
          var replyStatusCode = res.statusCode,
              newPayload = payload;

          if (err) { return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload); }

          switch (true) {
            case res.statusCode === 400:
              newPayload = '{}';
              /* falls through */
            case res.statusCode === 200:
              return mewProxy.parseHandler(parser, request, res, newPayload, reply);
            case res.statusCode > 400 && res.statusCode < 600:
              return mewProxy.errorHandler(replyStatusCode, request, reply, newPayload);
            default:
              break; // Maintain status code
          }
          return reply(newPayload)
            .code(replyStatusCode)
            .type(res.headers['content-type'])
            .header('Upstream-Host', uri);
        });
      }
    }
  }
};
