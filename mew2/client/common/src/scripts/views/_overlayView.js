define([
  'jquery',
  // Views
  'views/baseView'

], function($, BaseView) {
  'use strict';
  var overlayView = BaseView.extend({
    className: 'hide',
    events: {
      'click .mb-j-overlay-close, .mb-j-overlay-continue': 'hide'
    },
    init: function() {
      this.listenTo(this.model, 'modelready', this.render);
      this.listenTo(this.model, 'modelreadyerror', this.renderError);
    },
    hide: function() {
      this.$el.addClass('hide');
      this.$el.html('');
      this.hideMask();
    },
    showMask: function() {
      if (!$('#mb-j-mask').length){
        $('body').append('<div id="mb-j-mask">&nbsp;</div>');
      }
    },
    hideMask: function() {
      $('#mb-j-mask').remove();
    }
  });

  return overlayView;
});
