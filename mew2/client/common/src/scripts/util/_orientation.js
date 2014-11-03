/**
 * @file orientation.js
 * Set up controller to handle device orientation
 *
 * @author Justin Helmer 8/7/2013
 */

define([
  'backbone',
  'jquery',
  'underscore',
  'util/util'
], function(Backbone, $, _, util) {

  'use strict';

  var _orientation;

  // Constructor function triggers the initialization routine
  var Orientation = function() {
    this._initialize();
  };

  // Extend backbone events so we can use .trigger() and .on()
  _.extend(Orientation.prototype, Backbone.Events, {

    getOrientation: function() {
      return _orientation;
    },

    _initialize: function() {
      var _this = this;
      _this._updateOrientation();

      // Android uses resize due to a bug in Android Browser where it reports
      // window.innerHeight incorrectly on orientation change
      var orientationEvent = (util.isAndroid()) ? ('resize') : ('orientationchange');

      $(window).on(orientationEvent, function() {
        _this._updateOrientation();
      });
    },

    _updateOrientation: function() {
      var previousOrientation = _orientation;

      if (!_.isUndefined(window.rotation)) {
        switch (window.rotation) {
        case 0:
        case 180:
          _orientation = 'portrait';
          break;
        case 90:
        case -90:
          _orientation = 'landscape';
          break;
        }
      } else {
        _orientation = (window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait';
      }

      // trigger orientationchange if the orientation is now different than it was before.
      // not triggered on initialize(), since the event cannot bound until after init
      if (_orientation !== previousOrientation) {
        $('body').removeClass('layout-' + previousOrientation);
        this.trigger('orientationchange');
      }
    }

  });

  // Return a single instance of the orientation handler
  return new Orientation();
});
