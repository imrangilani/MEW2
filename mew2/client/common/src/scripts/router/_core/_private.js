/**
 * @file _private.js
 *
 * Mainly, provides an interface to the current route, and history of visited routes.
 *
 * However, includes all private functions and variables that the router interfaces with.
 * Not attached directly to the router; only made available to the scope of router.js.
 * This prevents unneeded functionality from being attached to the global scope.
 *
 * @see `routeDefaults` below, for a definition of an individual route, i.e. the externally acessible router.currentRoute
 */

define([
  'router/_app/_handlers',
  'util/util',
  'url-parser'
], function(handlers, util) {
  'use strict';

  // A flag to indicate a popstate event was triggered
  var isPopstate = false;

  // Maintains an array of every route visited during the session
  var routeHistory = [];

  // Maintain a reference to the current fragment, so updateCurrent doesn't execute when there is no change
  var currentFragment;

  /**
   * Holds the definition for an individual route, i.e. the externally accessible router.currentRoute
   */
  var routeDefaults = {
    // The router path string for the route, e.g. 'shop/:categoryString(/:facetKeys)(/:facetValues)'
    path: null,

    // The regular expression for fragment matching against this route
    regexp: null,

    /**
     * A reference to a jQuery purl() object for the route, for easy extraction of route data.
     *
     * @see https://github.com/allmarkedup/purl
     */
    $url: null,

    /**
     * Normalized data object of Backbone route parameters and URL query parameters, for easy access whenver they are needed.
     *
     * @see getParams()
     */
    params: null
  };

  var Private = {

    /**
     * Allows the router to update the private `isPopstate` variable
     * @param popstate Boolean indicating if it's a popstate
     */
    setPopstate: function(popstate) {
      isPopstate = popstate;
    },

    /**
     * Return the sorted array of all route handlers
     *
     * @see _core/_handlers
     */
    getHandlers: function() {
      return handlers;
    },

    /**
     * Return an individual handler, based on name.
     *
     * @param name {String} the name of the handler to return
     *
     * @return the handler object, or undefined
     */
    getHandlerByName: function(name) {
      return _.find(handlers, { name: name });
    },

    /**
     * Return information about a route, or set of routes, other than the current route.
     * For information about the current route, @see router.currentRoute
     *
     * @param index {Integer} if supplied, returns a route at a specific index
     *        If index < 0, pulls from the end of the history queue.
     *        *NOTE: index starts at 1, not 0. e.g.:
     *                getRouteHistory(-1) // returns information about the previous route
     *                getRouteHistory(1) // returns information about the first route visited
     *                getRouteHistory(0) // returns false
     *
     * @return:
     *    - if index is not supplied, returns an array of the entire history of routes since initial visit
     *    - if index is supplied, and route exists for supplied index, returns info about the route
     *    - if index is supplied, and route does not exist for supplied index, returns false
     */
    getRouteHistory: function(index) {
      // Prevent external callers from manipulating history directly
      var history = _.clone(routeHistory);

      if (index) {
        index = parseInt(index);

        if (index < 0) {
          return history[history.length + index - 1];
        }
        else if (index > 0) {
          return history[index - 1];
        }

        return false;
      }

      return history;
    },

    /**
     * Update the references to the currentRoute and currentHandler. Should be called whenever the user navigates
     *
     * @param options {Object} Router.navigate() options, excluding options.attributes. @see router.js
     *
     * @see `routeDefaults` in this file, to see the definition of `currentRoute`.
     * @see `handlerDefaults` in router/handlers/handlers, to see the definition of `currentHandler`
     */
    updateCurrent: function(fragment, options) {
      var router = this;

      if (normalizeURL.call(this)) {
        options = options || {};
        fragment = Backbone.history.getFragment(fragment);

        if (fragment !== currentFragment) {
          return _.any(handlers, function(handler) {
            return _.any(handler.regexp, function(regexp, index) {
              if (regexp.test(fragment)) {
                currentFragment = fragment;

                // Clone so internal handler cannot be altered directly
                router.currentHandler = _.clone(handler);

                if (options.replace || isPopstate) {
                  var removedRoute = routeHistory.pop();
                  router.trigger('routeHistory:remove', removedRoute, isPopstate);
                }

                if (isPopstate) {
                  isPopstate = false;
                }
                else {
                  var route = {
                    path: handler.paths[index],
                    regexp: handler.regexp[index]
                  };

                  // Attach a reference to a jQuery purl() object for the route
                  route.$url = $.url(window.location.origin + '/' + encodeURI(fragment));

                  // Get the Backbone route params and URL paramaters for easy reuse throughout the app
                  route.params = getParams(route, fragment);

                  var addedRoute = _.defaults(route, routeDefaults);
                  routeHistory.push(addedRoute);

                  router.trigger('routeHistory:add', addedRoute);
                }

                // Clone so internal route cannot be altered directly
                router.currentRoute = _.clone(_.last(routeHistory));
                return true;
              }
            });
          });
        }

        return true;
      }
    },

    /**
     * Sometimes, the client will receive a URL that should launch the native app.
     *
     * To determine if native app should launch, do the following:
     *       1) check for the "appdeeplink" parameter - if doesn't exist, fall through
     *       2) if param exists, check user agent - if not iOS or Android, fall through
     *       3) if param & user agent, generate app url and redirect user
     */
    checkAppDeepLink: function() {
      var router = this;
      var $url = _.clone(this.currentRoute.$url);

      // First, check if the "appdeeplink" parameter exists
      if ($url.param('appdeeplink')) {
        var updateUrl = $.Deferred();

        // Remove the "appdeeplink" param from the url
        var params = $url.param();
        delete params.appdeeplink;

        var url = $url.attr('base') + $url.attr('path');
        if (!_.isEmpty(params)) {
          url += '?' + $.param(params);
        }
        $url = $.url(url);

        // Check if user is on an android or iOS device
        var isAndroid = util.isAndroid();
        var isiOS = util.isiOS();

        if (isAndroid || isiOS) {
          // create the app url
          var appUrl;

          var companyName = (App.config.brand === 'mcom') ? ('macys') : ((App.config.brand === 'bcom') ? ('bloomingdales') : '');

          if (!_.isEmpty(companyName)) {
            if (isiOS) {
              appUrl = $url.attr('source').replace($url.attr('base'), 'com.' + companyName + '.mobile:/');
            }
            else if (isAndroid) {
              appUrl = $url.attr('source').replace($url.attr('base'), companyName + '://com.' + companyName + '.mobile');
            }

            /**
             * iFrame needed for Android; can't set window.location on this device,
             * because the browser will redirect to the custom uri, even if invalid.
             * Not the case for iFrames.
             */
            $('<iframe id="appdeeplink" />').attr('style', 'display:none;').appendTo('body');

            // Try to go to the appUrl specified - will fail immediately if app is not installed
            setTimeout(function(){
              updateUrl.resolve();
            }, 25);

            document.getElementById('appdeeplink').src = appUrl;
          }
          else {
            updateUrl.resolve();
          }
        }
        else {
          /**
           * resolve() will remove the "appdeeplink" param from the URL.
           * @see updateUrl.done()
           */
          updateUrl.resolve();
        }

        /**
         * Set up done() callback for updateUrl jQuery.Deferred object.
         * If native url fails, or if not an Android/iOS device,
         * update browser url, now that "appdeeplink" param has been removed
         *
         * NOTE: on iOS, an error dialog (alert) appears when attempting to invoke the custom uri.
         *       It cannot be prevented, so we must refresh the page to get rid of the dialog.
         *       on Android, there is no such dialog, so we can simply update the url and invoke
         *       the callback, without the need of a page refresh.
         */
        updateUrl.done(function() {
          // Android does not require a page refresh (same with non-mobile), while iOS does
          if (isiOS) {
            // custom alerts will persist through until the user hits "ok", but the error alert will get removed by setting window.location
            //alert('You don\'t have the Macy\'s app installed. Redirecting you to the same page on our website.');

            // Wait before updating the page href, to prevent multiple dialogs from appearing.
            setTimeout(function(){
              window.location.href = $url.attr('source');
            }, 500);
          } else {
            // For android and other non-ios devices, simply update url w.o. "appdeeplink" param, and allow brombone to process the page
            router.navigate($url.attr('relative'), { replace: true });
          }
        });
      }
    },

    /**
     * Certain special characters need to be replaced with their encoded entities, very
     * early on (before the app does any url parsing or executes route handler callbacks).
     * For example, jquery purl() fails on "@", and purl() is used for url parsing.
     * Additionally, all special characters not "reserved" should be encoded as well.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-2
     */
    replaceSpecialCharacters: function() {
      var specialCharacters = {
        '@': '%40' // jQuery's purl() breaks on "@" - @see https://github.com/allmarkedup/purl/issues/44
      };

      var currentPath = window.location.href.replace(window.location.origin + '/', '');
      var newPath = currentPath;

      var encoded = false;
      try {
        encoded = (decodeURIComponent(currentPath) === currentPath) ? (false) : (true);
      } catch (e) {
        encoded = false;
      }

      if (!encoded) {
        newPath = encodeURI(newPath);
      }

      // replace special characters
      newPath = newPath.replace(_.keys(specialCharacters), _.values(specialCharacters));

      if (currentPath != newPath) {
        if (Backbone.History.started) {
          this.navigate(newPath, { trigger: false, replace: true });
        }
        else {
          window.location = window.location.origin + '/' + newPath;
        }
      }
    }
  };

  /**
   * Normalize the URL before parsing occurs.
   *
   * For example, jquery purl() fails on "@", and purl() is used for url parsing.
   * So "@" must be replaced with its html entity.
   *
   * @return true if no changes were needed to normalize, else false
   */
  var normalizeURL = function() {
    var specialCharacters = {
      '@': '%40' // jQuery's purl() breaks on "@" - @see https://github.com/allmarkedup/purl/issues/44
    };

    var rawPath = window.location.href
               .replace(window.location.origin + '/', ''); // Turn full url into relative path for navigate()

    var normalizedPath = rawPath.replace(_.keys(specialCharacters), _.values(specialCharacters)); // replace special characters

    if (rawPath !== normalizedPath) {
      this.navigate(normalizedPath, { trigger: false, replace: true });
      return false;
    }

    return true;
  };

  /**
   * Returns an object of normalized backbone route parameters and url query parameters.
   * If there is a backbone route parameter and URL query parameter of the same name,
   * the backbone route parameter's value will be used.
   *
   * @param route {Object}    the current route object. Not accessible through router.currentRoute,
   *                          since currentRoute has not been set yet (called by updateCurrent())
   * @param fragment {String} the current URL fragment for extracting backbone route parameters
   * @return params {Oject} a key->value set of all parsed parameters (router and query), keyed by the path variable
   */
  var getParams = function(route, fragment) {
    return _.extend(getQueryParams(route), getRouteParams(route, fragment));
  };

  /**
   * Return an object of normalized URL query params.
   *
   * @param route {Object} the current route object. Not accessible through router.currentRoute,
   *                       since currentRoute has not been set yet (called by updateCurrent())
   * @return {Object} Normalized object after lowercasing all the keys
   */
  var getQueryParams = function(route) {
    var params = _.clone(route.$url.param());

    _.each(params, function(value, key) {
      if (key !== key.toLowerCase()) {
        params[key.toLowerCase()] = value;
        delete params[key];
      }
    });

    return params;
  };

  /**
   * Normalized data object of backbone route parameters defined in the route path.
   *
   * Keyed by the variable name specified in the path.
   *    e.g.: the route path:
   *
   *            'shop/:categoryString(/:facetKeys)(/:facetValues)'
   *
   *          with the following URL:
   *
   *            'shop/womens-clothing/Pageindex,Productsperpage/2,24?id=118'
   *
   *          yields:
   *
   *          {
   *            categoryString: 'womens-clothing',
   *            facetKeys: 'pageindex,productsperpage'.
   *            facetValues: '2,24'
   *          }
   *
   * @param route {Object}    the current route object. Not accessible through router.currentRoute,
   *                          since currentRoute has not been set yet (called by updateCurrent())
   * @param fragment {String} the current URL fragment for extracting backbone route parameters
   * @return params {Oject} a key->value set of all parsed route parameters, keyed by the path variable
   */
  var getRouteParams = function(route, fragment) {
    var params = {};
    var args = Backbone.Router.prototype._extractParameters(route.regexp, fragment);

    if (!_.isEmpty(args)) {
      // Get the names of the keys
      var keys = _.map(route.path.match(/(:|\*)\w+/g), function(key) {
        return key.replace(/(:|\*)/, '');
      });

      params = _.object(keys, _.clone(args));

      _.each(params, function(value, key) {
        if (_.isEmpty(value)) {
          delete params[key];
        }
      });
    }

    return params;
  };

  return Private;
});
