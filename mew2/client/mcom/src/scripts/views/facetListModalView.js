define([
  // Views
  'views/_facetListModalView',
  'analytics/analyticsTrigger',
  'analytics/analyticsData'
], function(FacetListModalView, analytics, analyticsData) {
  'use strict';

  var MCOMFacetListModalView = FacetListModalView.extend ({
    applyFacets: function() {
      FacetListModalView.prototype.applyFacets.call(this);
      this.doFacetsAnalytics();
    },

    doFacetsAnalytics: function() {
      var previousFacets = this.model.get('previousAttributes').facetSessionValues;
      var facetTypesCount = _.size (this.model.get('facetSessionValues'));

      var keyword, breadcrumb, searchContext;
      if (this.model.attributes.context === 'search') {
        searchContext = analyticsData.getCMSearchContext();
        //It's possible for context to be 'search' but searchCOntext to be empty - search url reload
        if (searchContext) {
          keyword = searchContext.keyword;
          breadcrumb = 'Onsite Search Results';
        }
      }

      _.each(this.model.get('facetSessionValues'), function(sessionValues, facetType) {

        var facetValuesCount = sessionValues.selected.length;
        var previousFacetValues = previousFacets[facetType] ? previousFacets[facetType].selected : null;

        _.each(sessionValues.selected, function(facetValue) {
          if (!_.isEmpty(facetValue)) {
            if (!previousFacetValues || _.indexOf(previousFacetValues,facetValue) === -1) {
              analytics.triggerTag({
                tagType: 'pageElementTag',
                elementId: facetValue,
                elementCategory: 'Facet: ' + facetType,
                att6: keyword,
                att7: breadcrumb,
                att21: facetValuesCount,
                att22: facetTypesCount
              });
            }
          }
        });
      });
    }
  });

  return MCOMFacetListModalView;
});
