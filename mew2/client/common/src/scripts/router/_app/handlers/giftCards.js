define([
  'views/giftCardsView'
], function(GiftCardsView) {
  'use strict';

  var handler = {
    name: 'giftCards',
    paths: ['shop/gift-cards?id=1405(*moreQuery)'],
    requiredParams: ['id'],

    view: {
      getMenuId: function(data) {
        return data.id;
      },

      ViewConstructor: GiftCardsView
    }
  };

  return handler;
});