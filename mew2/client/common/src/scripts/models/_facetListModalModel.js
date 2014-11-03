/**
 * @file _facetListModalModel.js
 */

/**
 * attributes:
 *
 * - requestParams
 * - facets
 */

define([
  'util/util',
  'models/baseModel'
], function(util, BaseModel) {
  'use strict';

  var FacetListModalModel = BaseModel.extend({

    defaults: function() {
      return {
        nonFacetKeys: ['categoryId', 'searchphrase', 'show', 'facetexpandall', 'redirect'],
        requestParams: {
          show: 'facet',
          facetexpandall: true
        },
        header: {
          id: 'facet-list',
          title: 'Filter by',
          left: {
            title: 'cancel'
          },
          right: {
            title: 'apply'
          }
        },
        facetSessionValues: {}
      };
    },

    url: function() {
      var requestParams;
      // The url is generated differently depending on which page this facet modal is a subView of
      // @TODO there are better ways to do this.
      if (this.get('context') === 'search') {
        // assume this is a facet modal for search requests
        requestParams = _.defaults(this.attributes.requestParams, _.result(this, 'defaults').requestParams);

        return '/api/v4/catalog/search' + util.buildApiUrl(requestParams);
      } else {
        // assume this is a facet modal for browse requests
        var categoryId = this.attributes.requestParams.categoryId;
        requestParams = _.defaults(_.omit(this.attributes.requestParams, 'categoryId'), _.result(this, 'defaults').requestParams);

        // Temporary - facetexpandall cannot be a part of browse
        requestParams = _.omit(requestParams, 'facetexpandall');

        return '/api/v3/catalog/category/' + categoryId + '/browseproducts' + util.buildApiUrl(requestParams);
      }
    },

    success: function(model, resp, options) {
      model.normalizeFacets();
      BaseModel.prototype.success.call(null, model, resp, options);
    },

    initSelectedFacetValues: function() {
      var selectedFacetValues = {};

      // Initialize the selected values based on the data received from the main content view
      // request params
      _.each(_.omit(this.get('requestParams'), this.get('nonFacetKeys')), function(paramValues, paramKey) {
        selectedFacetValues[paramKey] = {};
        selectedFacetValues[paramKey].selected = paramValues.split(',').map(function(value) {
          return value.replace(/%2C/g, ',');
        });

        // We need to init range value for facets that use it
        if (paramKey.toUpperCase() === 'PRICE' || paramKey.toUpperCase() === 'CUSTRATINGS') {
          selectedFacetValues[paramKey].selectedRange = paramValues.split(',').map(function(value) {
            value = value.replace('[','').replace(']', '').split(' TO ');
            return { from: value[0], to: value[1] };
          });
        }
      });

      this.set('facetSessionValues', selectedFacetValues);
    },

    updateRequestParams: function() {
      var requestParams = _.pick(this.get('requestParams'), this.get('nonFacetKeys'));

      _.each(this.get('facetSessionValues'), function(sessionValues, facetName) {
        if (sessionValues.selected.length > 0) {
          // We need to encode only commas in case a single value has it
          requestParams[encodeURIComponent(facetName)] = sessionValues.selected.map(function(val) {
            return (val).replace(/,/g, '%2C');
          }).join(',');
        } else {
          delete requestParams[encodeURIComponent(facetName)];
        }

        _.each(sessionValues.urlParams, function(param) {
          requestParams[param.name] = param.value;
        });
      });

      this.set('requestParams', requestParams);
    },

    removeStaleFacetSelections: function() {
      _.each(this.get('facetSessionValues'), function(sessionValues, facetName) {
        delete sessionValues.disabled;
        if (sessionValues.selected.length === 0) {
          delete this.get('facetSessionValues')[facetName];
        }
      }, this);
    },

    getFacetByName: function(facetName) {
      return _.findWhere(this.get('facets'), { name: facetName });
    },

    normalizeFacets: function() {
      var facets = this.get('facets');
      var facetSessionValues = this.get('facetSessionValues');
      var displayIfEmpty = ['COLOR_NORMAL', 'SIZE_NORMAL', 'PRICE', 'UPC_BOPS_PURCHASABLE'];
      var deleteFacets = [];
      _.each(facets, function(facet) {

        if (!facet) {
          return;
        }

        // Since brands are not sorted by WSSG, we have to sort them on the client
        if (facet.name === 'BRAND') {
          facet.value = _.sortBy(facet.value, function(brand) {
            return brand.name.toLowerCase();
          });
        }

        // Loop through each facet value and either modify the fetched response,
        // or update the facet session based on the productcount
        _.each(facet.value, function(value) {
          if (value.productcount === 0) {

            // If the facet value was previously selected and now has 0 products,
            // move it into the `disabled` array for the facet session
            if (typeof facetSessionValues[facet.name] !== 'undefined' && _.contains(facetSessionValues[facet.name].selected, value.name)) {
              facetSessionValues[facet.name].selected = _.without(facetSessionValues[facet.name].selected, value.name);
              if (!facetSessionValues[facet.name].disabled) {
                facetSessionValues[facet.name].disabled = [];
              }
              facetSessionValues[facet.name].disabled.push(value.name);
            }

            // If the facet value doesn't belong to a facet which displays empty values, remove it
            if (!_.contains(displayIfEmpty, facet.name)) {
              facet.value = _.without(facet.value, value);
            }
          } else {

            // If the value was previously selected, but currently disabled and now has more than 0 products,
            // add it back to the `selected` array for the facet session
            if (facetSessionValues[facet.name] &&
                facetSessionValues[facet.name].disabled &&
                _.contains(facetSessionValues[facet.name].disabled, value.name)) {
              facetSessionValues[facet.name].disabled = _.without(facetSessionValues[facet.name].disabled, value.name);
              facetSessionValues[facet.name].selected.push(value.name);
            }
          }
        });

        // Delete facets where every value has 0 products, unless it displays empty values
        if (_.isEmpty(facet.value) && facet.name !== 'UPC_BOPS_PURCHASABLE' && !_.contains(displayIfEmpty, facet.name)) {
          deleteFacets.push(facet.name);
        }
      }, this);

      // Sorting BRAND selected facets since they were coming in the
      // the same order they were selected
      if (facetSessionValues &&
          facetSessionValues.BRAND &&
          facetSessionValues.BRAND.selected) {
        facetSessionValues.BRAND.selected = _.sortBy(facetSessionValues.BRAND.selected, function(brand) {
          return brand.toLowerCase();
        });
      }

      _.each(deleteFacets, function(facetName) {
        _.remove(facets, { name: facetName });
      });
    }
  });

    // Override success after extending Spinner.Model
  FacetListModalModel.prototype.success = function(model, resp, options) {
    model.normalizeFacets();
    BaseModel.prototype.success(model, resp, options);
  };

  return FacetListModalModel;
});
