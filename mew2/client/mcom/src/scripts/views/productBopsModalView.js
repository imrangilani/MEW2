define([
  'jquery',
  // Views
  'views/_productBopsModalView',
  'util/crossBrowserHeight',
  'analytics/analyticsTrigger',
  'util/tooltip',
  'util/geoCode'
], function($, ProductBopsModalView, crossBrowserHeight, analytics, tooltip, GeoCode) {
  'use strict';

  var McomProductBopsModalView = ProductBopsModalView.extend({
    events: _.extend(ProductBopsModalView.prototype.events, {
      'change .m-select': 'updateSelectValue',
      'focus input': 'onfocus',
      'blur  input': 'onblur',
      'click bops-store-select': 'setBopsStore',
      'keyup #mb-bops-address': 'clearErrors'
    }),

    init: function() {
      ProductBopsModalView.prototype.init.apply(this, arguments);
      this.setSlideVerticalDirection();
    },

    renderTemplate: function() {
      ProductBopsModalView.prototype.renderTemplate.apply(this, arguments);

      // Trigger change event so custom selects display default selected values
      this.$el.find('.m-select').change();
    },

    //Need mcom method for coremetrics
    renderBopsResults: function() {
      ProductBopsModalView.prototype.renderBopsResults.apply(this, arguments);
      var product = this.model.get('product');
      this.doFiisAnalytics(product);
    },

    // processGeoLocationSuccess: function() {
    //   this.clearErrors();
    //   ProductBopsModalView.prototype.processGeoLocationSuccess.apply(this, arguments);
    // },

    processGeoLocationError: function(error) {
      if (error) {
        this.displayErrorMessage('Unable to determine location. Please verify Location Service access.');
      }
    },

    displayErrorMessage: function(message) {
      this.error = true;
      ProductBopsModalView.prototype.displayErrorMessage.apply(this, arguments);
    },

    clearErrors: function() {
      // clearErrors is called every keyup .. ensure jQuery manipulation is run only once
      if (this.error) {
        $('#bops-errorContainer').html('');
        this.error = false;
      }
    },

    // errorLabelToggle: function($selector, $delegate) {
    //   $selector.addClass('m-error-label');
    //   $delegate.on('touchstart click', function() {
    //     $selector.removeClass('m-error-label');
    //   });
    // },

    // displayError: function(zipCode, city, state) {
    //   var message = 'An error has occured',
    //       ttl = 0,
    //       $delegate = $('.mb-modal-wrapper');

    //   if (zipCode) {
    //     message = 'Please enter a valid zip';
    //     tooltip(this.$('.m-zip-section'), message, 'left', ttl, 1, $delegate);
    //     this.errorLabelToggle(this.$('.m-zip-section label'), $delegate);
    //   } else if (city && state === undefined) {
    //     message = 'Please select State';
    //     tooltip(this.$('.m-state-section'), message, 'left', ttl, 1, $delegate);
    //     this.errorLabelToggle(this.$('.m-state-section label'), $delegate);
    //   } else {
    //     message = 'Please enter ZIP Code or City and State';
    //     tooltip(this.$('.m-zip-section'), message, 0, ttl, 1, $delegate);
    //     this.errorLabelToggle(this.$('#bops-form label'), $delegate);
    //   }

    //   this.error = true;
    // },

    updateSelectValue: function(e) {
      var $select = $(e.currentTarget);
      var display = $select.find('option[value=' + $select.val() + ']').text();

      $select.closest('.m-select-wrapper').find('.display').text(display);
    },

    setBopsStore: function() {
      var selectedBeforeZip = this.model.get('defaultZipCode');

      ProductBopsModalView.prototype.setBopsStore.apply(this, arguments);
      this.doBopsAnalytics(selectedBeforeZip);
    },

    doBopsAnalytics: function(selectedBeforeZip) {
      analytics.triggerTag({
        tagType: 'conversionEventTagBops',
        eventId: selectedBeforeZip ? 'check_other_stores' : 'check_availability',
        actionType: '2',
        categoryId: 'bops_pdp',
        points: '0'
      });
    },

    doFiisAnalytics: function(product) {
      var points = 0, csa = 'U';

      if (product.isFIIS) {
        var stores = this.model.get('stores');
        if (stores && stores.pickup && stores.pickup.length > 0){
          points = 10;
          csa = 'S';
        }

        if (!_.isUndefined(points)) {
          analytics.triggerTag({
            tagType: 'conversionEventTagBops',
            eventId: 'Check Store Availability',
            actionType: '2',
            categoryId: 'Find It In Store',
            points: points,
            att2: csa
          });
        }
      }

    }
  });

  return McomProductBopsModalView;
});
