define([
  'views/mainContentView'
], function(mainContentView) {
  'use strict';

  var giftCardsView = mainContentView.extend({

    init: function() {
      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.giftCards());
    }
  });

  return giftCardsView;
});
