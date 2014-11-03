define([
  // Views
  'views/mainContentView',
  'views/_catSplashView',
  'views/adMediaStackedView',
  'views/productPoolView',
  // Util
  'analytics/analyticsTrigger',
  'util/BTDataDictionary',
  'foresee/foresee-trigger',
  'util/util'
], function (MainContentView, CatSplashView, AdMediaStackedView, ProductPoolView, analytics, BTDataDictionary, FSR) {

  'use strict';

  var MCOMCatSplashView = CatSplashView.extend({
    poolMap: {
      7498:  'MEW2_CS_DINING',
      29391: 'MEW2_CS_FURNITURE',
      25931: 'MEW2_CS_MATTRESSES',
      7495:  'MEW2_CS_BEDBATH',
      7497:  'MEW2_CS_KITCHEN',
      16905: 'MEW2_CS_RUGS',
      39267: 'MEW2_CS_LIGHTING',
      22672: 'MEW2_CS_HOME',
      23930: 'MEW2_CS_WATCHES',
      65:    'MEW2_CS_MENSSHOES',
      225:   'MEW2_CS_LINGERIE',
      3536:  'MEW2_CS_SALE',
      118:   'MEW2_CS_WOMEN',
      1:     'MEW2_CS_MEN',
      16904: 'MEW2_CS_JUNIORS',
      5991:  'MEW2_CS_KIDS',
      32147: 'MEW2_CS_PLUS',
      18579: 'MEW2_CS_PETITE',
      669:   'MEW2_CS_BEAUTY',
      13247: 'MEW2_CS_SHOES',
      26846: 'MEW2_CS_ACCESSORIES',
      544:   'MEW2_CS_JEWELRY',
      16908: 'MEW2_CS_LUGGAGE'
    },

    pageName: 'catsplash',
    events:  {
      'click #m-browse-results-list': 'setCMProductPosition'
    },
    renderTemplate: function() {
      this.setPageTitle(this.model.get('seo').title);
      this.setPageDesc(this.model.get('seo').desc);
      this.$el.html(TEMPLATE.catSplash(this.model.attributes));

      // Adding Foresee calls
      // Since Foresee is based on number of page views and our app is a single view app, we call
      // manually FSR.run() to increase the page view number. As soon as it reaches out the 2, the
      // Foresse survery pops out.
      FSR.run();
    },

    postRender: function() {
      MainContentView.prototype.postRender.apply(this);

      var category = this.model.get('category');
      this.setCMPageId(category.pageId);

      //Cat splash template contains #m-ad-container that is used to render banners,
      //so it needs to be inserted before we initialize AdView
      var poolId = this.poolMap[this.model.attributes.category.id];

      if (!poolId && this.model.get('category').parentCatId) {
        poolId = this.poolMap[this.model.get('category').parentCatId];
      }

      if (poolId) {
        this.subViews.admediaView = new AdMediaStackedView(
          { el: '#m-ad-container',
            options: {
              poolId:     poolId,
              cmPageName: this.pageName,
              cmBreadcrumb: this.model.attributes.category.pageId
            }
         });
      }
      //this.subViews.productPoolView = new ProductPoolView({ el: '#m-product-pool', model: this.model });
      //this.subViews.productPoolView.render();

      this.setCMPageId(this.model.attributes.category.pageId);
      this.setCMPanelType('CATSPLASH');
      this.setCMProductSelectionPosition(undefined);
      this.doViewAnalytics();

    },

    defineBTDataDictionary: function() {
      CatSplashView.prototype.setBTDataDictionary.call(this);
    },

    setCMProductPosition: function(event){
      //This value will be used by CM on PDP
      var clickTarget = event.target;
      var pos = $(clickTarget).closest('li').data('position') + 1;
      this.setCMProductSelectionPosition(pos);
    },

    doViewAnalytics: function() {
      var category = this.model.get('category');
      var productpool = this.model.get('productpool');
      var poolname = '';

      if (!_.isEmpty(productpool)) {
        if (!_.isEmpty(productpool[0].products)) {
          poolname = productpool[0].poolname;
        }
      }

      if (!_.isEmpty(poolname)){
        poolname = 'product-pool: ' + poolname;
      }

      //Set for the case if user selects a product from a pool on this page
      this.setCMBrowseContext(null);

      var categoryId, keyword, keyword_ac, redirectType;
      var searchContext = this.getCMSearchContext();
      if( searchContext){

        categoryId = searchContext.type;
        redirectType = 'Splash Page';
        keyword = searchContext.keyword;
        keyword_ac = searchContext.keyword_ac;
        if( !searchContext.redirect){
          keyword = undefined;
          keyword_ac = undefined;
          redirectType = undefined;
        }
      }

      analytics.triggerTag({ tagType: 'pageViewTag',
                              pageId: category.pageId,
                              categoryId: categoryId ? categoryId : category.id,
                              searchString: keyword,
                              att9: redirectType,
                              att12: category.pageId,
                              att14: poolname,
                              att22: keyword_ac
                            });


      //We don't need this value anymore to be passed
      this.setCMSearchRedirect(false);
    }
  });

  return MCOMCatSplashView;

});
