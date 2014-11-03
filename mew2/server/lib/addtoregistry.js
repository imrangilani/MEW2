'use strict';
var mewProxy = require('./mewProxy');

var mapMEW2PathToMEW1 = function(request, callback) {
  var uri = 'http://' + process.env.MEW10_HOST + '/registry/wedding/addtoregistry' + (!!request.url.search ? request.url.search : '');
  callback(null, uri);
};

module.exports = {
  description: 'Access site\'s addtoregistry servlet',
  notes: 'Return the results of adding item to the registry',
  tags: ['addToRegistry', 'site'],
  payload: {
    output: 'stream',
    parse: false,
    failAction: 'error'
  },
  handler: function(request, reply) {
    if (request.query && request.query.registryClaim){
      reply.proxy ({
        mapUri: mapMEW2PathToMEW1,
        timeout: 10000,
        passThrough: true,
        onResponse: mewProxy.onResponseRedirect
      });
    } else {
      request.app.parser = require('./parsers/addToRegistry');
      reply.proxy ({
        mapUri: mapMEW2PathToMEW1,
        timeout: 10000,
        passThrough: true,
        onResponse: mewProxy.defaultOnResponse
      });
    }
  }
};
