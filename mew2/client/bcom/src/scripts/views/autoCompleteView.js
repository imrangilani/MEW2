define([
  // Views
  'views/_autoCompleteView',
  'analytics/analyticsData',

  // utils
  'util/util',
  'util/crossBrowserHeight'
], function(AutoCompleteView, analyticsData, util, crossBrowserHeight) {
  'use strict';

  var BCOMAutoCompleteView = AutoCompleteView.extend({

    events:  _.extend(_.clone(AutoCompleteView.prototype.events), {
      'touchstart': 'handleTouchStart',
      'touchmove': 'handleTouchMove'
    }),

    init: function() {
      AutoCompleteView.prototype.init.apply(this, arguments);

      if (util.isiOS()) {
        this.handleTouchEvent = true;
        this.$el.addClass('b-autocomplete-scrollable');
        this.$el.css('max-height', crossBrowserHeight.height() - $('#mb-region-header').height());
      }
    },

    getPointerEvent: function(e) {
      return e.originalEvent.targetTouches ? e.originalEvent.targetTouches[0] : e;
    },

    handleTouchStart: function(e) {
      if (!this.handleTouchEvent) {
        return;
      }

      this.touchStartData = {
        pageY: this.getPointerEvent(e).pageY,
        scrollTop: this.$el.scrollTop()
      };
    },

    handleTouchMove: function(e) {
      if (!this.handleTouchEvent) {
        return;
      }

      var touchStart = this.touchStartData;
      var pageY = this.getPointerEvent(e).pageY;

      // Avoid `flick` on iPhone when user try to scroll down the autocomplete results
      if ((touchStart.scrollTop === 0) && (touchStart.pageY < pageY)) {
        e.preventDefault();
      }

      e.stopPropagation();
    },

    saveAutocompleteString: function(event) {
      var $item = $(event.currentTarget);
      analyticsData.setCMSearchKeyword($item.data('suggestion'));
      analyticsData.setCMAutocompleteKeyword($item.data('keyword'));
      AutoCompleteView.prototype.saveAutocompleteString.apply(this, arguments);
    }
  });

  return BCOMAutoCompleteView;
});
