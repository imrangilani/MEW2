'use strict';
var rewire = require('rewire'),
    sinon = require('sinon'),
    product = rewire('../lib/product'),
    Url     = require('url');

require('should');

describe('product', function() {
  /* jshint camelcase:false */
  product.__set__('mewProxy', {
    getHeaders: function() {},
    getHost: function() {}
  });
  var callback = function() {};

  describe('mapUri', function() {

    it('should append the appropriate query string based on viewType', function() {
      var request = {
        url: {
          pathname: 'test',
          query: {
            viewType: 'pdp'
          },
          format: Url.format
        },
        app: {}
      };
      var callbackSpy = sinon.spy(callback);
      product.handler.proxy.mapUri(request, callbackSpy);
      callbackSpy.lastCall.args[1].should.include('test(productdetails,upcs(upcdetails),rebates,promotions,productcategory,reviews(statistics))');
    });

    it('should append the appropriate query string based on viewType', function() {
      var request = {
        url: {
          pathname: 'test',
          query: {
            viewType: 'recentlyViewed'
          },
          format: Url.format
        },
        app: {}
      };
      var callbackSpy = sinon.spy(callback);
      product.handler.proxy.mapUri(request, callbackSpy);
      callbackSpy.lastCall.args[1].should.include('test(productdetails,promotions,productcategory,reviews(statistics))');
    });
  });
});
