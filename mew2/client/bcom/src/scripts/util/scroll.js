define([
  'backbone',
  'jquery',
  'underscore',

  // Util
  'util/orientation',
  'util/crossBrowserHeight'
], function(Backbone, $, _, orientation, crossBrowserHeight) {
  var isEnabled = true;
  var scrollTop = 0;

  var ScrollHandler = function() {
    this.initialize();
  };

  _.extend(ScrollHandler.prototype, Backbone.Events, {
    initialize: function() {
      this.listenTo(orientation, 'orientationchange', function() {
        if (!isEnabled) {
          // Call the method again to update the page size
          this.disable();
        }
      }.bind(this));
    },
    enable: function() {
      $('#mb-page-content-container').height('');
      $('#mb-page-wrapper').css('overflow-y', '');

      if (!isEnabled) {
        $('body').scrollTop(scrollTop);
      }

      isEnabled = true;
    },
    disable: function() {
      if (isEnabled) {
        scrollTop = $('body').scrollTop();
      }

      $('#mb-page-content-container').height(crossBrowserHeight.height() - $('#mb-region-header').height());
      $('#mb-page-wrapper').css('overflow', 'hidden').scrollTop(scrollTop);

      isEnabled = false;
    }
  });

  // Return a single instance of the scroll handler
  return new ScrollHandler();
});
