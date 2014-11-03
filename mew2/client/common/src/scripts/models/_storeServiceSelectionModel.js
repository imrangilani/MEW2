
define([
  'models/baseModel'
], function (BaseModel) {
  'use strict';

  var StoreServiceSelectionModel = BaseModel.extend({
    defaults: {
      selectedValues: []
    }
  });

  return StoreServiceSelectionModel;
});
