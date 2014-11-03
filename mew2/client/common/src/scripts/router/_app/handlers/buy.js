define([
  'router/_core/_facets',
  'views/searchResultsView'
], function(Facets, SearchResultsView) {
  'use strict';

  var handler = {
    name: 'buy',
    paths: ['buy/:designerName(/:facetKeys)(/:facetValues)'],
    requiredParams: ['searchphrase'],
    optionalParams: ['cm_kws_ac'],

    buildUrl: function(attributes) {
      return Facets.buildUrl.call(this, attributes, '/buy/');
    },

    hooks: {
      preExecute: ['convertHashbangURL'],

      preValidate: [
        function(data) {
          data.searchphrase = this.currentRoute.params.designerName.split('-').join(' ');
          data.isDesignerIndexResults = true;
        },

        'killswitchBopsFacet'
      ]
    },

    view: {
      ViewConstructor: SearchResultsView
    }
  };

  return handler;
});
