define([
  'views/productView'
], function(ProductView) {
  'use strict';

  var handler = {
    name: 'product',
    paths: ['shop/product(/)', 'shop/product(/:productName)'],
    requiredParams: ['id'],
    optionalParams: ['categoryid', 'extra_parameter', 'upc_id', 'seqno', 'quantity', 'initial'],

    view: {
      getMenuId: function(data) {
        return data.categoryid;
      },

      ViewConstructor: ProductView
    }
  };

  return handler;
});