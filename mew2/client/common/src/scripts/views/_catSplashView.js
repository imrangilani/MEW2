define([
  // Views
  'views/mainContentView',
  'toggleNav'
], function (MainContentView, toggleNav) {
  'use strict';

  var catSplashView = MainContentView.extend({
    init: function() {
      this.render();

      if (App.router.isDeepLink() && App.config.ENV_CONFIG.nav_autoexpand_catsplash !== 'off') {
        /**
         * The following functionality allows for a "default" expand/hide state (per-brand),
         * and an additional URL param to check for, which will override the default if set.
         *
         * Commenting this out for now; will be used in the future.
         *
        // "Auto-expand" functionality is enabled. Check for default ("show"/"hide") and url param
        var navToggle = App.config.nav_autoexpand.catsplash.default;

        var param = $.url().param('navToggle');
        if (param === 'show' || param === 'hide') {
          navToggle = param;
        }

        if (navToggle === 'show') {
          toggleNav.toggle();
        }
        */

        toggleNav.toggle();
      }
    }
  });

  return catSplashView;

});
