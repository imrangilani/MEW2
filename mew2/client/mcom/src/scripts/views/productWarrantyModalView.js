define([
  'jquery',
  'handlebars',
  'util/orientation',
  'util/fewerMore',
  // Views
  'views/modalView'
], function ($, Handlebars, orientation, fewerMore, ModalView) {
  'use strict';

  var ProductWarrantyModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',


    init: function () {

      this.listenTo(orientation, 'orientationchange', function() {

        fewerMore.handleOrientationChange();

      });
    },

    events: {
      'click  .mb-j-modalHeader-left': 'back'
    },

    renderTemplate: function () {
      this.$el.html(TEMPLATE.productWarrantyModal());

      fewerMore.init();

    },

    back: function() {
      window.history.back();
    }

  });

  return ProductWarrantyModalView;
});
