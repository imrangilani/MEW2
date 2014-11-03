define([
  'views/storesView',
  'router/_app/_handlerHelpers'
], function(StoresView, helpers) {
  'use strict';

  var handler = {
    name: 'stores',
    paths: ['shop/store/search(?*query)'],
    optionalParams: ['location', 'reference', 'nearby', 'display'],

    hooks: {
      preValidate: [
        function(data) {
          return helpers.checkFeature('store_pages');
        },

        function(data) {
          _.extend(data, { pageid: 'stores' });
        }
      ]
    },

    view: {
      getMenuId: function(data) {
        return data.pageid;
      },

      ViewConstructor: StoresView
    }
  };

  return handler;
});
