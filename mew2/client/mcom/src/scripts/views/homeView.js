define([
  // Libraries
  'jquery',
  'underscore',
  'backbone',

  // Views
  'views/mainContentView',
  'views/_homeView',
  'views/admediaView',
  'views/categoryListView',

  // Utils
  'analytics/analyticsTrigger',
  'util/BTDataDictionary'
], function($, _, Backbone, MainContentView, HomeView, AdMediaView, CategoryListView, analytics, BTDataDictionary) {

  'use strict';

  var MCOMHomeView = HomeView.extend({
    init: function() {
      this.setPageTitle('Macy\'s - Shop Fashion Clothing & Accessories - Official Site - Macys.com');
      this.setPageDesc('Macy\'s - FREE Shipping at Macys.com. Macy\'s has the latest fashion brands on Women\'s and Men\'s Clothing, Accessories, Jewelry, Beauty, Shoes and Home Products.');

      this.render();

      this.setCMPageId('Macy*s(xx-xx-xx-xx.index)');
    },

    postRender: function() {
      this.subViews.admediaView = new AdMediaView({
        el: '#m-ad-container',
        options: {
          poolId: 'MEW2_HP_MB',
          cmPageName: 'homepage'
        }
      });
      // this.subViews.categoriesView = new CategoryListView({
      //   el: '#m-catlist',
      //   options: {
      //     poolId: 'MEW2_HP_CATS',
      //     cmPageName: 'homepage'
      //   }
      // });

      //Reset search flow
      this.setCMSearchContext(null);

      HomeView.prototype.postRender.apply(this);

      this.doAnalytics();
    },

    defineBTDataDictionary: function(){
      BTDataDictionary.setNavigation( 'Macy*s(xx-xx-xx-xx.index)', 'xx-xx-xx-xx.index', '');
    },

    doAnalytics: function() {
      analytics.triggerTag({
        tagType:     'techPropertiesTag',
        categoryId:  'xx-xx-xx-xx.index',
        pageId:      'Macy*s(xx-xx-xx-xx.index)'
      });
    }
  });

  return MCOMHomeView;

});
