define([
  'jquery',
  // Views
  'views/modalView'
], function ($, ModalView) {
  'use strict';

  var OrderMethodSpecialOrderModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    renderTemplate: function () {
      this.$el.html(TEMPLATE.orderMethodSpecialOrderModal());
    }

  });

  return OrderMethodSpecialOrderModalView;
});
