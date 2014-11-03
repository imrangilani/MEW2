define([
  'jquery',
  'analytics/analyticsData',
  // Views
  'views/baseView'
], function ($, analyticsData, BaseView) {

  'use strict';

  //This view is initialized with pool id that is passed
  //from container view
  var productPoolView = BaseView.extend({
    events: {
      'click #m-product-pool-container': 'setCMPoolContext'
    },

    preparePools: function(pools) {
      var category = this.model.get('category');
      var poolDisplayed, pageType = category.pageType ? category.pageType:category.type;

      switch (pageType) {
      case 'Category Splash':
        poolDisplayed = pools.slice(0, 1);
        this.setCMURLParameters(poolDisplayed[0]);
        break;

      case 'Browse':
        poolDisplayed = pools.slice(0, 1);
        poolDisplayed[0].products = _.first(poolDisplayed[0].products, 8);
        poolDisplayed[0].shopall = false;
        this.setCMURLParameters(poolDisplayed[0]);
        break;

      case 'Sub Splash':

        if (category.type === 'Flexible Template') {
          $('#m-product-pool').hide();
        }

        break;

      }

      return poolDisplayed;

    },

    render: function () {

      var poolDisplayed, pools, html;

      //We are supposed to have only one pool per id, so we get the first one
      pools = this.model.attributes.productpool;
      if (!_.isEmpty(pools)) {
        poolDisplayed = this.preparePools(pools);
        html = TEMPLATE.productPool(poolDisplayed);
        this.$el.html(html);
        this.$el.find('.truncated').dotdotdot();
      }
    },

    setCMURLParameters: function(pool) {
      var category, coremetricsParamters;

      category = this.model.get('category');
      coremetricsParamters = '&cm_sp=mew_us_cat'.concat(category.pageId).concat('-_-n-_-product_pool_').concat(encodeURIComponent(pool.poolname));
      coremetricsParamters = coremetricsParamters.toLowerCase();

      //set the parameter on each product URL for the coremetrics
      _.each(pool.products, function (product) {
        product.productURL = product.productURL.concat(coremetricsParamters);
      });

      //set the parameter on shopall URL for the coremetrics
      if (!_.isEmpty(pool.shopall)) {
        coremetricsParamters = '&cm_sp=mew_us_cat'.concat(category.pageId).concat('-_-n-_-shop_all_').concat(encodeURIComponent(pool.poolname));
        coremetricsParamters = coremetricsParamters.toLowerCase();
        pool.shopall = pool.shopall.concat(coremetricsParamters);
      }

    },

    setCMPoolContext: function(){
      var context = {};
      context[24] = this.model.get('category').pageId;
      context[26] = 'product-pool:' + this.model.attributes.productpool[0].poolname;
      analyticsData.setCMProductSelectionContext( context);
      analyticsData.setCMBrowseContext(undefined);
      analyticsData.setCMSearchContext(undefined);
      analyticsData.setCMProductSelectionPosition(undefined);
    }

  });

  return productPoolView;
});
