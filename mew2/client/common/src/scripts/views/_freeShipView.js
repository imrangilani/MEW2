define([
  'views/mainContentView',
  'views/shopCategoriesPanelView'
], function(mainContentView, ShopCategoriesPanelView) {
  'use strict';

  var freeShipView = mainContentView.extend({

    init: function() {
      this.render();
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.freeShip());
      this.subViews.shopCategoriesView = new ShopCategoriesPanelView({
        el: '#m-freeship-shop-categories',
        options: {
          poolId: 'MEW2_HP_CATS'
        }
      });
    }
  });

  return freeShipView;
});
