'use strict';
var mewProxy = require('./mewProxy'),
    Nipple   = require('nipple'),
    Joi      = require('joi'),
    parser   = require('./parsers/v3/reviews'),
    uri;

module.exports = {
  description: 'v3 Reviews',
  notes: 'Return a set (or subset) of reviews for a particular product',
  tags: ['reviews', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers      = mewProxy.getHeaders(request, process.env.CATALOGREVIEWSV3_KEY);
        request.url.host = mewProxy.getHost(request, process.env.CATALOGREVIEWSV3_HOST || process.env.API_HOST);
        uri              = request.url.format(request.url);

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
            case res.statusCode === 404:
              request.log(['reviews', 'error'], { statusCode: res.statusCode, message: payload.toString() });
              // Reviews request for a pageNumber that doesn't return reviews - still valid response for client
              replyStatusCode = 200;
              payload = [];
              break;
            case res.statusCode >= 400 && res.statusCode < 600:
              return mewProxy.errorHandler(replyStatusCode, request, reply, payload);
            default:
              break; // Maintain status code
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
      productId:    Joi.number().description('The ID of the product for which to retreive reviews'),
      sortOption:   Joi.string().description('The order in which to sort the reviews'),
      numOfReviews: Joi.number().description('Return this number of reviews'),
      pageNumber:   Joi.number().description('Offset result set based on `numOfReviews`'),
      reviewId:     Joi.number().description('Used as path param for POSTing feedback')
    }
  }
};
