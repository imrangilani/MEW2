define([
  'jquery',
  // Views
  'views/modalView'
], function($, ModalView) {
  'use strict';

  var ProductWarrantyModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    events: {
      'click .b-j-warranty-close': 'back'
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.productWarrantyModal());
    }

  });

  return ProductWarrantyModalView;
});
