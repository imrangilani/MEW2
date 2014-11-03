define([
  // Models
  'models/_admediaModel',

  // Views
  'views/mainContentView'
], function(AdMediaModel, MainContentView) {
  'use strict';

  //This view is initialized with pool id that is passed
  //from container view
  var ShopByCategoryView = MainContentView.extend({
    init: function() {
      this.model = new AdMediaModel({ id: this.options.poolId });
      this.listenTo(this.model, 'modelready', this.render);
    },

    renderTemplate: function() {
      // We are supposed to have only one pool per id, so we get the first one
      var pools = this.model.get('pools');

      if (pools){
        var categoriesPool = pools[0];
        this.$el.html(TEMPLATE.shopByCategory(categoriesPool));
        $('img.m-shop-category-img').bind('error', function() {
          $(this).closest('m-shop-category').remove();
        });
      }
    },

    //TO DO: call this method from parent view when it is destroyed
    close: function() {
      $('img.m-shop-category-img').unbind('error');
    }
  });

  return ShopByCategoryView;
});
