define([
  'views/storeDetailsView',
  'router/_app/_handlerHelpers'
], function(StoreDetailsView, helpers) {
  'use strict';

  var handler = {
    name: 'storeDetails',
    paths: ['shop/store/detail(?locNo=*locno)'],
    requiredParams: ['locno'],
    optionalParams: ['storeid'],

    hooks: {
      preValidate: [
        function(data) {
          return helpers.checkFeature('store_pages');
        },

        function(data) {
          data.pageid = 'stores';

          // Set locno to "legacy" so validation against requiredKeys will pass - handled by view
          if (!data.locno && data.storeid) {
            data.locno = 'legacy';
          }
        }
      ]
    },

    view: {
      getMenuId: function(data) {
        return data.id;
      },

      ViewConstructor: StoreDetailsView
    }
  };

  return handler;
});
