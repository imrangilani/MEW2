define([
  'jquery',
  // Views
  'views/modalView',
  'views/productFreeShipDetailsModalView'
], function($, ModalView, ProductFreeShipDetailsModalView) {
  'use strict';

  var ProductShippingReturnsModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: _.extend(ModalView.prototype.events, {
      'click  #m-j-product-shipping-freeship': 'showFreeShipDetailsModal'
    }),

    renderTemplate: function() {
      this.$el.html(TEMPLATE.productShippingReturnsModal(this.options));
    },

    postRender: function() {
      // Create a subview for free shipping details modal.
      if(!this.subViews.productFreeShipDetailsModalView){
        this.subViews.productFreeShipDetailsModalView = new ProductFreeShipDetailsModalView({ id: 'm-j-free-ship-details-modal-container' });
      }

      ModalView.prototype.postRender.call(this);
    },

    showFreeShipDetailsModal: function(e, triggeredByPopState) {
      var view = this.subViews.productFreeShipDetailsModalView;

      if (!triggeredByPopState) {
        this.pushModalState('showFreeShipDetailsModal');
      }
      view.render();
      view.show();

      return false;
    }

  });

  return ProductShippingReturnsModalView;
});
