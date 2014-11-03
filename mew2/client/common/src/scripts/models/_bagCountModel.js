/**
 * @file _bagCountModel.js
 */

define([
  'models/baseModel'
], function(BaseModel) {
  'use strict';

  return BaseModel.extend({
    urlRoot: '/api/v2/shoppingbag/bagItemCount',
    initialize: function() {
      this.listenTo(this, 'modelready', this.setBagCount);
    },
    url: function() {
      var userId = this.attributes.userId;
      return this.urlRoot + '?userid=' + userId;
    },
    setBagCount: function() {
      //Setting this value will trigger UI bag count update
      var count = 0;

      if (this.attributes.shoppingbag) {
        count = this.attributes.shoppingbag.bagItemsCount || 0;
      }

      this.set('bagItemsCount', count);
    }
  });
});
