define([
  'underscore'
], function(_) {
  'use strict';

  var jasmineHelpers = {

    prepareAppGlobals: function() {
      var App = {
        config: { ENV_CONFIG: {} },
        router: {},
        model: {}
      };

      window.App = App;

      return App;
    },

    addMatcher: function(matcher) {
      var obj = {};

      if (_.isFunction(matchers[matcher])) {
        obj[matcher] = matchers[matcher];
        console.log(obj);
        jasmine.addMatchers(obj);
      }
    },

    loadFixture: function(fixtureName, brand) {
      brand = (brand === 'mcom' || brand === 'bcom') ? (brand) : ('common');
      var fixturesPath = 'client/' + brand + '/test/jasmine/fixtures/';

      if (_.isFunction(jasmine.getFixtures)) {
        jasmine.getFixtures().fixturesPath = fixturesPath;
        loadFixtures(fixtureName);
      }
    }

  };

  var matchers = {
    toBeInstanceOf: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: (actual instanceof expected)
          };
        }
      }
    }
  };

  return jasmineHelpers;
});
