define([
  'util/util',
  'util/orientation'
], function(util, orientation) {
  'use strict';

  // Record initial height so that on Android an exposed keyboard will not generate an incorrect height
  var cachedHeight = window.innerHeight;

  orientation.on('orientationchange', function() {
    cachedHeight = window.innerHeight;
  });

  return {
    // Function used to normalize height between different browsers/OS
    height: function() {
      return util.isAndroid() ? cachedHeight : window.innerHeight;
    },
    // Programatically update the cachedHeight, used when a known change in browser chrome height occurs
    // ie. window.scrollTo(0, 0)
    updateHeight: function() {
      cachedHeight = window.innerHeight;
    }
  };
});
