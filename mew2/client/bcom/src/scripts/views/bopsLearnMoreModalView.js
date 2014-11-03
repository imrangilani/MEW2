define([
  'jquery',
  // Views
  'views/modalView'
], function ($, ModalView) {
  'use strict';

  var BopsLearnMoreModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    renderTemplate: function () {
      this.$el.html(TEMPLATE.bopsLearnMoreModal());
    }

  });

  return BopsLearnMoreModalView;
});
