define([
  // Views
  'views/baseView',
  'models/productRecommendationsModel'

], function(BaseView, ProductRecommendationsModel) {
  'use strict';

  var productRecommendationsView = BaseView.extend({

    el: '#mb-j-product-recommendations-container',

    init: function(productModel) {
      var productId   = productModel.id,
          productName = productModel.get('name'),
          categoryId  = productModel.get('activeCategory');

      this.model = new ProductRecommendationsModel({
        productId: productId,
        productName: productName,
        categoryId: categoryId
      });
      this.listenTo(this.model, 'modelready' , this.render);
      this.model.set('errorHandler', 'ignoreAll');
      this.model.fetch();
    },

    renderTemplate: function() {
      this.recommendedProducts = this.model.get('recommendedproducts');
      if (this.recommendedProducts) {
        this.$el.html(TEMPLATE.productRecommendations(this.model.attributes));
      }
    }

  });

  return productRecommendationsView;
});
