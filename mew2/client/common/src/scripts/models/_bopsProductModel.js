/**
 * @file _bopsProductModel.js
 */

define([
  'models/bopsModel',
  'util/multiValueCookie'
], function(BopsModel, mvCookie) {

  'use strict';

  return BopsModel.extend({

    isStoredInLocalStorage: true,

    // 5 minutes
    dataLifeSpan: (1000 * 60) * 5,

    getKey: function() {
      return $.url().attr('host') + '_bops_' + this.get('id') + '_' + this.get('locationNumber');
    },

    // an array of order methods for which bops messaging is ignored
    // BCOM uses a different array
    ignoredMethods: ['EMAIL', 'DROP', 'FACS', 'CALLF', 'CALLM', 'CALLFS'],

    defaults: function() {
      return _.extend(BopsModel.prototype.defaults(), {
        // Required to be set before doing a fetch
        locationNumber: null,

        // comes from the product attributes
        // stored directly on the model so that a change event is triggered and attachable
        // @see productView's setActiveUpc()
        activeUpc: {},

        // the full upc data (from the product model) for the active upc
        activeUpcData: null,

        // the availability data from the bops response for the active upc
        activeAvailability: {},

        // whether the active upc has its bops messaging suppressed (from stella attributes)
        // @see this.suppressBopsMessaging()
        suppressBopsMessaging: false
      });
    },

    url: function() {
      var url = this.urlRoot + '/product/' + this.get('id');

      if (this.get('locationNumber')) {
        url += '?locationNumber=' + this.get('locationNumber');
      }

      return url;
    },

    initialize: function() {
      // Set locationNumber from cookie, if exists
      var locationNumber = this.getLocationNumberCookie();

      if (locationNumber) {
        this.set('locationNumber', locationNumber);
      }
      // prepares the availability information to be used by the template for the active upc
      var upc = this.get('activeUpc');
      if (upc && !upc.error) {
        this.updateAvailability();
      }

      // whenever a new upc is selected or when the bops info arrives, we need to prepare the
      // data for the template again
      this.on('change:activeUpc modelready', this.updateAvailability);
    },

    getLocationNumberCookie: function() {
      var locationCookie = mvCookie.get('BOPSPICKUPSTORE', 'MISCGCs');
      if (locationCookie) {
        return parseInt(locationCookie, 10);
      }
      return null;
    },

    setLocationNumberCookie: function() {
      var locationNumber = this.get('locationNumber');
      mvCookie.set('BOPSPICKUPSTORE', locationNumber, 'MISCGCs', 30);
    },

    /**
     * Under certain scenarios, BOPS messaging is ignored for a UPC:
     *   1) Big ticket items (!product.isCheckoutEnabled)
     *   2) UPC not part of store catalog (!upc.instore)
     *   3) Order method is one of a certain set that should be ignored
     */
    suppressBopsMessaging: function(upc) {
      var product = this.get('product');

      if (!product.isCheckoutEnabled) {
        // Big ticket item - no bops
        return true;
      }

      if (product.badges.OnlineExclusive) {
        // Product is an online exclusive - no bops
        return true;
      }

      if (!upc.instore) {
        // UPC not part of store catalog - no bops
        return true;
      }

      if (_.indexOf(this.ignoredMethods, upc.method) !== -1) {
        // Order method is one of a certain set that should be ignored
        return true;
      }
      return false;
    },

    updateAvailability: function() {
      var activeUpc = this.get('activeUpc');
      if (activeUpc.error || _.isUndefined(this.get('product')) || _.isUndefined(this.get('product').upcs)) {
        this.unset('activeUpcData');
        return;
      }
      var activeUpcKey = activeUpc.upcKey,
          activeUpcData = this.get('product').upcs[activeUpcKey];

      if (_.isUndefined(activeUpcData)) {
        // MCOM -specific scenario, as BCOM does not have the concept of product "types":
        // if the product has a type (besides color and size), the upcKeys are appended with "-1", "-2" on the product view
        // and when we check for product.upcs[xxxxx-1], it might not exist. In that case, we strip that part and try again
        activeUpcKey = (activeUpcKey).toString().replace(/\-.+/, '');
        activeUpcData = this.get('product').upcs[activeUpcKey];
      }

      this.set('activeUpcData', activeUpcData);
      if (activeUpcData) {
        this.set('activeAvailability', this.get('bops') ? this.get('bops').availability[activeUpcData.id] : {});
        this.set('suppressBopsMessaging', this.suppressBopsMessaging(activeUpcData));
      }
    }

  });
});
