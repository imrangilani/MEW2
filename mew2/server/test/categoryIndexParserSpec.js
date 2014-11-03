/*jshint expr: true*/
'use strict';

var parser  = require('../lib/parsers/v3/categoryIndex'),
    fs      = require('fs');

function fixt(dat) {
  return JSON.parse(fs.readFileSync('server/test/fixtures/' + dat).toString());
}
var payload = fixt('payload.json');

describe('Parser: Category Index', function() {
  var categoryObject = {};

  describe('#normalizeUrls', function() {
    it('should remove everything before .com from `brandURL`', function() {
      var relativeBuyURL = parser.normalizeUrls('http://www1.macys.com/buy/7-for-all-mankind');
      relativeBuyURL.should.eql('/buy/7-for-all-mankind');
    });

    it('should remove host and &edge=hybrid from `brandURL`', function() {
      var relativeShopURL = parser.normalizeUrls('http://www1.macys.com/shop/womens-clothing/alfani-womens-clothing?id=17994&edge=hybrid');
      relativeShopURL.should.eql('/shop/womens-clothing/alfani-womens-clothing?id=17994');
    });
  });

  describe('#pass', function() {
    it('should work', function() {
      parser.pass(payload, [parser.rename]);
      // require('fs').writeFileSync('server/test/fixtures/category2.json', JSON.stringify(payload, null, 2));
      var expected = fixt('category2.json');
      payload.should.eql(expected);
    });
  });

  payload.category.forEach(function(cat) {
    categoryObject[cat.id] = cat;
  });

  describe('#inherit', function() {
    it('should work', function() {
      categoryObject = parser.inherit(categoryObject, 'id', 'p', 'shop');
      // require('fs').writeFileSync('server/test/fixtures/category3.json', JSON.stringify(categoryObject, null, 2));
      var expected = fixt('category3.json');
      categoryObject.should.eql(expected);
    });
  });

  describe('#surface', function() {
    it('should work', function() {
      categoryObject = parser.surface(categoryObject, 'category', 'c', 'id');
      // require('fs').writeFileSync('server/test/fixtures/category4.json', JSON.stringify(categoryObject, null, 2));
      var expected = fixt('category4.json');
      categoryObject.should.eql(expected);
    });
  });

  describe('#pancake', function() {
    it('should work', function() {
      categoryObject = parser.pancake(categoryObject, 'category', 'id', {});
      // require('fs').writeFileSync('server/test/fixtures/category5.json', JSON.stringify(categoryObject, null, 2));
      var expected = fixt('category5.json');
      categoryObject.should.eql(expected);
    });
  });

  describe('#perform', function() {
    it('should work', function() {
      var perf = {
        brandflyout: 'b',
        brandIndexURL: 'i',
        passthru: 'e',
        name: 'n',
        categorytype: 't',
        categorypageurl: 'u',
        p: 'p',
        c: 'c',
        overridecatid: 'g',
        overrideUrl: 'o',
        remain: 'r',
        fobCatId: 'f'
      };
      categoryObject = parser.perform(categoryObject, perf, {});
      // require('fs').writeFileSync('server/test/fixtures/category7.json', JSON.stringify(categoryObject, null, 2));
      var expected = fixt('category7.json');
      categoryObject.should.eql(expected);
    });
  });

  describe('#relativize', function() {
    it('should work', function() {
      var config = {
        desktop: 'macys.com'
      };
      categoryObject = parser.relativize(categoryObject, config.desktop, {});
      // require('fs').writeFileSync('server/test/fixtures/category8.json', JSON.stringify(categoryObject, null, 2));

      var expected = fixt('category8.json');
      categoryObject.should.eql(expected);
    });
  });

  describe('integration', function() {
    describe('#parse', function() {
      it('should work', function() {
        var result = parser._parse({query: {depth: null}}, payload, {}, true);
        // require('fs').writeFileSync('server/test/fixtures/categoryExpected.json', JSON.stringify(result, null, 2));
        var expected = fixt('categoryExpected.json');
        result.should.eql(expected);
      });
    });
  });
});
