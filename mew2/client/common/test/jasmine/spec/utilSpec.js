define([
  'util/_util',
  'url-parser'
], function (utils) {
  'use strict';

  describe('_util', function () {

    describe('#parseUrlQueryParameters', function(){
      var url = '/shop/anotherpath?param1=aaaaa&param2=bbbbb&param3=ccccc';

      it('should correctly parse url parameters', function() {
        expect( utils.url.parseUrlQueryParameters(url, { 'param': 'param1'}).param).toEqual( 'aaaaa');
        expect( utils.url.parseUrlQueryParameters(url, { 'param': 'param2'}).param).toEqual( 'bbbbb');
        expect( utils.url.parseUrlQueryParameters(url, { 'param': 'param3'}).param).toEqual( 'ccccc');
      });
    });

    describe('#buildUrl', function() {
      function UrlTest(url, parts) {
        this.url = url;
        this.parts = parts;
      }

      var full = new UrlTest('https://www.cnn.com:6070/sign/in?uid=84fd53&pwd=1111#Title', {
          protocol: 'https',
          host: 'www.cnn.com',
          port: '6070',
          path: 'sign/in',
          query: 'uid=84fd53&pwd=1111',
          fragment: 'Title'
        });

      var relative = new UrlTest('/shop/kids/shoes?id=1001238&edge=hybrid', {
        path: 'shop/kids/shoes',
        query: 'id=1001238&edge=hybrid'
      });

      var noPathButWithQuery = new UrlTest('http://www.bloomingdalesjobs.com/?cm_sp=NAVIGATION-_-BOTTOM_NAV-_-CAREERS', {
        protocol: 'http',
        host: 'www.bloomingdalesjobs.com',
        query: 'cm_sp=NAVIGATION-_-BOTTOM_NAV-_-CAREERS'
      });

      it('should build properly formed urls from url parts', function() {
        expect(utils.buildFullUrl(full.parts)).toEqual(full.url);
        expect(utils.buildFullUrl(relative.parts)).toEqual(relative.url);
        expect(utils.buildFullUrl(noPathButWithQuery.parts)).toEqual(noPathButWithQuery.url);
      });
    });

    describe('#renameProperties', function() {
      var original;

      beforeEach(function() {
        original = (function() {
          return {
            'categoryId': 100,
            'searchphrase': 'alfonse',
            'productId': 9999,
            'sortby': 'price,asc',
            'show': 'product,facet,reviews',
            'perpage': 20
          };
        }());
      });

      it('should return the same object if NO shortcut map (or an empty one) is provided', function() {
        var compacted = utils.renameProperties(original);
        expect(compacted.categoryId).toBe(original.categoryId);
        expect(compacted.searchphrase).toBe(original.searchphrase);
        expect(compacted.productId).toBe(original.productId);
        expect(compacted.sortby).toBe(original.sortby);
        expect(compacted.show).toBe(original.show);
        expect(compacted.perpage).toBe(original.perpage);

        compacted = utils.renameProperties(original, {});
        expect(compacted.categoryId).toBe(original.categoryId);
        expect(compacted.searchphrase).toBe(original.searchphrase);
        expect(compacted.productId).toBe(original.productId);
        expect(compacted.sortby).toBe(original.sortby);
        expect(compacted.show).toBe(original.show);
        expect(compacted.perpage).toBe(original.perpage);
      });

      it('should return a shortcutted object if a map is provided', function() {
        var map = {
          'categoryId': 'cid',
          'searchphrase': 'sp',
          'show': 's'
        };

        var compacted = utils.renameProperties(original, map);
        expect(compacted.cid).toBe(original.categoryId);
        expect(compacted.sp).toBe(original.searchphrase);
        expect(compacted.s).toBe(original.show);
        expect(compacted.productId).toBe(original.productId);
        expect(compacted.sortby).toBe(original.sortby);
        expect(compacted.perpage).toBe(original.perpage);
        expect(compacted.categoryId).toBeUndefined();
        expect(compacted.searchphrase).toBeUndefined();
        expect(compacted.show).toBeUndefined();
      });
    });

    describe('#getCookieDomainName', function() {

      it('should create correct cookie domain name when it parses hostname with one subdomain', function() {
        expect(utils.makeCookieDomainName('m.macys.com')).toEqual('.macys.com');
      });

      it('should create correct cookie domain name when it parses hostname with two subdoamins', function() {
        expect(utils.makeCookieDomainName('m2qa1.qa20codemacys.fds.com')).toEqual('.qa20codemacys.fds.com');
      });

      it('should create correct cookie domain name when it parses ip address', function() {
        expect(utils.makeCookieDomainName('11.22.33.444')).toEqual('11.22.33.444');
      });

      it('should create localhost cookie domain name when it parses localhost', function() {
        expect(utils.makeCookieDomainName('localhost')).toEqual('localhost');
      });
    });

    describe('#isInPrivateMode', function() {
      it('should return true if the sessionStorage is not accessible', function() {
        spyOn(window.sessionStorage, 'setItem').and.callFake(function() {
          throw 'exception';
        });
        expect(utils.isInPrivateMode()).toBe(true);
      });

      it('should return false if cookies are enabled and if the sessionStorage is active', function() {
        expect(utils.isInPrivateMode()).toBe(false);
      });
    });

    describe('#productImageOptimized', function() {
      it('should return the src with the wid equals the width argument', function() {
        expect(utils.productImageOptimized('http://images.bloomingdales.com/is/image/BLM/test5555.tif?wid=134&qlt=90', 200))
        .toEqual('http://images.bloomingdales.com/is/image/BLM/test5555.tif?wid=200&qlt=90');
      });

      it('should return the src and add the wid equals the width argument', function() {
        expect(utils.productImageOptimized('http://images.bloomingdales.com/is/image/BLM/test5555.tif?qlt=90', 200))
        .toEqual('http://images.bloomingdales.com/is/image/BLM/test5555.tif?wid=200&qlt=90');
      });

      it('should return the only the parameters of the url if the src is empty', function() {
        expect(utils.productImageOptimized('', 200))
        .toEqual('?wid=200');
      });
    });
  });
});
