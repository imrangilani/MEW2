/**
 * This handler is used for all the legacy deep-linked store url's
 */
define([
], function() {
  'use strict';

  var handler = {
    name: 'legacyStores',
    paths: ['shop/store', 'shop/store/eventsearch'],
    optionalParams: ['storelocno', 'locno'],

    hooks: {
      preValidate: function(data) {
        if (this.currentRoute.$url.segment(3) === 'eventsearch') {
          var locationNumber = data.storelocno || data.locno;

          if (locationNumber) {
            this.navigate('/shop/store/detail?locNo=' + locationNumber, { replace: true, trigger: true });
            return false;
          }
        }

        // Empty location number leads to store landing page
        this.navigate('/shop/store/search', { trigger: true, replace: true });
        return false;
      }
    }
  };

  return handler;
});