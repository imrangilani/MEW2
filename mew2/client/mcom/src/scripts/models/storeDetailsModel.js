define([
  'models/_storeDetailsModel',
  'util/spinner'
], function(StoreDetailsModel, Spinner) {
  'use strict';

  var MCOMStoreDetailsModel = StoreDetailsModel.extend({

    // expected by Spinner.Model
    container: '#mb-j-content-container'
  });

  // Show spinner while content is loading
  _.extend(MCOMStoreDetailsModel.prototype, Spinner.Model);

  return MCOMStoreDetailsModel;
});
