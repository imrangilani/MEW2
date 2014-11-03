define([
  'views/homeView',
  'views/errorView'
], function(HomeView, ErrorView) {
  'use strict';

  var handler = {
    name: 'shop',
    paths: ['shop'],

    hooks: {
      preValidate: function(data) {
        data = { pageid: 'shop' };
      }
    },

    view: {
      getMenuId: function(data) {
        return data.pageid;
      },

      getMainContentView: function() {
        if (this.currentMainContentView && !(this.currentMainContentView instanceof ErrorView)) {
          return this.currentMainContentView;
        }

        return new HomeView();
      }
    }
  };

  return handler;
});