define([
  'views/baseView'
], function(BaseView) {
  'use strict';

  var ConfirmOverlay = BaseView.extend({
    events: {
      'click .mb-j-close, .mb-j-overlay-close': 'close'
    },

    init: function() {
      this.$mask = $('<div id="mb-j-mask">&nbsp;</div>');
      this.$el = $(TEMPLATE.confirmOverlay(this.options));

      // Since we set up this.$el in init(), be sure to re-attach events
      this.delegateEvents();

      this.render();
    },

    renderTemplate: function() {
      $('body').append(this.$mask).append(this.$el);

      this.$mask.on('click', _.bind(function() {
        this.close();
      }, this));
    },

    close: function() {
      this.$mask.remove();
      this.$el.remove();
    }
  });

  return ConfirmOverlay;
});
