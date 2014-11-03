/**
 * @file _productRecommendationsModel.js
 */

define([
  'models/baseModel',
  'util/util'
], function(BaseModel, util) {

  'use strict';

  var productRecommendationsModel = BaseModel.extend({
    urlRoot: '/api/v4/recommendations/product/',

    defaults: function() {
      return {
        productId: 0
      };
    },

    initialize: function() {
      // Set the RTD cookie if it doesn't already exist
      this.checkVisitorIdCookie();
    },

    url: function() {
      var requester = App.config.recommendations.requester,
          context = App.config.recommendations.context,
          maxRecommendation = App.config.recommendations.maxRecommendations,
          categoryId = this.get('categoryId');
      // Derive the WSSG URL from these requestParams
      return this.urlRoot + this.get('productId') +
        '?requester=' + requester +
        '&context=' + context +
        '&maxRecommendation=' +
        maxRecommendation +
        '&categoryid=' + categoryId;
    },

    checkVisitorIdCookie: function() {
      var RTD = util.getCookie('RTD');
      if (!RTD) {
        RTD = util.generateGUID();
        $.cookie('RTD', RTD, { expires: 365, path: '/' });
      }
    }
  });

  return productRecommendationsModel;
});
