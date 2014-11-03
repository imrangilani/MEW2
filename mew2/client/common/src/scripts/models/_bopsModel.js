define([
  'models/baseModel',
  'util/util'
], function(BaseModel) {
  'use strict';

  return BaseModel.extend({
    urlRoot: '/api/v4/catalog/bops',

    defaults: function() {
      return {
        id: 0
      };
    }
  });
});
