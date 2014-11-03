define([
  // Views
  'views/_searchView',
  'analytics/bloomiesCoremetrics',
  'analytics/analyticsData',
  'util/util'
], function(SearchView, bloomiesCoremetrics, analyticsData, Util) {
  'use strict';

  var BCOMSearchView = SearchView.extend({
    events: _.extend(_.clone(SearchView.prototype.events), {
      'click #mb-j-search-field': 'searchFieldAnalytics'
    }),

    searchFieldAnalytics: function() {
      // gets the site promotion tag value to throw
      var coremetricsHiddenElement = this.$el.find('[name="cm_sp"]'),
          sitePromotion = coremetricsHiddenElement.val(),
          $href,
          href;

      // throws the coremetrics tag
      if (sitePromotion) {
        $href = $.url();
        href = Util.buildFullUrl({
            protocol: $href.attr('protocol'),
            host: $href.attr('host'),
            port: $href.attr('port'),
            path: $href.attr('path'),
            query: [$href.attr('query'), 'cm_sp=' + sitePromotion],
            fragment: $href.attr('fragment')
          });
        bloomiesCoremetrics.cmCreateManualLinkClickTag(href);
        bloomiesCoremetrics.cmCreateManualImpressionTag(sitePromotion);
      }
    },

    doSearchAnalytics: function(searchphrase) {
      analyticsData.setCMSearchKeyword(searchphrase);
      analyticsData.setCMAutocompleteKeyword(undefined);
    }
  });

  return BCOMSearchView;
});
