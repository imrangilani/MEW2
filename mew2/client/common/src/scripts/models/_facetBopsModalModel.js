define([
  'models/baseModel',
  'util/util'
], function (BaseModel, util) {
  'use strict';

  var FacetBopsModalModel = BaseModel.extend({
    header: {
      id: 'facet-bops',
      title: 'In-Store Pickup',
      left: {
        title: 'cancel'
      },
      right: {
        title: 'done'
      }
    },

    defaults: function() {
      return {
        selectedValues: [],
        requestParams: {
          appl: 'MOBILE',
          device: 'PHONE',
          show: 'facet',
          expand: 'stores'
        },
        fixedRequestParams: {},
        header: this.header
      };
    },

    url: function() {
      var requestParams;
      // The url is generated differently depending on which page this facet modal is a subView of
      // @TODO there are better ways to do this.
      if (this.get('context') === 'search') {
        // assume this is a facet bops modal for search requests
        requestParams = _.defaults(this.attributes.requestParams, _.result(this, 'defaults').requestParams);

        return '/api/v4/catalog/search' + util.buildApiUrl(requestParams);
      } else {
        // assume this is a facet modal for browse requests
        var categoryId = this.attributes.requestParams.categoryId;
        requestParams = _.defaults(_.omit(this.attributes.requestParams, 'categoryId'), _.result(this, 'defaults').requestParams);

        // appl and device cannot be a part of browse
        requestParams = _.omit(requestParams, ['appl', 'device']);

        // Temporary - facetexpandall cannot be a part of browse
        requestParams = _.omit(requestParams, 'facetexpandall');

        return '/api/v3/catalog/category/' + categoryId + '/browseproducts' + util.buildApiUrl(requestParams);
      }
    },

    addRequestParams: function(params, fixed) {
      var currentParams = this.get('requestParams');
      currentParams = _.extend(currentParams, params);

      this.set('requestParams', _.extend(currentParams, params));

      if (fixed) {
        _.extend(this.get('fixedRequestParams'), _.clone(params));
      }
    },

    clearRequestParams: function() {
      this.set('fixedRequestParams', {});
      this.resetRequestParams();
    },

    resetRequestParams: function() {
      this.set('requestParams', _.extend({}, this.get('fixedRequestParams'), _.result(this, 'defaults').requestParams));
    }

  });

  return FacetBopsModalModel;
});
