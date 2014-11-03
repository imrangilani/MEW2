define([
  'views/baseView',
  'util/util',
  'util/orientation',
  'analytics/analyticsTrigger'
], function(BaseView, util, orientation, analytics) {
  'use strict';

  var VISIBLE_DURATION = 3000; // ms
  var LOCALSTORAGE_KEY = 'marketorialShown';

  var preventDefault = function(e) {
    e.preventDefault();
    return false;
  };

  var MarketorialView = BaseView.extend({
    init: function() {
      if (!this.hasBeenShown()) {
        this.showMarketorial();
      }

      this.listenTo(orientation, 'orientationchange', this.setHeights);
    },

    hasBeenShown: function() {
      return util.storage.retrieve(LOCALSTORAGE_KEY);
    },

    showMarketorial: function() {
      var view = this;

      view.$marketorial = $(TEMPLATE.marketorial());

      util.preloadImages(
        '/mew20/images/tutorial/tutorial_burger.svg',
        '/mew20/images/tutorial/tutorial_close.svg',
        '/mew20/images/tutorial/tutorial_arrow.svg',
        '/mew20/images/tutorial/tutorial_text.svg',
        '/mew20/images/tutorial/tutorial_welcome.svg'
      );

      view.$marketorial.find('#marketorial-close').one('click', function() {
        view.hideMarketorial();
      }).end()
      .find('#marketorial-inner').one('click', function() {
        view.hideMarketorial();
      });

      this.setHeights();

      view.$marketorial.appendTo('body');
      $('body').on('touchmove', preventDefault);

      // hide the marketorial after VISIBLE_DURATION miliseconds
      // setTimeout(function() {
      //   view.hideMarketorial();
      // }, VISIBLE_DURATION);

      util.storage.store(LOCALSTORAGE_KEY, 1);
      view.doAnalytics();
    },

    hideMarketorial: function() {
      var view = this;

      if (view.$marketorial) {
        this.stopListening( orientation);
        view.$marketorial.fadeOut(function() {
          view.$marketorial.remove();
          delete view.$marketorial;
          $('body').removeClass('marketorial-open').height('auto').off('touchmove', preventDefault);
        });
      }
    },

    setHeights: function() {
      var height = $(window).height();
      this.$marketorial.css('height', (height + 200)).find('#marketorial-inner').css('height', height);
      $('body').addClass('marketorial-open').height(height);
    },

    doAnalytics: function() {
      analytics.triggerTag({
        tagType:     'pageViewTag',
        categoryId:  'MARKETORIAL',
        pageId:      'MARKETORIAL_PAGE1'
      });
    }

  });

  return MarketorialView;
});