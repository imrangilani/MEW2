define([
  'jasmineHelpers',
  'models/_productRecommendationsModel'
], function(jasmineHelpers, ProductRecommendationsModel) {
  'use strict';

  describe('_productRecommendationsModel', function() {
    var productRecommendationsModel;

    beforeEach(function() {
      jasmineHelpers.prepareAppGlobals();

      App.config.recommendations = {
        requester: 'BCOM-BMEW',
        context: 'PDP_ZONE_A',
        maxRecommendations: 6
      };

      productRecommendationsModel = new ProductRecommendationsModel({
        productId: 11111
      });

    });

    describe('#defaults', function() {
      it('should have default `productId` and `visitorId`', function() {
        expect(productRecommendationsModel.get('productId')).toBeDefined();
      });
    });

    describe('#initialize', function() {
      it('should set the`visitorId` from the cookie', function() {
        spyOn(productRecommendationsModel, 'checkVisitorIdCookie');
        productRecommendationsModel.initialize();
        expect(productRecommendationsModel.checkVisitorIdCookie).toHaveBeenCalled();
      });
    });

    describe('#url', function() {
      it('should have a url for fetching that contains the default values', function() {
        expect(productRecommendationsModel.url).toBeDefined();
        var fetchUrl = productRecommendationsModel.url();
        expect(fetchUrl).toMatch('recommendations/product/');
      });
    });
  });
});
