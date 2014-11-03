'use strict';
var rewire = require('rewire'),
    sinon = require('sinon'),
    mew10 = rewire('../lib/mew10');

require('should');

describe('mew10', function() {
  /* jshint camelcase:false */
  mew10.__set__('mewProxy', {
    getHeaders: function() {},
    getHost: function() {}
  });
  var callback = function() {};

  describe('mapUri', function() {

    it('should send a header `X-Integration-Host` on the request to MEW 1.0 with the value of the environment variable INTEGRATION_HOST', function() {
      var request = {
        url: {
          host: 'mew1-subdomain.bloomingdales.fds.com',
          pathname: 'apage'
        },
        app: {}
      };
      var reply = {
        proxy: sinon.spy()
      };
      process.env.INTEGRATION_HOST = 'other-subdomain.bloomingdales.fds.com';

      var callbackSpy = sinon.spy(callback);
      mew10.get.handler(request, reply);
      var mapUri = reply.proxy.lastCall.args[0].mapUri;
      mapUri(request, callbackSpy);
      callbackSpy.lastCall.args[2].should.eql({
        'X-Integration-Host': process.env.INTEGRATION_HOST
      });
    });
  });
});
