define([
  // Views
  'views/_facetSelectionModalView',
  'analytics/analyticsTrigger',
  'util/crossBrowserHeight'
], function(FacetSelectionModalView, analytics, crossBrowserHeight) {
  'use strict';

  var BCOMFacetSelectionhModalView = FacetSelectionModalView.extend({

    postRender: function() {
      FacetSelectionModalView.prototype.postRender.apply(this, arguments);
      $(this.el).find('.truncated').dotdotdot({ wrap: 'letter', watch: true });
    },

    endOfShow: function(e) {
      FacetSelectionModalView.prototype.endOfShow.apply(this, arguments);
      $(window).scrollTop(0);
    },

    doClearAllAnalytics: function() {
      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: 'Clear ' + this.model.get('facet').name,
        elementCategory: 'Sort By'});
    }

  });

  return BCOMFacetSelectionhModalView;
});
