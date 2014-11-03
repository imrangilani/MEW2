define([
  'util/spinner',
  'views/_facetBopsModalView'
], function(spinner, FacetBopsModalView) {
  'use strict';

  var MCOMFacetBopsModalView = FacetBopsModalView.extend({
    events: _.extend(FacetBopsModalView.prototype.events, {
      'change #mb-bops-distance': 'updateDistance'
    }),

    updateDistance: function(e) {
      var $select = $(e.currentTarget);
      var display = $select.find('option[value=' + $select.val() + ']').text();
      $select.closest('.m-select-wrapper').find('.m-select-button .display').text(display);
    },

    search: function() {
      FacetBopsModalView.prototype.search.apply(this, arguments);

      // Empty out whatever might exist from a previous search, and show spinner after 1 sec
      var $results = $(this.el).find('#mb-facet-bops-results');
      spinner.add($results, 'white', 60);
    },

    updateStoreList: function() {
      var $results = $(this.el).find('#mb-facet-bops-results');
      spinner.remove($results);

      FacetBopsModalView.prototype.updateStoreList.apply(this, arguments);
    }

  });

  return MCOMFacetBopsModalView;

});
