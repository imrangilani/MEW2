/**
 * Created by Flavio Coutinho on 7/3/2014.
 */
define([
  // Views
  'views/_storesView',
  'analytics/analyticsTrigger'
], function(StoresView, analytics) {
  'use strict';

  var COREMETRICS_ELEMENT_ID_PREFIX = 'find_a_store',
      COREMETRICS_CATEGORY_ID = 'FIND_A_STORE',
      findDeepLink;

  return StoresView.extend({
    events: _.extend(_.clone(StoresView.prototype.events), {
      'focus #mb-j-location-input': 'searchFieldAnalytics'
    }),

    init: function() {
      StoresView.prototype.init.apply(this, arguments);
      findDeepLink = StoresView.prototype.findStoresDeepLink.apply(this, arguments);
      this.initSEO();
    },

    renderResultsTemplate: function() {
      this.prepareMyFavoriteStore();
      StoresView.prototype.renderResultsTemplate.apply(this, arguments);
    },

    prepareMyFavoriteStore: function() {
      var stores = this.model.get('stores'),
          favoriteStoreNumber = parseInt(localStorage.getItem('local_storeLocationNumber') || "0"),
          favoriteStoreIndex = -1;

      if (_.isEmpty(stores) || !favoriteStoreNumber) {
        return;
      }

      _.some(stores, function(store, index) {
        if (store.locationNumber === favoriteStoreNumber) {
          favoriteStoreIndex = index;
          return true;
        }
      });

      if (favoriteStoreIndex === -1) {
        return;
      }

      if (favoriteStoreIndex >= 0) {
        var favoriteStore = stores[favoriteStoreIndex];
        favoriteStore.myLocalStore = true;

        if (favoriteStoreIndex > 0) {
          stores[0].showOtherNearbyStoresTitle = true;

          stores.splice(favoriteStoreIndex, 1);
          stores.unshift(favoriteStore);
        }
      }
    },

    initSEO: function() {
      this.setPageTitle('Bloomingdale\'s Store Locator');
      this.setPageDesc('Locate & shop the nearest Bloomingdale\'s store. Find updated store hours, services, events and more.');
    },

    findStoresDeepLink: function() {
      if (!findDeepLink) {
        this.findMyLocalStore();
      }
    },

    // When user open the view and he/she has a favorite store set app must execute the search
    // to show the store details and remove the `localStoreNumber` to allow further searches
    findMyLocalStore: function() {
      var localStoreNumber = parseInt(localStorage.getItem('local_storeLocationNumber') || "0");
      if (!localStoreNumber) {
        return;
      }

      this.model.set('localStoreNumber', localStoreNumber);

      this.listenToOnce(this.model, 'modelready', _.bind(function() {
        this.model.unset('localStoreNumber');
      }, this));

      this.model.fetch();
    },

    pageViewAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: COREMETRICS_CATEGORY_ID,
        categoryId: COREMETRICS_CATEGORY_ID
      });
    },

    searchFieldAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX +'-enter_text',
        elementCategory: COREMETRICS_CATEGORY_ID
      });
    },

    findStoresNearMe: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX + '-near_me',
        elementCategory: COREMETRICS_CATEGORY_ID
      });

      StoresView.prototype.findStoresNearMe.apply(this, arguments);
    },

    selectStoreDetails: function(e) {
      var $storeEntry = this.$(e.currentTarget).closest('.mb-j-store-list-entry'),
          storeName = $storeEntry.data('name');

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX + '-select_store-' + storeName,
        elementCategory: COREMETRICS_CATEGORY_ID
      });

      StoresView.prototype.selectStoreDetails.apply(this, arguments);

      this.scrollToTop();
    },

    toggleListMapView: function() {
      StoresView.prototype.toggleListMapView.apply(this, arguments);

      var isMapSelected = this.$('#b-j-stores-map-view').hasClass('selectedLatchKey');
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX + '-toggle_' + (isMapSelected ? 'map' : 'list'),
        elementCategory: COREMETRICS_CATEGORY_ID
      });
    },

    processResultsError: function(result) {
      var message;

      if (result === 'ZERO_RESULTS') {
        // google api could not find a location that matched the user input
        message = 'The location you entered is invalid. Please try again.';
      } else {
        message = 'There are no stores within 250 miles of your location. Please try again.';
        // Center map on current lat/long
        this.autoCenterMap();
      }

      // Get rid of any previous stores set
      this.model.set('stores', []);

      this.displayErrorMessage(message);

      // Empty list view, and clear map markers
      this.$('#mb-j-stores-list-view').empty();
      this.clearMapMarkers();
    }
  });
});
