define([
  'jquery',
  'underscore',
  'backbone',
  'views/mainContentView',
  'views/_homeView',
  'views/admediaView',
  'analytics/analyticsData',
  'analytics/analyticsTrigger',
  'util/BTDataDictionary'
], function($, _, Backbone, MainContentView, HomeView, AdMediaView, analyticsData, analytics, BTDataDictionary) {

  'use strict';

  var BCOMHomeView = HomeView.extend({
    events: {
      'click ul#b-hp-footer-store-promotions li': 'fireCoremetrics',
      'click div.b-j-banners-list .b-banner-img-wrapper' : 'fireCoremetrics'
    },

    init: function () {
      analyticsData.setCMPageId('HOMEPAGE');

      this.setPageTitle('Shop Bloomingdale\'s | Designer Dresses, Clothes, Shoes, Handbags, Cosmetics, Home and More');
      this.setPageDesc('Free Shipping & Free Returns for Loyallists or Any Order Over $150! Exclusions apply. Shop Bloomingdale\'s top designers including Tory Burch, Burberry and more.');

      this.render();
    },

    postRender: function () {
      this.subViews.admediaView = new AdMediaView({
        el: '#b-hp-ad-container',
        options: {
          poolId: 'MEW2_HP_PROMOS', swipable: false
        }
      });
      HomeView.prototype.postRender.apply(this);
      this.doAnalytics();
    },

    doAnalytics: function () {
      analytics.triggerTag({
        tagType:     'techPropertiesTag',
        categoryId:  'MEW2.0',
        pageId:      'HOMEPAGE'
      });
    },

    fireCoremetrics: function(e) {
      var target = e.currentTarget.id,
          bannerPosition = $(e.currentTarget).data('banner-position') + 1,
          eId = 'Ad Position ' + bannerPosition,
          eCat = eId;

      if (target === 'b-hp-footer-promotions') {
        eId = eCat = 'Sales and Offers';
      } else if (target === 'b-hp-footer-store') {
        eId = eCat = 'Find A Store';
      }

      analytics.triggerTag({
        tagType: 'pageElementTag',
        elementId: eId,
        elementCategory: eCat
      });
    }

  });

  return BCOMHomeView;
});
