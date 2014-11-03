define([
  'router/_core/_facets',
  'views/searchResultsView'
], function(Facets, SearchResultsView) {
  'use strict';

  var handler = {
    name: 'search',
    paths: ['shop/search(/:facetKeys)(/:facetValues)(?*querystring)'],
    requiredParams: ['keyword'],
    optionalParams: ['cm_kws_ac'],

    buildUrl: function(attributes) {
      return Facets.buildUrl.call(this, attributes, '/shop/search/');
    },

    hooks: {
      preExecute: ['convertHashbangURL'],
      preValidate: ['killswitchBopsFacet']
    },

    view: {
      ViewConstructor: SearchResultsView
    }
  };

  return handler;
});
