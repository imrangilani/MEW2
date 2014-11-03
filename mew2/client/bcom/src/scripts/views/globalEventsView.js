define([
  'util/util',

  // Views
  'views/_globalEventsView',
  'views/navView',

  // Analytics
  'analytics/bloomiesCoremetrics',
  'analytics/analyticsData',
  'jquery-hammerjs'

], function(util, GlobalEventsView, NavView, bloomiesCoremetrics, analyticsData) {
  'use strict';

  var preventDefaultHandler = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.stopPropagation();
    e.returnValue = false;

    return false;
  };

  var globalEventsView = GlobalEventsView.extend({
    events: _.extend(_.clone(GlobalEventsView.prototype.events) || {}, {
      // Global handler that will send LinkClick Coremetrics tag for any href
      'click    [data-cm-link-click]': 'doLinkAnalytics',

      // Popup links handler
      'click    a[href^="javascript:pop("]': 'openPopUp',

      // Global handler for expandable section components
      'click    [data-expandable="button"]': 'toggleExpandable',

      // Global handler for radio group component
      'click    .b-radio-group[data-toggle="buttons"] .b-radio': 'radioGroupClick',

      // Custom checkbox placeholder click handler
      'click    .b-checkbox > .b-checkbox-placeholder': 'triggerCustomCheckboxClick',

      'dragdown #mb-page-content-container': 'enableStickyHeader',
      'dragup   #mb-page-content-container': 'disableStickyHeader',
      'focus    #mb-j-search-field': 'enableAbsuloteHeader',
      'blur     #mb-j-search-field': 'disableAbsuloteHeader'
    }),

    initialize: function() {
      // Instantiate Hammer to watch for gestures
      this.$el.hammer();

      NavView.registerMenuSelect(this.resetCMAnalyticsContext);
      GlobalEventsView.prototype.initialize.apply(this, arguments);
    },

    toggleExpandable: function(e) {
      var $button = $(e.currentTarget),
          $container = $button.closest('[data-expandable="container"]'),
          $content = $container.find('[data-expandable="content"]');

      if ($container.length === 0 || $content.length === 0) {
        return;
      }

      $container.toggleClass('b-expandable-closed');
      $content.animate({
        height: 'toggle'
      });
    },

    radioGroupClick: function(e) {
      var $target = $(e.currentTarget);
      var $container = $target.closest('.b-radio-group');

      $container.find('.b-radio').each(function() {
        $(this).removeClass('active');
      });

      $target.addClass('active');
    },

    triggerCustomCheckboxClick: function(e) {
      var $checkbox = $(e.currentTarget).parent().find('input[type=checkbox]').eq(0);
      $(e.currentTarget).toggleClass('checked', !$checkbox.is(':checked'));
      if (!$checkbox.is(':disabled')) {
        $checkbox.prop('checked', !$checkbox.is(':checked'));
      }
    },

    resetCMAnalyticsContext: function() {
      analyticsData.setCMSearchContext(undefined);
      analyticsData.setCMProductSelectionContext(undefined);
      analyticsData.setCMProductSelectionPosition(undefined);
      analyticsData.setCMBrowseContext(undefined);
      analyticsData.setCMShopByBrandFlow(undefined);
    },

    doLinkAnalytics: function (e) {
      var $elem = $(e.currentTarget),
          href =  $elem.attr('href') || window.document.location.href;

      bloomiesCoremetrics.cmCreateManualLinkClickTag(href);
    },

    openPopUp: function(e) {
      var href = $(e.currentTarget).attr('href');
      var hrefParamsString = href.match(/pop\(([^)]+)\)/)[1];
      var paramsMatcher = /\'([^\']+)\'/g;
      var paramMatch;
      var params = [];

      while (paramMatch = paramsMatcher.exec(hrefParamsString)) {
        params.push(paramMatch[1]);
      }

      // If there's no `windowsName` (only URL)
      if (params.length === 1) {
        params.push('default');
      }

      // If there's no `windowFeatures`
      if (params.length === 2) {
        params.push('directories,location,menubar,resizable,scrollbars,status,toolbar');
      }

      var popup = window.open(params[0], params[1], params[2]);
      popup.focus();

      e.preventDefault();
    },

    scrollTop: _.throttle(function(top, duration) {
      duration = duration || 1;

      setTimeout(function() {
        $('html, body').animate({ scrollTop: top }, duration);
      }, 1);
    }, 200),

    enableStickyHeader: _.throttle(function() {
        $('#mb-page-wrapper').not('.b-sticky-header').addClass('b-sticky-header');
    }, 300),

    disableStickyHeader: _.throttle(function() {
      if (!$('body').hasClass('nav-toggle')) {
        $('#mb-page-wrapper.b-sticky-header')
          .not('.b-header-active')
          .removeClass('b-sticky-header');
      }
    }, 300),

    enableAbsuloteHeader: function(e) {
      if (!util.isiOS()) {
        return;
      }

      var $pageWrapper = $('#mb-page-wrapper').not('.b-header-active');
      var $header = $pageWrapper.find('#mb-region-header');
      var $searchField = $(e.currentTarget);
      var headerOffset;
      var self = this;

      if ($pageWrapper.length === 0) {
        return;
      }

      headerOffset = $header.offset();

      if (!util.isiOS8()) {
        $pageWrapper.addClass('b-absolute-header');
      }

      $header.css('top', headerOffset.top);
      $header.addClass('b-header-active');

      this.scrollTop(headerOffset.top, 250);

      this.scrollTopHandler = _.throttle(function(e) {
        self.scrollTop(headerOffset.top, 1);
        return preventDefaultHandler(e);
      }, 200);


      $(window).on('scroll', this.scrollTopHandler);
      $pageWrapper.on('touchmove', preventDefaultHandler);
      $pageWrapper.on('mousewheel', preventDefaultHandler);
    },

    disableAbsuloteHeader: function(e) {
      if (!util.isiOS()) {
        return;
      }

      var $pageWrapper = $('#mb-page-wrapper');
      var $header = $pageWrapper.find('#mb-region-header');
      var headerTop;

      if ($pageWrapper.length === 0) {
        return;
      }

      headerTop = parseInt($header.css('top').toString().replace(/\D/g, ''), 10);

      $pageWrapper.removeClass('b-absolute-header');
      $pageWrapper.removeClass('b-header-active');
      $header.css('top', '');

      setTimeout(function() {
        $('html, body').animate({ scrollTop: headerTop }, 250);
      }, 1);

      $(window).off('scroll', this.scrollTopHandler);
      $pageWrapper.off('touchmove', preventDefaultHandler);
      $pageWrapper.off('mousewheel', preventDefaultHandler);
    }

  });

  return globalEventsView;
});
