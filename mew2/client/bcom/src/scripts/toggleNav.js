define([
  'jquery',
  'backbone',
  'util/util',
  'analytics/analyticsTrigger',
  'util/crossBrowserHeight'
], function($, Backbone, util, analytics, crossBrowserHeight) {
  'use strict';

  var toggleNav = {
    positionTop: 0,

    toggle: function() {
      $('#mb-j-nav-button-icon').toggleClass('icon-selectedMenuButton');
      $('#mb-j-nav-button-icon').toggleClass('icon-unselectedMenuButton');
      $('body').toggleClass('nav-toggle');

      if ($('body').hasClass('nav-toggle')) {
        this.positionTop = $('#mb-page-wrapper').hasClass('b-sticky-header') ? $('body').scrollTop() : 0;
        $('#mb-j-nav-container').height(crossBrowserHeight.height() - $('#mb-region-header').height());
        $('#mb-page-content-container').height(crossBrowserHeight.height() - $('#mb-region-header').height());
        $('#mb-page-wrapper').css('overflow', 'hidden').scrollTop(this.positionTop);

        // If any render is done when nav is opened we reset positionTop to not scroll to previous position
        var view = this;
        Backbone.once('renderCompleted', function() {
          view.positionTop = 0;
        });

      } else {
        $('#mb-page-content-container').height('');
        $('#mb-page-wrapper').css('overflow-y', '');
        $('body').scrollTop(this.positionTop);
      }
    },

    getPointerEvent: function(event) {
      return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
    }
  };

  $(function() {
    $('#mb-content-overlay').on('touchmove click', function() {

      // If the nav is showing, hide it.
      if ($('body').hasClass('nav-toggle')) {
        toggleNav.toggle();

        // Prevent normal click
        return false;
      }
    });

    // Listener to prevent the header to scroll the page when the nav is showing
    $('#mb-region-header').on('touchmove', function(e) {
      if ($('body').hasClass('nav-toggle')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Listener to prevent page bouncing when scrolling the globalNav
    $('#mb-j-nav-container').on('touchstart', function(e) {
        var navMenu = $("#mb-j-nav-menu")[0];
        toggleNav.allowUp = (navMenu.scrollTop > 0);
        toggleNav.allowDown = (navMenu.scrollTop < navMenu.scrollHeight - navMenu.clientHeight);
        toggleNav.slideBeginY = toggleNav.getPointerEvent(e).pageY;
    });

    // Listener to prevent page bouncing when scrolling the globalNav
    $('#mb-j-nav-container').on('touchmove', function(e) {
        var pageY = toggleNav.getPointerEvent(e).pageY;
        var up = (pageY > toggleNav.slideBeginY);
        var down = (pageY < toggleNav.slideBeginY);
        toggleNav.slideBeginY = pageY;
        if ((up && toggleNav.allowUp) || (down && toggleNav.allowDown)) {
          e.stopPropagation();
        } else {
          e.preventDefault();
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
