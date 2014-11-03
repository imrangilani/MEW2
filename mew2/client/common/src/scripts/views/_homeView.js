define([
  // Views
  'views/mainContentView'
], function (MainContentView) {

  'use strict';

  var homeView = MainContentView.extend({

    init: function () {
      this.render();
    },

    viewName: 'home',

    renderTemplate: function () {
      this.$el.html(TEMPLATE.home());
    },

    postRender: function() {
      MainContentView.prototype.postRender.apply(this);
    }

  });

  return homeView;

});
