define([
  // Utilities
  'util/util',

  // Views
  'views/baseView',
  'views/bagCountView'
], function(utils, BaseView, BagCountView) {

  'use strict';

  var HeaderView = BaseView.extend({

    el: '#mb-j-header-container',

    init: function() {
      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.header({ numBagItems: utils.getCookie('numBagItems') }));
    },

    postRender: function() {
      this.subViews.bagCountView = new BagCountView();
    }

  });

  return HeaderView;

});
