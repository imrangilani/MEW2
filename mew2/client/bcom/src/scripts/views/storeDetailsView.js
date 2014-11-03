/**
 * Created by Flavio Coutinho on 7/3/2014.
 */
define([
  // Views
  'views/_storeDetailsView',

  // Util
  'util/localstorage',

  'analytics/analyticsTrigger'
], function(StoreDetailsView, localStorage, analytics) {
  'use strict';

  var COREMETRICS_ELEMENT_ID_PREFIX = 'store_details',
      COREMETRICS_CATEGORY_ID = 'STORE_DETAILS';

  return StoreDetailsView.extend({
    events: _.extend(_.clone(StoreDetailsView.prototype.events), {
      'click .mb-j-store-set-local': 'setMyLocalStore',
      'click .mb-j-store-unset-local': 'unsetMyLocalStore',
      'click .b-j-store-phone-link': 'phoneNumberAnalytics'
    }),

    init: function() {
      StoreDetailsView.prototype.init.apply(this, arguments);

      this.listenTo(this.model, 'modelready', function() {
        this.pageViewAnalytics();
        this.initSEO();
      }.bind(this));
    },

    initSEO: function() {
      var storeName = this.model.get('name'),
          address = this.model.get('address');

      this.setPageTitle('Bloomingdale\'s {{storeName}} - {{city}}, {{state}}'
        .replace('{{storeName}}', storeName)
        .replace('{{city}}', address.city)
        .replace('{{state}}', address.state));

      this.setPageDesc('Shop Bloomingdale\'s {{storeName}} in {{city}}, {{state}}. Find updated store hours, services, events and more.'
        .replace('{{storeName}}', storeName)
        .replace('{{city}}', address.city)
        .replace('{{state}}', address.state));

    },

    getViewData: function() {
      var viewData = StoreDetailsView.prototype.getViewData.apply(this, arguments);

      if (_.isEmpty(viewData.hours)) {
        delete viewData.hours;
      }

      return _.extend(_.clone(viewData), {
        isMyLocalStore: this.isMyLocalStore()
      });
    },

    isMyLocalStore: function() {
      return this.model.attributes.locationNumber === localStorage.get('local_storeLocationNumber');
    },
    
    setMyLocalStore: function(e) {
      localStorage.set('local_storeLocationNumber', this.model.attributes.locationNumber);
      this.$el.find('.b-store-details').addClass('mb-j-store-local');
    },

    unsetMyLocalStore: function(e) {
      localStorage.set('local_storeLocationNumber', 0);
      this.$el.find('.b-store-details').removeClass('mb-j-store-local');
    },

    showEventDetailsModal: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX +'-select_event_' + this.model.get('storeName'),
        elementCategory: COREMETRICS_CATEGORY_ID
      });

      StoreDetailsView.prototype.showEventDetailsModal.apply(this, arguments);
    },

    pageViewAnalytics: function() {
      var storeName = this.model.get('name');

      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: COREMETRICS_CATEGORY_ID + '-' + storeName,
        categoryId: COREMETRICS_CATEGORY_ID
      });
    },

    phoneNumberAnalytics: function() {
      var storeName = this.model.get('name');

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: COREMETRICS_ELEMENT_ID_PREFIX +'-call_store_' + storeName,
        elementCategory: COREMETRICS_CATEGORY_ID
      });
    }
  });

});
