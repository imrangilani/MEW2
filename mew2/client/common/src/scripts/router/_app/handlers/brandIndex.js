define([
  'views/brandIndexView'
], function(BrandIndexView) {
  'use strict';

  var handler = {
    name: 'brandIndex',
    paths: [
      'shop/all-designers(/:categoryName)',
      'shop/all-designers:categoryString',
      'shop/all-brands/:categoryString'
    ],
    requiredParams: ['id'],

    view: {
      getMenuId: function(data) {
        return data.id;
      },

      ViewConstructor: BrandIndexView
    }
  };

  return handler;
});