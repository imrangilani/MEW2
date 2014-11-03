define([
  // Models
  'models/categoryModel'
], function(CategoryModel) {
  'use strict';

  var BrowseModel = CategoryModel.extend({
    setFacetRequestParams: function(facetModalRequestParams) {

      // Create an array of non-facet keys
      var whiteListKeys = ['sortby', 'sortorder', 'resultsperpage', 'categoryId', 'redirect'];

      // get all non-facet requestParams from the browse model
      var requestParams = _.pick(this.get('requestParams'), whiteListKeys);

      _.extend(requestParams, facetModalRequestParams);

      // Set browse model request params by extending on the facetModalRequestParams
      this.set('requestParams', _.extend(requestParams, {
        show: this.defaults.show
      }));
    },

    getFacetValues: function() {
      var nonFacetKeys = ['categoryId', 'currentpage', 'resultsperpage', 'show', 'sortby', 'sortorder', 'redirect'];
      return _.clone(_.omit(this.get('requestParams'), nonFacetKeys));
    }

  });

  return BrowseModel;
});
