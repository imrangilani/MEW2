'use strict';

var Hapi     = require('hapi'),
    mewProxy = require('./mewProxy'),
    Nipple   = require('nipple'),
    Zlib     = require('zlib');

var WriteReview = {
  get: {
    description: 'get write review form data',
    notes: 'has product-specific information needed for write review form',
    tags: ['writeReview', 'api'],

    handler: function(request, reply) {
      reply.proxy ({
        timeout: mewProxy.timeout,
        passThrough: true,
        mapUri: function(request, callback) {
          var headers        = mewProxy.getHeaders(request, process.env.WRITEREVIEWV3_KEY);
          request.url.host   = mewProxy.getHost(request, process.env.WRITEREVIEWV3_HOST || process.env.API_HOST);
          request.app.parser = require('./parsers/v3/writeReviewGet');

          callback(null, request.url.format(request.url), headers);
        },
        onResponse: mewProxy.defaultOnResponse
      });
    }
  },
  post: {
    description: 'post write review form data',
    notes: 'Allows user submission of a review for a particular product',
    tags: ['writeReview', 'api'],

    handler: {
      proxy: {
        timeout: mewProxy.timeout,
        passThrough: true,
        mapUri: function(request, callback) {
          var headers        = mewProxy.getHeaders(request, process.env.WRITEREVIEWV3_KEY);
          request.url.host   = mewProxy.getHost(request, process.env.WRITEREVIEWV3_HOST || process.env.API_HOST);
          request.app.parser = require('./parsers/v3/writeReviewPost');

          callback(null, request.url.format(request.url), headers);
        },
        onResponse: function(err, res, request, reply) {
          Nipple.read(res, function(err, payload) {

            if (err) {
              return reply({ response: err.output.payload });
            }
            else {
              switch (true) {
              case res.statusCode === 200:
                return mewProxy.parseHandler(request.app.parser, request, res, payload, reply);
              default:
                var message = payload;

                if (Buffer.isBuffer(payload)) {
                  Zlib.unzip(payload, function (err, chunk) {
                    message = chunk ? JSON.parse(chunk) : JSON.parse(payload);
                    WriteReview.responseCallback(reply, res.statusCode, message);
                  });
                } else {
                  WriteReview.responseCallback(reply, res.statusCode, message);
                }
              }
            }
          });
        }
      }
    }
  }
};

WriteReview.responseCallback = function(reply, statusCode, payload) {
  switch (statusCode) {
  case 400:
    // Treat all errors not processed by this error handler as 500s
    var respCode = 500;
    var field;

    var message = '';

    // Check for the message in the errors array
    if (payload.errors) {
      var errorObject = payload.errors[0];

      if (errorObject) {
        if (errorObject.field) {
          respCode = 400;
          field = errorObject.field;
        }
        else if (errorObject.message.toLowerCase().indexOf('duplicate') !== -1) {
          respCode = 400;
          field = 'duplicate';
        }

        message = errorObject.message;
      }
    }

    payload = {
      success: false,
      message: message,
      field: field
    };

    var error;
    if (respCode === 400) {
      error = Hapi.error.badRequest('Error submitting request with supplied data');
    }
    else {
      error = Hapi.error.internal('Unrecognized error');
    }

    error.output.statusCode = respCode;
    error.output.payload = payload;

    return reply(error);
  default:
    // This is an error our app does not support
    return reply({ response: payload });
  }
};

module.exports = WriteReview;
