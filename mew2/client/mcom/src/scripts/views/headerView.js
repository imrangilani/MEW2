define([
  // Utilities
  'toggleNav',

  // Views
  'views/_headerView',
  'views/bagCountView',
  'views/marketorialView'
], function(toggleNav, HeaderView, BagCountView, MarketorialView) {
  'use strict';

  var MCOMHeaderView = HeaderView.extend({

    events: {
      'click #mb-j-header-image': 'goHome',
      'click #mb-j-nav-button':   'toggleNavMenu'
    },

    toggleNavMenu: function() {
      toggleNav.toggle();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.header());
    },

    postRender: function() {
      this.subViews.bagCountView = new BagCountView();

      if (App.config.ENV_CONFIG.marketorial !== 'off' && !MarketorialView.prototype.hasBeenShown()) {
        this.subViews.marketorialView = new MarketorialView();
      }
    }
  });
  return MCOMHeaderView;
});
