define([
  'util/multiValueCookie',
  'collections/_recentProductsCollection'
], function(mvCookie, RecentProductsCollection) {
  'use strict';
  var subKey    = 'rvi';

  var MCOMRecentProductsCollection = RecentProductsCollection.extend({
    cookieName: 'MISCGCs',

    formatIdsToCookie: function(ids) {
      return ids.join(',');
    },

    readCookie: function() {
      var cookieValue = mvCookie.get(subKey, this.cookieName);

      if (cookieValue) {
        var ids = cookieValue.split(',');

        ids.forEach(function(productId) {
          this.add({ id: +productId });
        }.bind(this));
      }
      return this;
    },

    writeCookie: function() {
      var productIds = this.pluck('id');
      if (productIds) {
        var cookieValue = this.formatIdsToCookie(productIds);
        mvCookie.set(subKey, cookieValue, this.cookieName);
      }
      return this;
    }

  });
  return MCOMRecentProductsCollection;
});
