define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  return BaseModel.extend({
    url: function() {
      return '/api/catalog/product/recently-viewed/v4?productIds=' + this.attributes.products.join(',');
    }
  });
});
