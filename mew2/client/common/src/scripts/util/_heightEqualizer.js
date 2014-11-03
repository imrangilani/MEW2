// Handles necessary height calculations

define([
  // Libraries
  'jquery',
  'backbone',
  'util/orientation',
  'util/crossBrowserHeight'
], function($, Backbone, orientation, crossBrowserHeight) {

  'use strict';

  Backbone.on('renderCompleted', equalize);
  orientation.on('orientationchange', equalize);

  function equalize() {

    // Allow the App Height to be recalculated before adjusting the nav/content height
    setTimeout(function() {
      var windowHeight = crossBrowserHeight.height();

      // Calculate the height of the main region, which contains the nav.
      // The height of the main region area is the height of the page without the header.
      var regionMainHeight = windowHeight - $('#mb-region-header').outerHeight();
      $('#mb-j-nav-container').height(regionMainHeight);
      if ($('body').hasClass('nav-toggle')) {
        $('#mb-page-content-container').height(regionMainHeight);
      }
    }, 0);
  }
});
