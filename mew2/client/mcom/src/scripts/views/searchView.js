define([
  // Views
  'views/_searchView',
  //util
  'analytics/analyticsData'
], function(SearchView, analytics) {
  'use strict';

  var MCOMSearchView = SearchView.extend({
    // @overrides
    // Empties the contents of the search input
    clearSearchField: function() {
      // Empty input and trigger blur event (cleanupSearchBar) and keyup event (toggleSearchClear)
      SearchView.prototype.clearSearchField.call(this);
    },
    submitSearch: function() {

      var trimmedSearchTerms = $.trim($('#mb-j-search-field').val());
      if (trimmedSearchTerms.length > 0) {
        analytics.setCMSearchKeyword(trimmedSearchTerms);
      }

      return  SearchView.prototype.submitSearch.call(this);
    }
  });
  return MCOMSearchView;
});
