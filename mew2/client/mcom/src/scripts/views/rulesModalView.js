define([
  'views/modalView'
], function(ModalView) {
  'use strict';

  var rulesModalView = ModalView.extend({

    init: function(){
      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.rulesModal(this.options));
    }
  });

  return rulesModalView;
});
