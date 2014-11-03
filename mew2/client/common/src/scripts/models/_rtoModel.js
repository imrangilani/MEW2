define([
  // models
  'models/baseModel',
  'util/util'
], function(BaseModel, util) {
  'use strict';

  var informantCallMemory = [];

  var RTOModel = BaseModel.extend({
    urlRoot: '/EventsWar/events/record/customeraction',

    initialize: function (attributes, options) {
      if( options) {
        this.slider = options.slider;
        this.recommendations = options.recommendations;
      }
    },

    sendInformantCall: function(infoCallType, param) {

      var customerId = util.getCookie('macys_online_uid'),
          countryCode = util.getCookie('shippingCountry'),
          productIds,
          choiceIds,
          categoryId;

      switch (infoCallType) {
        case this.getInformantCallTypes().CLICKED:

          productIds = param.data('product-id');
          choiceIds = param.data('product-choiceid');
          categoryId = this.recommendations.attributes.categoryId;

          this.clearInformantCallMemory();
          break;

        case this.getInformantCallTypes().PRESENTED:
          productIds = this.getProductIds().join('|');
          choiceIds = this.getChoiceIds().join('|');
          categoryId = this.recommendations.attributes.categoryId;
          break;

        case this.getInformantCallTypes().ADDTOBAG:
          productIds = param.productIds + '';
          choiceIds = param.choiceIds;
          categoryId = param.categoryId;
          break;
      }

      if (!_.isEmpty(productIds)) {
        var data = {
          productIds: productIds,
          sender: 'MCOM-MMEW',
          context: 'PDP_ZONE_B',
          responseType: infoCallType,
          choiceIds: decodeURIComponent(choiceIds),
          visitorId: util.getCookie('RTD'),
          categoryId: categoryId
        };

        if (customerId) {
          _.extend(data, {customerId : customerId});
        }

        if (countryCode) {
          _.extend(data, {countryCode : countryCode});
        }

        Backbone.emulateJSON = true;
        this.save ({}, { data: data, success: this.success, error: this.error });
      }
    },

    success:function() {
      Backbone.emulateJSON = false;
    },

    error: function() {
      Backbone.emulateJSON = false;
      BaseModel.prototype.error.apply(this, arguments);
    },

    getProductIds: function() {

      var productIds = [], currentProductId;
      _.each(this.slider.visibleSlides, function(recommendation) {
        currentProductId = recommendation.data('product-id');

        if (!_.contains(informantCallMemory, currentProductId)) {
          productIds.push(currentProductId);
          informantCallMemory.push(currentProductId);
        }
      });

      return productIds;
    },

    getChoiceIds: function() {
      var choiceids = [], currentChoiceid;

      _.each(this.slider.visibleSlides, function(recommendation) {
        currentChoiceid = recommendation.data('product-choiceid');

        choiceids.push(currentChoiceid);
      });

      return choiceids;
    },

    getInformantCallTypes: function() {
      return {
        PRESENTED: 'Presented',
        CLICKED: 'Clicked',
        ADDTOBAG: 'AddToBag'
      };
    },

    getStoredProductIds: function() {
      return informantCallMemory;
    },

    clearInformantCallMemory: function() {
      informantCallMemory = [];
    }

  });

  return RTOModel;
});
