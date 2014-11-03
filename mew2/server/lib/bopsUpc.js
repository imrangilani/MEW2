'use strict';
var mewProxy = require('./mewProxy'),
    Nipple   = require('nipple'),
    Joi      = require('joi'),
    parser   = require('./parsers/v4/bopsUpc'),
    uri;

module.exports = {
  description: 'v4 BOPS - by UPC',
  notes: 'Buy Online - Pickup in store, return the details for a particular UPS',
  tags: ['bopsUpc', 'api'],
  handler: {
    proxy: {
      timeout: mewProxy.timeout,
      mapUri: function(request, callback) {
        var headers          =  mewProxy.getHeaders(request, process.env.CATALOGBOPSV4_KEY);
        request.url.host     =  mewProxy.getHost(request, process.env.CATALOGBOPSUPCV4_HOST || process.env.API_HOST);
        request.url.pathname += '(upcs,stores)';
        uri                  =  request.url.format(request.url);

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
              // Stores not found; still a valid response as far as client is concerned
            case res.statusCode === 502:
              replyStatusCode = 200;
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
      upcNumber: Joi.number().description('the UPC ID of the individual product sku')
    },
    query: {
      // the zipcode might be in the format 12345-6789, so not necessarily a number
      zipCode:  Joi.string().description('The zip code for the radial search. Supply either zip or city / state'),
      city:     Joi.string().description('The city for the radial search. Supply either zip or city / state'),
      state:    Joi.string().description('The state for the radial search. Supply either zip or city / state'),
      distance: Joi.number().description('The distance for which to do the radial search, in miles'),
      latitude: Joi.number().description('The distance for which to do the radial search, in miles'),
      longitude: Joi.number().description('The distance for which to do the radial search, in miles')
    }
  }
};
