/**
 * @file _slider.js
 *
 * Allow a user to use a slider to select a value in a form
 */

define([
  'widgets/widget'
], function(Widget) {
  'use strict';

  var Slider = Widget.extend({
    template: TEMPLATE.sliderWidget,
    className: 'mb-slider-widget',

    // Every instance gets initialized with these options by default.
    // Can be overwritten when constructing
    options: {
      name: 'slider',
      minValue: 0,
      maxValue: 10,
      defaultValue: 5
    },

    events: {
      'touchstart .slider:not(".active")': 'setActive',
      'mousedown  .slider:not(".active")': 'setActive',
      'change     .slider': 'changeSlider'
    },

    setActive: function(e) {
      $(e.currentTarget).closest('.mb-slider-widget').addClass('active');
    },

    changeSlider: function() {
      if (this.options.onChange) {
        this.options.onChange.apply(this, arguments);
      }
    }
  });

  return Slider;
});
