define([
  'jquery',
  // Views
  'views/overlayView'

], function($, overlayView) {

  'use strict';

  var ErrorOverlay = overlayView.extend({
    className: 'mb-j-error-overlay',
    events: {
      'click .mb-j-overlay-close': 'close',
      'click .mb-j-overlay-continue': 'close',
      'click .mb-overlay-tryagain': 'reload'
    },
    init: function() {
      if (!this.options.errorCode){
        throw new Error('overlayView needs to be initialized with an errorCode of errorMessage to display');
      }

      if (!this.elementInDOM()) {
        $('body').append(this.$el);
      }
    },
    renderTemplate: function(){
      var html = TEMPLATE.errorOverlay({errorCode: this.options.errorCode});

      this.$el.html(html);

      this.$el.removeClass('hide');
      this.showMask();
    },
    //Overlay just closes when the button is pressed
    close: function(){
      this.hide();
      overlayView.prototype.close.call(this);
      $('.mb-j-error-overlay').remove();
    },

    reload: function() {
      window.location.reload(true);
    }

  });

  return ErrorOverlay;
});