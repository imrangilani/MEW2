/**
 * @file router.js
 *
 * @see _core/router
 */

define([
  'router/_core/router'
], function(BaseRouter) {
  'use strict';

  var AppRouter = BaseRouter.extend({
    isValidFragment: function(fragment) {
      return !is10Route.call(this, fragment);
    },

    isSupported: function() {
      return isSupported.call(this);
    }
  });

  /**
   * Determine if the URL needs to be handled by MEW 1.0
   *
   * @param fragment {String} Url fragment to test
   * @return true if the URL is a valid 1.0 route, else false
   */
  var is10Route = function(fragment) {
    return isValid10Route.call(this, fragment) || isValid10Product.call(this, fragment);
  };

  /**
   * Determine if the URL is a valid MEW 1.0 route
   *
   * @param fragment {String} Url fragment to test
   * @return true if the URL is a valid 1.0 route, else false
   */
  var isValid10Route = function(fragment) {
    var validRoute = false;
    _.each(App.config.mew10Routes, function(route) {
      var routeRegex = _.isRegExp(route) ? route : this._routeToRegExp(route);
      if (routeRegex.test(fragment)) {
        validRoute = true;
      }
    }, this);

    return validRoute;
  };

  /**
   * Determine if the URL is a valid MEW 1.0 product
   *
   * @param fragment {String} Url fragment to test
   * @return true if the URL is a valid 1.0 product, else false
   */
  var isValid10Product = function(fragment) {
    var validRoute = false;
    var route = 'shop/product/:productName';
    var routeRegex = _.isRegExp(route) ? route : this._routeToRegExp(route);
    if (routeRegex.test(fragment)) {
      _.each(App.config.mew10ProductPattern, function(text) {
        if (fragment.indexOf(text) !== -1) {
          validRoute = true;
        }
      }, this);
    }

    return validRoute;
  };

  /**
   * Certain keywords in the URL are not supported in the app. Check it here.
   *
   * @return true if the URL is supported, else false
   */
  var isSuported = function() {
    // Check to see if any blacklisted words appear in the URL
    var blacklisted = ['chanel'];
    var notSupported = false;

    notSupported = _.any(_.values(this.currentRoute.$url.segment()), function(arg) {
      return _.any(blacklisted, function(key) {
        return arg.toLowerCase().indexOf(key) !== -1;
      });
    });

    if (notSupported) {
      // Show "feature not supported" page .. pass the blacklisted keyword to the view
      this.viewController.route({ name: 'notSupported' }, { blacklisted: notSupported });
    }

    return !notSupported;
  };

  return AppRouter;
});
