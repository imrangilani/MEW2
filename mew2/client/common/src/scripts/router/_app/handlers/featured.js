define([
  'router/_core/_facets',
  'views/searchResultsView'
], function(Facets, SearchResultsView) {
  'use strict';

  var handler = {
    name: 'featured',
    paths: ['shop/featured/:brandName(/:facetKeys)(/:facetValues)'],
    requiredParams: ['searchphrase'],
    optionalParams: ['cm_kws_ac'],

    buildUrl: function(attributes) {
      return Facets.buildUrl.call(this, attributes, '/shop/featured/');
    },

    hooks: {
      preExecute: ['convertHashbangURL'],

      preValidate: [
        function(data) {
          data.searchphrase = this.currentRoute.params.brandName.split('-').join(' ');
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
