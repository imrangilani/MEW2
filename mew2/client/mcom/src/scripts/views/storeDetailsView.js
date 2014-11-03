define([
  'models/storeFavoritesModel',
  'views/storesView',
  'views/_storeDetailsView',
  'util/tooltip',
  'analytics/analyticsTrigger',
  'jquery.dotdotdot'
], function(StoreFavoritesModel, StoresView, StoreDetailsView, tooltip, analytics) {
  'use strict';

  return StoreDetailsView.extend({
    events: _.extend(_.clone(StoreDetailsView.prototype.events), {
      'click .m-j-store-save-fav': 'addToFavorites',
      'click .m-j-store-in-favorites-remove': 'removeFromFavorites',
      'click .m-j-store-phone-link': 'doStorePhoneAnalytics',
      'click .m-store-address a': 'doStoreDirectionsAnalytics',
      'click #mb-j-store-viewall-events a': 'doStoreAllEventsAnalytics'
    }),

    init: function() {
      // @see mainContentView
      this.scrollPastHeader = true;

      $('#mb-j-search-container').hide();

      this.storeFavoritesModel = new StoreFavoritesModel();
      StoreDetailsView.prototype.init.apply(this, arguments);

      // Listen for popstate event to remove any error messages on the page
      // @TODO should this be somehow integrated with tooltip.js?
      this.listenTo(Backbone, 'popstate', this.popstate);

      // Inject META tag that will prevent SEO bots from crawling this page
      $('head title').after('<meta name="robots" content="noindex">');
    },

    renderTemplate: function() {
      // Before rendering results, tag favorite stores
      this.storeFavoritesModel.parseFavorites([this.model.attributes]);

      StoreDetailsView.prototype.renderTemplate.apply(this, arguments);

      this.$('.m-store-events-content .mb-j-store-event-lineitem .m-store-event-name').dotdotdot();

      if (this.model.get('isInFavorites')){
        this.doFavoriteStoreAnalytics();
      }

      this.doPageViewAnalytics();
    },

    addToFavorites: function(e) {
      var $clicked = $(e.currentTarget);

      // the tooltip will appear above the clicked button (on error)
      var $tooltipElement = $clicked;

      var result = this.storeFavoritesModel.addFavorite($clicked.data('location'));

      var message;
      if (result === true) {
        // Add a class to show the "in my favorites" text & remove button, and hide the "add to favorites" button
        this.$('#m-store-details-content').addClass('m-favorite-store');

        // Scroll the user to the top of the page
        this.scrollToTop();
        this.doStoreMakeFavoriteAnalytics();

      } else if (result === this.storeFavoritesModel.FAVORITE_EXCEEDS_MAX) {
        message = 'You\'ve reached the max number of favorite stores. Please remove one to add another.';
      } else if (result === this.storeFavoritesModel.FAVORITE_EXISTS) {
        message = 'You\'ve already added this store to your favorites';
      } else {
        message = 'unable to add to favorites';
      }

      if (message) {
        this.$tooltip = tooltip($tooltipElement, message, 0, 0, 10);
      }

      return false;
    },

    popstate: function() {
      if (this.$tooltip) {
        this.$tooltip.remove();
        delete this.$tooltip;
      }
      StoreDetailsView.prototype.popstate.apply(this, arguments);
    },

    removeFromFavorites: function(e) {
      var $clicked = $(e.currentTarget);

      this.storeFavoritesModel.removeFavorite($clicked.data('location'));

      // Remove the class to hide the "in my favorites" text & remove button, and show "add to favorites" button
      this.$('#m-store-details-content').removeClass('m-favorite-store');
    },

    close: function() {
      $('#mb-j-search-container').show();
      $('head meta[name="robots"]').remove();
      StoresView.prototype.close.apply(this, arguments);
    },

    doPageViewAnalytics: function(){
      analytics.triggerTag( {
        tagType: 'pageViewTag',
        pageId: 'STORES_DETAILS',
        categoryId: 'STORES_DETAILS'
      });
    },

    doFavoriteStoreAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'open_store: ' + this.model.get('storeId'),
        elementCategory: 'STORES'
      });
    },

    doStorePhoneAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'PHONE NUMBER',
        elementCategory: 'STORES_DETAILS'
      });
    },

    doStoreDirectionsAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'STORE ADDRESS',
        elementCategory: 'STORES_DETAILS'
      });
    },

    doStoreAllEventsAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'view_all_events',
        elementCategory: 'STORES_DETAILS'
      });
    },

    doStoreMakeFavoriteAnalytics: function(){
      analytics.triggerTag({
        tagType: 'pageElementConditionalAttrsTag',
        elementId: 'make_favorite_store',
        elementCategory: 'STORES_DETAILS',
        att25: this.model.get('storeId')
      });
    }
  });
});
