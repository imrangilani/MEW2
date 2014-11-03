define([
  'views/modalView'
], function(ModalView) {
  'use strict';

  var termsModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-2',

    renderTemplate: function() {
      this.$el.html(TEMPLATE.termsModal(this.options));
    }
  });

  return termsModalView;
});
