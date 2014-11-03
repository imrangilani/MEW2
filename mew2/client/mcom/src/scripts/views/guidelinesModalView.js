define([
  'views/modalView'
], function(ModalView) {
  'use strict';

  var guidelinesModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-2',

    renderTemplate: function() {
      this.$el.html(TEMPLATE.guidelinesModal(this.options));
    }
  });

  return guidelinesModalView;
});
