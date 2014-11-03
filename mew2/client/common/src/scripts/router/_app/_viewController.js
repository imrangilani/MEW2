/**
 * @file viewController.js
 *
 * The main role of the viewController is to accept a flat data object (from the router) and initialize the appropriate sub-view.
 * This “sub-view” that is initialized extends MainContentView, and each MainContentView represents a unique section of content
 * (or route) for the web app. Examples are `home`,     `product`,   and   `category`   routes, and their corresponding
 *                                        `homeView`, `productView`, and `categoryView` MainContentViews.
 * In addition, the viewController initializes views that are common across all sections, e.g. NavView, HeaderView, SearchView.
 *
 * @see _core/_viewController
 */

define([
  'router/_core/viewController',
  'util/util',

  // Views
  'views/headerView',
  'views/searchView',
  'views/navView',
  'views/homeView',
  'views/errorView',
  'views/notSupportedView'
], function(ViewController, utils, HeaderView, SearchView, NavView, HomeView, ErrorView, NotSupportedView) {
  /*jshint nonew:false*/
  'use strict';

  var AppSpecificViewController = function() {
    this.initialize();
  };

  _.extend(AppSpecificViewController.prototype, ViewController.prototype, {
    /**
     * Initialize appmodel, searchView and headerView AFTER Backbone history is started.
     * This will ensure that special characters have been replaced before doing any URL parsing,
     * since Backbone.history.start() will call Router.execute(), which replaces special characters.
     * This needs to be done because the searchView and appmodel use purl.
     *
     * @see main.js, which calls ViewController.initialize() directly
     */
    initialize: function() {
      // For the web app, initialize common views that are persistent across all routes.
      // Also, the native apps will use their own header/search, and they are only interested in MainContentView
      if (!utils.getCookie('ishop_app')) {
        new SearchView();
        new HeaderView();
      }
    },

    /**
     * Emtpy search container, initialize nav view, then call base route()
     *
     * @see ViewController.prototype.route()
     */
    route: function(handler, data) {
      // Empty out the search autocomplete list for every new URL
      $('#mb-j-autocomplete-container').html('');

      // The navigation needs to be initialized for each route, because the state needs updating.
      var menuId = 'top';

      if (handler.view && handler.view.getMenuId(data)) {
        menuId = handler.view.getMenuId(data);
      }

      // We don't need to initialize the GN in case there's a 404 category, otherwise
      // the GN will be repainted to its initial state 
      if (!_.isEqual(handler, 'error') && !_.isEqual(handler.name, 'notFound')) {
        NavView.initialize(menuId);
      }

      ViewController.prototype.route.call(this, handler, data);
    },

    /**
     * Initialize a content view for the appropriate handler with the corresponding data.
     *
     * @param {String} / {Object} handler The name of the handler, or handler object itself
     * @param {Object} data the normalized data extracted from URL query params and/or segments
     */
    getMainContentView: function(handler, data) {
      var loaded = true;
      if (_.isString(handler)) {
        handler = { name: handler };
        loaded = false;
      }

      // Close the current MainContentView, and establish a reference to the appropriate
      // MainContentView based on handler and data
      // Do not close the current view if both current and the requested view is home
      if (this.shouldCloseCurrentMainContentView(handler, data) &&
          !(this.currentMainContentView instanceof HomeView && handler.name === 'home')) {
        this.currentMainContentView.close();
      }

      switch (handler.name) {
      case 'notFound':
      case 'error':
        return new ErrorView({ options: data });
      case 'notSupported':
        return new NotSupportedView({ options: data });
      default:
        if (!loaded) {
          handler = App.router.getHandlerByName(handler);
        }

        if (handler.view) {
          return handler.view.getMainContentView.call(this, data);
        }
        else {
          throw new Error('Unknown route: ' + handler.name);
        }
      }
    },

    shouldCloseCurrentMainContentView: function(handler, data) {
      return this.currentMainContentView &&
             !(handler.name === 'shop' ||
            handler.name === 'category' &&
            (App.model.isParentOfTier2Remain(data.id) &&
            this.currentMainContentView.id === data.id ||
            App.model.isTier2Remain(data.id) &&
            this.currentMainContentView.id === App.model.get('categoryIndex').menus[data.id].parent));
    }
  });

  return AppSpecificViewController;
});
