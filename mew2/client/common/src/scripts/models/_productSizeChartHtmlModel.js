define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  var SizeChartModel = BaseModel.extend({
    urlRoot: '/api/v4/catalog/product/sizechart/',

    url: function() {
      if (this.attributes.requestParams.canvasId) {
        return this.urlRoot + this.attributes.requestParams.canvasId;
      }
    }

  });
  return SizeChartModel;
});
