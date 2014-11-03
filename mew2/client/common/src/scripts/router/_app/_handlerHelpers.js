define([
], function() {
  'use strict';

  var helpers = {
    /**
     * Check if a feature is enabled, and refresh the page if not.
     * The purpose of refreshing the page is so the server can check for the same
     * feature flag, and route to a 1.0 experience instead.
     */
    checkFeature: function(feature) {
      var enabled = App.config.ENV_CONFIG[feature] !== 'off';

      if (!enabled) {
        window.location.reload();
      }

      return enabled;
    }
  };

  return helpers;
});
