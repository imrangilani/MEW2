define([
  'router/_core/_facets',
  'views/categoryView'
], function(Facets, CategoryView) {
  'use strict';

  var handler = {
    name: 'category',
    paths: [
      'catalog/index.ognc',
      'shop(/)?id=*id',
      'shop/:categoryString(/:facetKeys)(/:facetValues)',
      'shop/:parentCategoryName/:categoryString(/:facetKeys)(/:facetValues)'
    ],
    requiredParams: ['id'],
    optionalParams: ['categoryid'],

    buildUrl: function(attributes) {
      var base;

      switch (this.currentRoute.path) {
      case 'shop/:categoryString(/:facetKeys)(/:facetValues)':
        base = '/shop/' + this.currentRoute.params.categoryString + '/';
        break;
      case 'shop/:parentCategoryName/:categoryString(/:facetKeys)(/:facetValues)':
        base = '/shop/' + this.currentRoute.params.parentCategoryName + '/' + this.currentRoute.params.categoryString + '/';
        break;
      }

      if (base) {
        return Facets.buildUrl.call(this, attributes, base);
      }

      return false;
    },

    hooks: {
      preExecute: ['convertHashbangURL'],

      preValidate: [
        'checkLegacyCategoryURL',

        function(data) {
          if (data.categoryid) {
            data.legacyPath = true;
            data.id = data.categoryid;
            delete data.categoryid;

            this.navigate(null, { attributes: data, replace: true });
          }
        },

        function(data) {
          var updateUrl = false;

          if (parseInt(data.id) === 30668) {
            // this is a gift card page. remove unsupported sort options
            if (data.sortby === 'PRICE_LOW_TO_HIGH' || data.sortby === 'PRICE_HIGH_TO_LOW' || data.sortby === 'TOP_RATED') {
              delete data.sortby;
              updateUrl = true;
            }
          }

          if (updateUrl) {
            this.navigate(null, { attributes: data, replace: true });
          }
        },

        // Remove item name sortby if set
        function(data) {
          var updateUrl = false;

          if (data.sortby === 'NAME') {
            delete data.sortby;
            updateUrl = true;
          }

          if (updateUrl) {
            this.navigate(null, { attributes: data, replace: true });
          }
        },

        'normalizeProductsPerPage',
        'killswitchBopsFacet'
      ]
    },

    view: {
      getMenuId: function(data) {
        return data.id;
      },

      getMainContentView: function(data) {
        // Tier2 remain categories render with the parent's id
        if (App.model.isTier2Remain(data.id)) {
          data.id = App.model.get('categoryIndex').menus[data.id].parent;
        }

        // Don't re-render the category view if it is a parent of a tier2 remain
        // that is already rendered
        if (App.model.isParentOfTier2Remain(data.id) &&
            this.currentMainContentView instanceof CategoryView &&
            this.currentMainContentView.id === data.id) {
          return this.currentMainContentView;
        }

        return new CategoryView({ options: data });
      }
    }
  };

  return handler;

});
