define([
  'jquery',
  'util/orientation',
  // Views
  'views/modalView'
], function($, orientation, ModalView) {
  'use strict';

  var ProductRebatesModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    init: function() {
      this.listenTo(orientation, 'orientationchange', function() {
        var sideClass, middleClass, modal;
        modal = $('#m-j-rebates-modal-container');

        if (modal.hasClass('modal-visible')) {

          if (orientation.getOrientation() === 'landscape') {
            sideClass = $('.rebate-address .small-1');
            sideClass.removeClass('small-1');
            sideClass.addClass('small-2');

            middleClass = $('.rebate-address .small-10');
            middleClass.removeClass('small-10');
            middleClass.addClass('small-8');

          } else {
            sideClass = $('.rebate-address .small-2');
            sideClass.removeClass('small-2');
            sideClass.addClass('small-1');

            middleClass = $('.rebate-address .small-8');
            middleClass.removeClass('small-8');
            middleClass.addClass('small-10');
          }
        }
        
      });

    },

    renderTemplate: function() {

      var rebate = this.options.rebate;

      this.$el.html(TEMPLATE.productRebatesModal({rebate: rebate}));

    }

  });

  return ProductRebatesModalView;
});
