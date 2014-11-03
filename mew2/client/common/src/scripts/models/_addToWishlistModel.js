define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  return BaseModel.extend({
    urlRoot: '/api/v1/wishlist'
  });
});
