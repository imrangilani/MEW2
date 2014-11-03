/**
 * Created by Flávio Coutinho on 6/24/2014.
 */
define([
  // Views
  'views/modalView'
], function (ModalView) {
  'use strict';

  return ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    renderTemplate: function () {
      this.$el.html(TEMPLATE.giftCardsTermsModal());
    }

  });
});
