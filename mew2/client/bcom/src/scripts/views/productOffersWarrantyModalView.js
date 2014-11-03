define([
  'jquery',
  // Views
  'views/modalView'
], function ($, ModalView) {
  'use strict';

  var ProductOffersWarrantyModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-2',

    events: {
      'click .b-j-offers-warranty-close' : 'hide'
    },

    renderTemplate: function () {
      this.$el.html(TEMPLATE.productOffersWarrantyModal());
    }

  });

  return ProductOffersWarrantyModalView;
});
