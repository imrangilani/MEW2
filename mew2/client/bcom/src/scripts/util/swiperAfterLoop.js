define([
  'swiper'
], function(Swiper) {
  'use strict';

  Swiper.prototype.plugins.afterLoop = function(swiper, params) {
    if (!params.callback) {
      return;
    }

    return {
      onCreateLoop: function() {
        params.callback.call(this, swiper);
      }
    };
  };
});
