define([
  'router/_core/_facets',
  'views/searchResultsView'
], function(Facets, SearchResultsView) {
  'use strict';

  var handler = {
    name: 'buyFob',
    paths: ['buy/all-designers/:fobString/:designerName(/:facetKeys)(/:facetValues)'],
    requiredParams: ['searchphrase'],
    optionalParams: ['cm_kws_ac'],

    buildUrl: function(attributes) {
      return Facets.buildUrl.call(this, attributes, '/buy/all-designers/');
    },

    hooks: {
      preExecute: ['convertHashbangURL'],

      preValidate: [
        function(data) {
          data.searchphrase = this.currentRoute.params.designerName.split('-').join(' ');
          data.isDesignerIndexResults = true;

          var fobUrlMaps = App.config.fobs && App.config.fobs.urlMap ? App.config.fobs.urlMap : {};

          var fobUrlMap = _.find(fobUrlMaps, function(value, key) {
            return this.currentRoute.params.fobString === key;
          });

          if (fobUrlMap) {
            data.FOB = fobUrlMap;
          } else {
            data.FOB = this.currentRoute.params.fobString[0].toUpperCase() + this.currentRoute.params.fobString.substring(1);
          }
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
