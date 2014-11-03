define([
  'analytics/_analyticsData',
  'util/multiValueCookie'

], function (analyticsData, mvCookie) {
  'use strict';

  var storage = _.extend(analyticsData, {

    /*
     * Create a context of coremetrics attributes given a product.
     * @param product Product model
     * @returns {Array} An array with coremetrics attributes for ProductView Tag.
     */
    getCMProductViewContext: function(product) {
      var attributes = {},
          productType,
          bopsInfo,
          storeId;

      // Rating info
      if (product.rating) {
        attributes['1'] = product.rating.avg;
        attributes['2'] = product.rating.cnt;
        attributes['3'] = product.rating.recommended;
      }

      // Bops info
      if (product.isFIIS) {
        bopsInfo = 'Find It In Store';
      } else {
        bopsInfo = 'BOPS: Store ';
        storeId = mvCookie.get('BOPSPICKUPSTORE', 'MISCGCs');
        if (storeId) {
          bopsInfo += 'Known-' + storeId;
        } else {
          bopsInfo += 'Unknown';
        }
      }
      attributes['16'] = bopsInfo;

      // Product type
      if (product.isMaster) {
        productType = 'MASTER';
      } else if (product.masterCollection) {
        productType = 'MEMBER';
      } else {
        productType = 'SINGLE ITEM';
      }
      attributes['18'] = productType;

      // Store only product
      if (product.storeOnlyProduct) {
        attributes['28'] = 'store_only_product';
      }

      return attributes;
    },

    getCMProductViewCategory: function(product) {
      var isComingFromSearch = !!analyticsData.getCMSearchKeyword(),
          productCategoryId = product.requestParams.categoryId || product.activeCategory;

      if (isComingFromSearch) {
        return 'se-xx-xx-xx.esn_results';
      }

      return productCategoryId;
    }

  });

  return storage;
});
