define([
  'jquery',
  // Views
  'views/modalView'
], function ($, ModalView) {
  'use strict';

  var ProductFreeShipDetailsModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-2',

    events: _.extend(ModalView.prototype.events, {
      'click  .m-j-shipping-modal-header': 'back'
    }),

    renderTemplate: function () {
      this.$el.html(TEMPLATE.productFreeShipDetailsModal());
    }
  });

  return ProductFreeShipDetailsModalView;
});
