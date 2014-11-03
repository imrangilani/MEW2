/**
 * This handler is used for all the legacy deep-linked store details url's
 */
define([
], function() {
  'use strict';

  var handler = {
    name: 'legacyStoreDetails',
    paths: ['store/index.ognc(?*query)', 'store/event/index.ognc(?*query)'],
    optionalParams: ['storeid'],

    hooks: {
      preValidate: function(data) {
        if (data.storeid) {
          this.navigate('/shop/store/detail?storeId=' + data.storeid, { replace: true, trigger: true });
          return false;
        }

        this.navigate('/shop/store/search', { replace: true, trigger: true });
        return false;
      }
    }
  };

  return handler;
});