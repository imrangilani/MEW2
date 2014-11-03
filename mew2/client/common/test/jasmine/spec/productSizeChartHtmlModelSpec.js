define([
  'models/_productSizeChartHtmlModel'
], function(ProductSizeChartHtmlModel) {
  'use strict';

  describe('_productSizeChartHtmlModel', function() {
    var productSizeChartHtmlModel;

    describe('#url', function() {
      it('should have canvasId in the Url if its set', function() {
        productSizeChartHtmlModel = new ProductSizeChartHtmlModel({ requestParams: { canvasId: 6001 }});
        expect(productSizeChartHtmlModel.url).toBeDefined();
        var fetchUrl = productSizeChartHtmlModel.url();
        expect(fetchUrl).toMatch(productSizeChartHtmlModel.urlRoot + productSizeChartHtmlModel.attributes.requestParams.canvasId);
      });

      it('should be undefined if canvasId is not provided', function() {
        productSizeChartHtmlModel = new ProductSizeChartHtmlModel({ requestParams: {} });
        expect(productSizeChartHtmlModel.url).toBeDefined();
        expect(productSizeChartHtmlModel.url()).not.toBeDefined();
      });
    });
  });
});
