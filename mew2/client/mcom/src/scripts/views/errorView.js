define([
  // Views
  'views/_errorView',
  'analytics/analyticsTrigger'
], function(ErrorView, analytics) {

  'use strict';

  var MCOMErrorView = ErrorView.extend({

    renderTemplate: function() {
      ErrorView.prototype.renderTemplate.apply(this, arguments);
      if( this.getErrorCode() === 'notFound') {
        this.doPageViewAnalytics();
      }
    },

    doPageViewAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: 'PAGENA',
        categoryId: 'PAGENA'
      });
    }

  });

  return MCOMErrorView;
});
