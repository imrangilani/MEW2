define([
  'util/util',
  'collections/baseCollection',
  'models/productModel'
], function(util, BaseCollection, ProductModel) {
  'use strict';
  // Length, in minutes, to keep a model's data before re-fetching
  var cacheTimeout = 60,
      // Length, in days, to keep the collections in the cookie (no expiration value: false)
      cookieLifetime = false;

  var RecentProductsCollection = BaseCollection.extend({
    model: ProductModel,
    cookieName: undefined,
    cookieExpires: cookieLifetime,

    initialize: function() {
      this.bindEvents();
      this.readCookie();
    },

    bindEvents: function() {
      this.on({
        add: this._addProductModel,
        sync: this.triggerDataRefresh,
        remove: function() { this.writeCookie(); }
      });
    },

    triggerDataRefresh: function() {
      this.trigger('dataRefresh');
    },

    /**
     * This custom implementation of fetch() will only send a request for "stale" products.
     * This includes products with limited information (e.g. only know product id from a cookie),
     * as well as products that haven't been fetched from the server in at least `cacheTimeout` minutes.
     *
     * For all "stale" / "expired" products, as defined above, their product id's are stored in an array
     * this.expired, for use by the url() function.
     *
     * Note that BaseCollection's fetch() is called with { remove : false }
     * to prevent deletion of existing models in the collection on sync
     */
    fetch: function(options) {
      // Determine the point in time "expiry" that represents "expired" data
      var timestamp = util.getCurrentTimestamp();

      // cacheTimeout converted to seconds
      var expiry = timestamp - (cacheTimeout * 60);

      // Filter out products that have recent data from the server
      var products = _.filter(this.models, function(model) {
        var lastUpdated = model.get('lastUpdated') || 0;
        return lastUpdated <= expiry;
      });

      // Only fetch data if there are expired / stale products
      if (products.length) {
        this.expired = _.pluck(products, 'id');
        BaseCollection.prototype.fetch.call(this, _.extend(options || {}, { remove: false }));
      } else {
        // No fetch will happen, trigger dataRefresh manually
        this.expired = null;
        this.trigger('dataRefresh');
      }
    },

    /**
     * This custom implementation of url() builds it's URL from the productModel's urlRoot.
     * In addition, it requests product data for all products in the collection that have stale data.
     *
     * @see this.fetch()
     */
    url: function() {
      var urlRoot = this.model.prototype.urlRoot;
      return urlRoot + '/' + this.expired.join(',') + '?viewType=recentlyViewed';
    },

    /**
     * This custom implementation of parse() sets the 'lastUpdated' attribute on each productModel
     * whose details were just retrieved from the server.
     */
    parse: function(resp) {
      _.each(resp, function(product) {
        product.lastUpdated = util.getCurrentTimestamp();
      });

      return resp;
    },

    /**
     * Called whenever the collection's 'add' event is triggered.
     * For internal use; should not be called from outside this collection file.
     */
    _addProductModel: function(productModel) {
      // Check to see if all of the required data was passed in to add()
      var requiredKeys = ['id', 'name', 'productUrl', 'images', 'prices', 'activeImageset'];

      var dataInitialized = _.every(requiredKeys, function(key) {
        return !_.isUndefined(productModel.attributes[key]);
      });

      // If all required data was passed in, set 'lastUpdated' to the current time
      if (dataInitialized) {
        productModel.set('lastUpdated', util.getCurrentTimestamp());
      }

      // Don't maintain more products than the maximum specified by the brand's configuration
      var max = App.config.pdp.recentlyViewedCount;

      // +1 because the current product is in models, but cant be shown.
      this.trimCollection(max + 1);

      // Update the cookie
      this.writeCookie();
    },

    prepend: function(productModel) {
      var existing = this.findWhere({ id: productModel.id });
       // If model is not in the collection, add it the beginning
       // If model is already in the collection, move it to the beginnig
      if (existing) {
        this._moveUp(existing);
      } else {
        this.add(productModel, { at: 0 });
      }
    },

    _moveUp: function(productModel) {
      var index = _.indexOf(this.models, productModel);
      if (index > 0) {
        // silence this to stop excess event triggers
        this.remove(productModel, { silent: true });
        this.add(productModel, { at: 0 });
      }
    },

    /**
     * Read in products from the shared cookie (if exists), and add them to the collection.
     */
    readCookie: function() {
      if (!this.cookieName) {
        return this;
      }

      var cookie = $.cookie(this.cookieName);
      if (cookie) {
        var productIds = this._getIdsFromCookie(cookie);

        productIds.forEach(function(productId) {
          this.add({ id: +productId });
        }.bind(this));
      }
      return this;
    },

    // Brand specific
    writeCookie: function() {},

    hasId: function(productId) {
      return this.findWhere({ id: productId });
    },

    trimCollection: function(max) {
      this.models = this.models.slice(0, max);
    }
  });
  return RecentProductsCollection;
});
