define([
  'jquery',
  // Views
  'views/modalView'
], function ($, ModalView) {
  'use strict';

  var OrderMethodOnOrderModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    renderTemplate: function () {
      this.$el.html(TEMPLATE.orderMethodOnOrderModal());
    }

  });

  return OrderMethodOnOrderModalView;
});
