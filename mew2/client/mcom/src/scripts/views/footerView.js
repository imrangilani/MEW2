define([
  'views/_footerView',
  'analytics/analyticsTrigger'
], function(FooterView, analytics) {
  'use strict';

  var MCOMFooterView = FooterView.extend({
    events: {
      'click #m-footer-link-simple-signin, #m-footer-link-signin': 'doSignInPageViewAnalytics',
      'click #m-footer-link-simple-signout, #m-footer-link-signout': 'doSignOutElementTagAnalytics'
    },

    doSignInPageViewAnalytics: function(e) {
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: 'Sign In (si-xx-xx-xx.index)',
        categoryId: 'si-xx-xx-xx.index'
      });
    },

    doSignOutElementTagAnalytics: function(e) {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'button_sign_out',
        elementCategory: 'Sign In'
      });
      this.logout();
      return false;
    }

  });

  return MCOMFooterView;

});
