define([

  // Utilities
  'toggleNav',
  'analytics/bloomiesCoremetrics',

  // Views
  'views/_headerView'
], function (toggleNav, bloomiesCoremetrics, HeaderView) {

  'use strict';

  var BCOMHeaderView = HeaderView.extend({

    events: {
      'click #mb-j-header-image' : 'goHome',
      'click #mb-j-nav-button' : 'toggleNavMenu',
      'click #mb-j-bag-image' : 'goToBagPage'
    },

    goHome: function() {
      bloomiesCoremetrics.cmCreateManualLinkClickTag('/?cm_sp=NAVIGATION_MEW-_-TOP_NAV-_-MAINICON-n-n');
      bloomiesCoremetrics.cmCreateManualImpressionTag('NAVIGATION_MEW-_-TOP_NAV-_-MAINICON-n-n');
    },

    toggleNavMenu: function() {
      toggleNav.toggle();
      bloomiesCoremetrics.cmCreateManualLinkClickTag('/?cm_sp=NAVIGATION_MEW-_-TOP_NAV-_-GLOBALNAVICON-n-n');
      bloomiesCoremetrics.cmCreateManualImpressionTag('NAVIGATION_MEW-_-TOP_NAV-_-GLOBALNAVICON-n-n');
    },

    goToBagPage: function () {
      // Go to 1.0 bag-page
    }

  });

  return BCOMHeaderView;

});
