/**
 * @file router.js
 *
 * 1) Register route callbacks for each route path defined in all route handlers
 * 2) Keep track of the current route (currentRoute), which holds information about the current URL and data extracted from the URL
 * 3) Keep track of the current handler (currentHandler), which holds information and functionality pertaining to a route or series of routes
 *
 * The router uses the following App.config properties:
 *
 *    {
 *      // used for building native app URL. @see core Private.checkAppDeepLink().
 *      brand: {String}, // possible values: "mcom", "bcom"
 *
 *      // used for manipulating legacy /shop URLs. @see core Hooks.preValidate.checkLegacyCategoryURL()
 *      legacyUrls: {Array}, // e.g. ['womens', 'mens', 'beauty', 'juniors', 'kids', 'plus-sizes']
 *
 *      ENV_CONFIG: {
 *        // used to determine whether or not to launch the native app (if installed) for supported urls
 *        launch_native: {String}, // possible values: "on", "off"
 *      }
 *    }
 *
 * @see _core/public for a list of public router functions, for external use
 * @see _core/private for a list of private router functions, for use within the route only
 *         * Also contains definition for currentRoute
 * @see _core/handlers
 *         * Also contains definition for currentHandler
 */

define([
  'backbone',
  'router/_core/public',
  'router/_core/private',
  'router/_app/viewController'
], function(Backbone, PublicAppRouter, PrivateAppRouter, ViewController) {
  'use strict';

  var Router = Backbone.Router.extend({
    // @see _core/public
    currentRoute: null,

    // @see _core/_handlers
    currentHandler: null,

    /**
     * Run when the router is initialized. Should only be initialized one time, and attached to the globa scope.
     *
     * @see main.js
     */
    initialize: function() {
      if (!window.App) {
        window.App = { config: { } };
      }

      if (!window.App.router || !window.App.router.routes) {
        window.App.router = this;
      }

      // Global popstate event which views can listen to
      window.onpopstate = function(event) {
        Backbone.trigger('popstate', event);
      };

      // When a uers goes back, set the popstate as "true" so that route history is updated appropriately
      this.listenTo(Backbone, 'popstate', _.bind(PrivateAppRouter.setPopstate, this, true));

      // Backbone.history.start() calls getFragment(), which will fail if special characters exist in the URL.
      // Process them, and redirect if necessary
      PrivateAppRouter.replaceSpecialCharacters.call(this);

      this.viewController = new ViewController();
    },

    /**
     * Override Backbone.Router.navigate() with a custom method, to allow a URL to be built off of attributes.
     * Additionally, checks to ensure the route is supported by the app before attempting to execute a callback.
     *
     * @param {String} fragment the URL fragment to navigate to. If not supplied, tries to build a URL from options.attributes
     * @param {Object} options contains the following possible values:
     *                          {
     *                            // Flag to indicate whether to replace the current history information, or add a new item to history. Default: false
     *                            replace: {Boolean}
     *
     *                            // Flag to indicate whether to trigger the route handler's callback for the associated route. Default: false
     *                            trigger: {Boolean}
     *
     *                            // An object of key -> value pairs of attributes for building a URL dynamically.
     *                            // if `fragment` is null, the route handler's buildUrl() method is fired with these attributes, to generate `fragment`
     *                            attributes: {Object}
     *                          }
     */
    navigate: function(fragment, options) {
      options = options || {};

      if (fragment === null) {
        if (options.attributes) {
          fragment = this.buildUrl(options.attributes);
          delete options.attributes;
        }
      }

      if (!fragment) {
        throw new Error('navigate() requires either a url fragment, or an object of attributes to exists at options.attributes');
      }

      var isValidFragment = this.isValidFragment(fragment);

      /**
       * If navigate is called with trigger:true, router.execute() is fired, which will updateCurrent.
       * However, without trigger:true, we need to ensure updateCurrent is called.
       *
       * Calling twice will not have a negative impact, since "fragment" is the same between here and execute().
       *
       * @see PrivateAppRouter.updateCurrent()
       */
      if (isValidFragment) {
        isValidFragment = PrivateAppRouter.updateCurrent.call(this, fragment, options);
      }

      if (isValidFragment) {
        Backbone.Router.prototype.navigate.call(this, fragment, options);
        return this;
      }

      return false;
    },

    /**
     * Override Backbone.Router.execute() with a custom method, validating that the current route should be supported by the app.
     *
     * @param {Function} callback a reference to the route handler's callback to invoke
     *
     * @see PrivateAppRouter.checkAppDeepLink()
     * @see PrivateAppRouter.checkNotSupported()
     */
    execute: function(callback) {
      PrivateAppRouter.replaceSpecialCharacters.call(this);
      PrivateAppRouter.updateCurrent.call(this);

      if (App.config.ENV_CONFIG['launch_native'] === 'on') {
        // If the native app is installed, and this route is supported by the native app, launch native app
        PrivateAppRouter.checkAppDeepLink.call(this);
      }

      var isSupported = this.isSupported();

      // Only invoke the callback if we are on a supported page
      if (isSupported) {
        return Backbone.Router.prototype.execute.call(this, callback);
      }
    },

    back: function() {
      window.history.back();
    },

    /**
     * Check if a fragment is valid before calling Backbone's native navigate() function.
     * Can be overwritten by an app-specific router.
     *
     * @see this.navigate()
     */
    isValidFragment: function(fragment) {
      return true;
    },

    /**
     * Check if the URL is supported before calling Backbone's native execute() function.
     * Can be overwritten by an app-specific router.
     *
     * @see this.execute()
     */
    isSupported: function() {
      return true;
    }
  });

  /**
   * For each route handler, set up a Backbone route for the paths provided, with the route handler's callback
   *
   * @see router/handlers/handlers for route handler information
   */
  var routes = {};

  _.each(PrivateAppRouter.getHandlers(), function(handler) {
    _.each(handler.paths, function(path) {
      routes[path] = function() {
        handler.callback.apply(this, arguments);
      };
    });
  });

  // Include all Backbone routes that we just set up, as well as all public functions for external use
  _(Router.prototype).extend(PublicAppRouter).extend({ routes: routes });

  return Router;
});
