define([
  'models/baseModel'
], function(BaseModel) {

  'use strict';

  var AdMediaModel = BaseModel.extend({
    serviceurl: '/api/v3/marketmedia/global?poolName=',

    isStoredInLocalStorage: true,

    // 2 hours
    dataLifeSpan: (1000 * 60) * 60 * 2,

    getKey: function() {
      return $.url().attr('host') + '_media_' + this.get('id');
    },

    initialize: function() {
      //Use this.options.categoryId to map to pool id
      this.url = this.serviceurl + this.id;

      this.fetch();
    },

    parse: function(response) {
      var items = (response.pools[0]) ? response.pools[0].items : response.pools[0];
      if (items) {
        for (var i = 0, len = items.length; i < len; i++) {
          items[i].seq = i;
        }
      }
      return response;
    }
  });

  return AdMediaModel;
});
