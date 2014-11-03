define([
  'handlebars',
  'util/dataMap',
  // Models
  'models/brandIndexModel',

  // Views
  'views/_brandIndexView',

  // Analytics
  'analytics/analyticsTrigger',
  'analytics/analyticsData'
], function(Handlebars, DataMap, BrandIndexModel, BrandIndexView, analytics, analyticsData) {
  'use strict';

  var fobMap = {
    1001337: 'WOMEN',
    1001338: 'MEN',
    1001339: 'SHOES',
    1001340: 'HANDBAGS',
    1001341: 'BEAUTY',
    1001342: 'JEWELRY & ACCESSORIES',
    1001343: 'KIDS',
    1001344: 'HOME',
    1001351: 'ALL DESIGNERS'
  };

  var BCOMBrandIndexView = BrandIndexView.extend({
    events: {
      // When the page number changed, trigger new request
      'change select#b-designers-fob-list': 'loadDesigners',
      'click .b-j-designer-link': 'scrollToTop',
      'click div.b-back-to-top': 'scrollToTop'
    },

    init: function() {
      this.dataMap = new DataMap({
        id: 'id'
      });

      this.model = new BrandIndexModel({ requestParams: this.dataMap.toWssg(this.options) });
      this.listenTo(this.model, 'modelready', this.render);
      if (App.model.has('categoryIndex')){
        this.model.fetch();
      } else {
        this.listenTo(Backbone, 'categoryIndexLoaded', function(){
          this.model.fetch();
        });
      }
      analyticsData.setCMShopByBrandFlow(true);
    },

    renderTemplate: function() {
      this.$el.html(TEMPLATE.brandIndex(this.model.attributes));
      var categoryName = fobMap[this.model.attributes.requestParams.id];
      $(this.el).find('#b-designer-index-dropdown').html(TEMPLATE.allDesignersDropdown({'categoryName' : categoryName}));
    },

    postRender: function() {
      var categoryId = this.options.id;
      analytics.triggerTag({
        tagType: 'pageViewTag',
        pageId: 'MBL: DESIGNER_INDEX_' + fobMap[categoryId],
        categoryId: categoryId
      });
    },

    loadDesigners: function() {
      var fobUrl = $('#b-designers-fob-list').val();
      App.router.navigate(fobUrl, { trigger: true });
    }
  });

  return BCOMBrandIndexView;
});
