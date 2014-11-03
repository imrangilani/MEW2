define([
    // Models
    'models/bopsUpcModel',
    // Views
    'views/_productBopsModalView'
], function(BopsUpcModel, ProductBopsModalView) {
    'use strict';

	var BCOMproductBopsModalView = ProductBopsModalView.extend({
    events: _.extend(ProductBopsModalView.prototype.events, {
      'keyup #mb-bops-address': 'clearErrors',
      'click .bops-store-select': 'setBopsStore',
      'click .bops-store-cancel': 'back'
    }),

    setBopsStore: function(e) {
      var model = this.model;
      var stores = $("input[name='radio-storeSelector']");
      _.forEach(stores, function(store) {
        if (store.checked){
          var locationNumber = $(store).closest('.bops-result').data('location');
          model.set('locationNumber', locationNumber);
          window.history.back();
          return false;
        }
      });
    },

    renderBopsResults: function() {
      ProductBopsModalView.prototype.renderBopsResults.apply(this, arguments);
      var radioButtons = $("input[name='radio-storeSelector']");
      _.forEach(radioButtons, function(radioButton) {
        $(radioButton).on('click', function(e) {
          var target = $(e.currentTarget);
          $("input[name='radio-storeSelector']").closest('.bops-result').removeClass('bops-selected-store');
          $(target).closest('.bops-result').addClass('bops-selected-store');
        });
      });
      // Scroll down to the store list section
      $('.mb-modal-content').animate({ scrollTop: $('#bops-product-info').offset().top - 40 }, 500);
    },

    clearErrors: function(){
      $('#bops-modal-errorContainer').html('').css('display', 'none');
    },

    processGeoLocationError: function( error ){
      if( error){
        this.displayErrorMessage( 'We are unable to determine your location. Please enable Location Service access in your phone\'s settings.');
      }
    },

    displayErrorMessage: function(message){
      $('#bops-modal-errorContainer').html(message).css('display', 'block');
    },

    clearErrorMessage: function(){
      $('#bops-modal-errorContainer').html('').css('display', 'none');
    }

	});

	return BCOMproductBopsModalView;

});
