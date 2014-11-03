define([
  'collections/_recentProductsCollection'
], function(RecentProductsCollection) {
  'use strict';

  var delimiter = '*++';

  var BCOMRecentProductsCollection = RecentProductsCollection.extend({
    cookieName: 'prev_view',

    /**
     * Format array of ids to be written in the cookie.
     * Receives an array and returns a string
     */
    _formatIdsToCookie: function(ids) {
      var cookieValue = ids.join(delimiter);
      if (ids.length > 0) {
        cookieValue += '*';
      }
      return cookieValue;
    },

    /**
     * Get array of ids from cookie string
     * Receives a string and returns an array
     */
    _getIdsFromCookie: function(cookieValue) {
      var ids = cookieValue.split(delimiter);

      // avoid unwanted characters
      ids = _.map(ids, function(id) {
        return parseInt(id);
      });

      return ids;
    },

    /**
     * Overwrite the shared cookie with whatever recently viewed products exist
     */
    writeCookie: function() {
      var productIds = _.pluck(this.models, 'id');

      if (_.isUndefined(this.cookieName)) {
        return this;
      }
      if (productIds) {
        // add / update the cookie
        var cookieValue = this._formatIdsToCookie(productIds);

        // write cookie
        if (this.cookieExpires !== false) {
          $.cookie(this.cookieName, cookieValue, { expires: this.cookieExpires });
        } else {
          $.cookie(this.cookieName, cookieValue);
        }
      }
      return this;
    }
  });
  return BCOMRecentProductsCollection;
});
