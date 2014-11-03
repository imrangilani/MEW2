define([
  'views/shopByCategoryView'
], function(ShopByCategoryView) {
  'use strict';

  var handler = {
    name: 'shopByCategory',
    paths: ['shop/shop-by-category?id=63482(*moreQuery)'],
    requiredParams: ['id'],

    hooks: {
      preValidate: function(data) {
        data.poolId = 'MEW2_HP_CATS';
      }
    },

    view: {
      getMenuId: function(data) {
        return data.id;
      },

      ViewConstructor: ShopByCategoryView
    }
  };

  return handler;

});