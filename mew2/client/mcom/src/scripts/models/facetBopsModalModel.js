define([
  'models/_facetBopsModalModel'
], function (FacetBopsModalModel) {
  'use strict';

  var MCOMFacetBopsModalModel = FacetBopsModalModel.extend({
    header: {
      id: 'facet-bops',
      title: 'Filter By',
      left: {
        title: ''
      },
      right: {
        title: 'done'
      }
    }
  });

  return MCOMFacetBopsModalModel;
});
