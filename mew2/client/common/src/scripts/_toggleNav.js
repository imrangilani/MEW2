define([
  'jquery',
  'backbone',
  'util/util',
  'analytics/analyticsTrigger',
  'util/crossBrowserHeight'
], function($, Backbone, util, analytics, crossBrowserHeight) {
  'use strict';

  var toggleNav = {
    toggle: function() {
      $('#mb-j-nav-button').toggleClass('icon-selectedMenuButton');
      $('#mb-j-nav-button').toggleClass('icon-unselectedMenuButton');
      $('body').toggleClass('nav-toggle');

      if ($('body').hasClass('nav-toggle')) {
        $('#mb-page-wrapper').css('overflow', 'hidden');
        $('#mb-page-content-container').height(crossBrowserHeight.height() - $('#mb-region-header').height());

        analytics.triggerTag({
          tagType: 'pageElementGNTag',
          elementCategory: 'Global Navigation Open'
        });
      } else {
        // Android doesn't like overflow being removed,
        // but it interferes with iOS sticky position
        if (util.hasPositionSticky()){
          $('#mb-page-wrapper').css('overflow', '');
        } else {
          $('#mb-page-wrapper').css('overflow', 'inherit');
        }

        $('#mb-page-content-container').height('');

        analytics.triggerTag({
          tagType: 'pageElementGNTag',
          elementCategory: 'Global Navigation Close'
        });
      }
    }
  };

  $(function() {
    $('#mb-page-content-container').on('touchstart click', function() {

      // If the nav is showing, hide it.
      if ($('body').hasClass('nav-toggle')) {
        toggleNav.toggle();

        // Prevent normal click
        return false;
      }
    });
  });

  /**
   * Sets the height of the content overlay to run past the bottom of the window
   * @TODO this should somehow be integrated with MaskView, which isn't currently being used to its potential
   */
  Backbone.on('afterRender', function() {
    $('#mb-content-overlay').height(crossBrowserHeight.height());
  });

  return toggleNav;
});
