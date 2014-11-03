define([
  // Views
  'views/modalView',

  // Utils
  'util/localstorage'
], function (ModalView, $localStorage) {
  'use strict';

  var isCategoryNameRendered = false;

  var ProductSizeChartModalView = ModalView.extend({
    className: 'mb-modal-wrapper modal-level-1',

    renderTemplate: function () {
      this.$el.html(TEMPLATE.productSizeChartModal({ sizeCharts : this.options.sizeCharts }));
    },

    postRender: function () {

      if ($localStorage.get('gn:categoryIndexLoaded')) {
        this.renderCategoryName();
      } else {
        this.listenTo(Backbone, 'categoryIndexLoaded', this.renderCategoryName);
        this.listenTo(Backbone, 'gn:first2levelsLoaded', this.renderCategoryName);
      }
    },

    renderCategoryName: function () {

      var categoryNameObject, name;

      if (this.options.categoryId) {

        if (!isCategoryNameRendered) {
          categoryNameObject = App.model.get('categoryIndex').menus[this.options.categoryId];
          if (_.isUndefined(categoryNameObject)) {
            isCategoryNameRendered = false;
          } else {
            name = categoryNameObject.name;
            this.$el.find('.m-size-chart-category').html(name);
            isCategoryNameRendered = true;
          }

        }
      }
    }
  });

  return ProductSizeChartModalView;
});
