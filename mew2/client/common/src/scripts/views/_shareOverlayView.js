define([
  'jquery',
  // Views
  'views/overlayView'
], function($, OverlayView) {
  'use strict';

  var shareOverlayView = OverlayView.extend({
    init: function() {
      
    },

    show: function() {
      this.render();
    },

    postRender: function() {
      
    }
  });

  return shareOverlayView;
});
