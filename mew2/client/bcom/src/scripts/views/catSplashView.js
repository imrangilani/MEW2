define([
  // Views
  'views/mainContentView',
  'views/_catSplashView',
  'views/admediaView',
  'views/productPoolView'
], function (MainContentView, CatSplashView, AdMediaView, ProductPoolView) {
  'use strict';

  var BCOMCatSplashView = CatSplashView.extend({
    poolMap: {
      2910:  'MEW2_CAT_BANNER_WOMEN',
      2911:  'MEW2_CAT_BANNER_CONTEMPORARY',
      16961: 'MEW2_CAT_BANNER_SHOES',
      16958: 'MEW2_CAT_BANNER_HANDBAGS',
      3376:  'MEW2_CAT_BANNER_JA',
      2921:  'MEW2_CAT_BANNER_BEAUTY',
      3864:  'MEW2_CAT_BANNER_MEN',
      3866:  'MEW2_CAT_BANNER_KIDS',
      3865:  'MEW2_CAT_BANNER_HOME',
      3977:  'MEW2_CAT_BANNER_SALE',
      13668: 'MEW2_CAT_BANNER_STYLEGUIDE',
      2917:  'MEW2_CAT_BANNER_PLUS',
      16975: 'MEW2_CAT_BANNER_FINE',
      3948:  'MEW2_CAT_BANNER_GIFTS'
    },

    renderTemplate: function() {
      this.renderSEOTags();
      this.$el.html(TEMPLATE.catSplash(this.model.attributes));
      //Cat splash template containt #m-ad-container that is used to render banners,
      //so it needs to be inserted before we initialize AdView
      var poolId = this.poolMap[this.model.attributes.category.id];
      if (poolId) {
        this.subViews.admediaView     = new AdMediaView( { el: '#b-ad-container', options: { poolId: poolId, swipable: true }});
      }
      this.subViews.productPoolView = new ProductPoolView({el: '#b-sp-product-pool', model: this.model });
      this.subViews.productPoolView.render();
    },

    renderSEOTags: function() {
      var seo = this.model.get('seo');
      if (seo) {
        var titleTag = seo.title;

        if(!titleTag) {
          titleTag = 'Designer ' + this.model.get('category').name + ' | Bloomingdales\'s';
        } else {
          titleTag += ' - Bloomingdale\'s';
        }
        this.setPageTitle(titleTag);
        this.setPageDesc(seo.desc);
      }
    }
  });

  return BCOMCatSplashView;

});
