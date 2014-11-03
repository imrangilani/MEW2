//Mcom-specific global events
define([
  // Views
  'views/_globalEventsView',
  'views/navView',
  'util/util',

  // Analytics
  'analytics/analyticsTrigger',
  'analytics/analyticsData',
  // Util
  'url-parser'
], function(GlobalEventsView, NavView, util, analytics, analyticsData) {
  'use strict';

  var globalEventsView = GlobalEventsView.extend({
    events: _.extend(_.clone(GlobalEventsView.prototype.events) || {}, {
      //Global handler that will send LinkClick Coremetrics tag for any href
      //that has m-j-cm-link class
      //The page should set CMpageId set when it is initialized through analyticsData
      'click .m-j-cm-link': 'doLinkAnalytics',
      //Handles clicks that don't have hrefs on elements
      'click .m-j-cm-manual-link': 'doManualLinkAnalytics',
      //This class is set for the top-level global nav items
      //based on parameter passed from the mcom_config.js data menu
      'click #mb-j-nav-menu .m-j-cm-element': 'doElementAnalytics',
      // comment out to see if it causes //'focus input': 'iOSFixedSelect',
      // any unexpected issues //'focus select': 'iOSFixedSelect',
      'blur input': 'keyboardHidden'
    }),

    initialize: function() {
      NavView.registerMenuSelect(this.resetCMSearchContext);
      GlobalEventsView.prototype.initialize.apply(this, arguments);
    },
    resetCMSearchContext: function() {
      analyticsData.setCMSearchContext(null);
    },

    doLinkAnalytics: function(e) {
      var url = $.url(e.currentTarget.href);

      analytics.triggerTag({
        tagType: 'linkClickTag',
        urlTarget: url.attr('relative'),
        pageId: analyticsData.getCMPageId()
      });
    },

    doManualLinkAnalytics: function(e) {
      var cm_sp = $(e.currentTarget).data('cm-manual-link').toLowerCase();

      analytics.triggerTag({
        tagType: 'manualLinkClickTag',
        urlTarget: '/?cm_sp=' + encodeURIComponent(cm_sp),
        pageId: analyticsData.getCMPageId()
      });
    },

    doElementAnalytics: function(e) {
      var cmElementId = $(e.currentTarget).data('cm-element');

      if (cmElementId) {
        analytics.triggerTag({
          tagType: 'pageElementTopGNTag',
          elementId: cmElementId,
          elementCategory: 'GLOBAL_NAVIGATION'
        });
      }
    },

    iOSFixedSelect: function(e) {
      util.keyboardIsShown = true;
      var $window = $(window),
          initialScroll = $window.scrollTop();

      if (util.isiOS() && $(e.currentTarget).parent('.m-header-container')) {
        setTimeout(function() {
          $window.scrollTop($window.scrollTop() + (initialScroll - $window.scrollTop()));
        }, 0);
      }
    },

    keyboardHidden: function() {
      util.keyboardIsShown = false;
    }
  });

  return globalEventsView;
});
