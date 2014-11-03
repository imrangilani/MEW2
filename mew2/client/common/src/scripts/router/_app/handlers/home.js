define([
  'views/homeView'
], function(HomeView) {
  'use strict';

  var handler = {
    name: 'home',
    paths: ['', 'index.ognc'],

    view: {
      getMainContentView: function() {
        if (this.currentMainContentView instanceof HomeView) {
          return this.currentMainContentView;
        }

        return new HomeView();
      }
    }
  };

  return handler;
});