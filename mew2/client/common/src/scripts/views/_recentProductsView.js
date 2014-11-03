define([
  'collections/recentProductsCollection',
  'views/baseView'
], function(RecentProductsCollection, BaseView) {
  'use strict';
  var collection;

  var recentProductsView = BaseView.extend({
    el: '#mb-product-recently-viewed',

    init: function() {
      this.collection = collection;

      // Create a single instance of the collection, regardless of how many times the view is initialized
      if (!collection) {
        this.collection = collection = new RecentProductsCollection();
      }

      // Render the view only after the collection triggers 'dataRefresh' (it might need to fetch data first)
      this.listenTo(this.collection, 'dataRefresh', function() {
        if (this.collection.models.length) {
          this.render();
        }
      });
      // Let the collection fetch fresh product data from the server if needed
      this.collection.fetch();
    },

    renderTemplate: function() {
      // Don't show more products than the maximum specified by the brand's configuration
      var max = App.config.pdp.recentlyViewedCount;

      if (!this.collection.hasId(this.options.currentProduct) && this.collection.length > max) {
        this.collection.trimCollection(max);    //if the current product is not in, the maximum is max
      } else if (this.collection.hasId(this.options.currentProduct)) {
        this.collection.trimCollection(max + 1);  //if the current product is in, let it be there.
      }

      if (this.collection.length > 1 || !this.collection.hasId(this.options.currentProduct)) {
        this.$el.html(TEMPLATE.recentProducts({ collection: this.collection, currentProduct: this.options.currentProduct }));
      }
    }
  });

  return recentProductsView;
});
