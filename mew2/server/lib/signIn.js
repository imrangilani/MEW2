'use strict';
var mewProxy = require('./mewProxy'),
    Nipple   = require('nipple'),
    parser   = require('./parsers/v1/signIn'),
    uri;

module.exports = {
  description: 'v1 Sign in',
  notes: 'Sign in process',
  tags: ['signIn', 'api'],
  payload: {
    output: 'stream',
    parse: false,
    failAction: 'error'
  },
  handler: function(request, reply) {
    reply.proxy ({
      timeout: mewProxy.timeout,
      passThrough: true,
      mapUri: function(request, callback) {
        uri = (process.env.SECURE_PROTOCOL || 'https') + '://' + process.env.SECURE_HOST + 
              (process.env.SECURE_PORT ? ':' + process.env.SECURE_PORT : '') + process.env.SECURE_URL;

        callback(null, uri);
      },
      onResponse: function(err, res, request, reply) {

        if (err) { return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload); }

        Nipple.read(res, function(err, payload) {
          var replyStatusCode = res.statusCode;

          if (err) { return mewProxy.errorHandler(err.output.statusCode, request, reply, err.output.payload); }

          switch (true) {
            case res.statusCode === 200:
              // return mewProxy.parseHandler(parser, request, res, payload, reply);
              return reply(parser._parse(request, JSON.parse(payload), res))
                .code(res.statusCode)
                .header('Set-Cookie', res.headers['set-cookie'])
                .header('Env-Config-Build', process.env.CONFIG_BUILD_VERSION)
                .header('Upstream-Host', request.url.format(request.url));
            case res.statusCode === 422:
              // Invalid credentials
              break;
            case res.statusCode >= 400 && res.statusCode < 600:
              return mewProxy.errorHandler(replyStatusCode, request, reply, payload);
            default:
              break; // Maintain status code
          }

          return reply(payload)
            .code(replyStatusCode)
            .type(res.headers['content-type'])
            .header('Env-Config-Build', process.env.CONFIG_BUILD_VERSION)
            .header('Upstream-Host', uri);
        });
      }
    });
  }
};
