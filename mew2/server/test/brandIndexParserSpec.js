/*jshint expr: true*/
'use strict';

var parser = require('../lib/parsers/v4/brandIndex'),
    _      = require('lodash'),
    sinon  = require('sinon');

describe('Parser: Brand Index', function () {
  describe('#normalizeUrls', function () {
    it('should remove everithing before .com from `brandURL`', function () {
      var relativeBuyURL = parser.normalizeUrls('http://www1.macys.com/buy/7-for-all-mankind');
      relativeBuyURL.should.eql('/buy/7-for-all-mankind');
    });

    it('should host and &edge=hybrid from `brandURL`', function () {
      var relativeShopURL = parser.normalizeUrls('http://www1.macys.com/shop/womens-clothing/alfani-womens-clothing?id=17994&edge=hybrid');
      relativeShopURL.should.eql('/shop/womens-clothing/alfani-womens-clothing?id=17994');
    });
  });

  describe('#parse', function () {
    var payload;
    beforeEach(function() {
      payload = {
        brandIndex: [
          {
            brandName: '7 For All Mankind',
            ozBrandId: 0,
            brandURL: 'http://www1.macys.com/buy/7-for-all-mankind'
          },
          {
            brandName: 'Alfani',
            ozBrandId: 0,
            brandURL: 'http://www1.macys.com/shop/womens-clothing/alfani-womens-clothing?id=17994&edge=hybrid'
          }
        ]
      };
    });

    it('should remove the `ozBrandId` key', function () {
      var response = parser._parse({}, payload);
      var keys = Object.keys(response.brandIndex[0]);
      _.contains(keys, 'ozBrandId').should.not.be.ok;
    });

    it('should call `normalizeUrls`', function () {
      var spy = sinon.spy(parser, 'normalizeUrls');
      parser._parse({}, payload);
      spy.callCount.should.eql(payload.brandIndex.length);
    });

    describe('integration', function () {
      it('should return the response object with normalized urls and withtout ozBrandIds', function () {
        var expectedResponse = {
          brandIndex: [
            {
              brandName: '7 For All Mankind',
              brandURL: '/buy/7-for-all-mankind'
            },
            {
              brandName: 'Alfani',
              brandURL: '/shop/womens-clothing/alfani-womens-clothing?id=17994'
            }
          ]
        };
        var response = parser._parse({}, payload);
        response.should.eql(expectedResponse);
      });
    });
  });
});