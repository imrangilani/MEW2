define([
  'jquery',
  // Views
  'views/modalView',
  'views/productOffersWarrantyModalView'
], function($, ModalView, ProductOffersWarrantyModalView) {
  'use strict';

  var ProductOffersModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: {
      'click  .b-product-warranty-link': 'showOffersWarrantyInfoModal',
      'click  .mb-j-modalHeader-left': 'back'
    },

    renderTemplate: function() {
      var offersOptions = this.options.promotions;
      this.$el.html(TEMPLATE.productOffersModal({ promotions: offersOptions }));
    },

    postRender: function() {
      // Create a subview for free shipping details modal.
      this.subViews.productOffersWarrantyModalView = new ProductOffersWarrantyModalView({ id: 'b-j-offers-warranty-modal-container' });
    },

    showOffersWarrantyInfoModal: function(e, triggeredByPopState) {
      var view = this.subViews.productOffersWarrantyModalView;

      // If the modal wrapper isn't in the DOM, append it to the body
      if (!view.elementInDOM()) {
        $('body').append(view.$el);
      }

      this.currentModalView = this.subViews.productOffersWarrantyModalView;

      if (!triggeredByPopState) {
        this.pushModalState('showOffersWarrantyInfoModal', e.currentTarget.id);
      }

      view.render();
      view.show();

      return false;
    }

  });

  return ProductOffersModalView;
});
