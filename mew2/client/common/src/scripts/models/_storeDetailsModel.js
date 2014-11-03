define([
  'models/baseModel',
  'models/storeResultsModel'
], function(BaseModel, StoreResultsModel) {
  'use strict';

  var StoreDetailsModel = BaseModel.extend({
    urlRoot: '/api/v2/store/focusdetail',

    defaults: {
      locnbr: '',
      storeid: ''
    },

    url: function() {
      if (this.attributes.locnbr) {
        return this.urlRoot + '?locnbr=' + this.attributes.locnbr + '&show=events';
      } else if (this.attributes.storeid) {
        return this.urlRoot + '?storeid=' + this.attributes.storeid + '&show=events';
      }

      return this.urlRoot;
    },

    parse: function(store) {
      store.timezoneOffset = StoreResultsModel.prototype.getTimezoneOffset.call(this, store);
      store.isOpenNow = StoreResultsModel.prototype.isOpenNow.call(this, store);
      return store;
    }

  });

  return StoreDetailsModel;
});
