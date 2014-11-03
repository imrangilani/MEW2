/**
 * @file _toggleSelect.js
 *
 * Allow a user to toggle a value in a form
 */

define([
  'widgets/widget'
], function(Widget) {
  'use strict';

  var ToggleSelect = Widget.extend({
    template: TEMPLATE.toggleSelectWidget,
    className: 'mb-toggleselect-widget',

    // Every instance gets initialized with these options by default.
    // Can be overwritten when constructing
    options: {
      name: 'toggle-select'
    },

    events: {
      'click .mb-j-toggleselect-item:not(".active")': 'updateToggle'
    },

    updateToggle: function(e) {
      var $toggle = $(e.currentTarget);
      var $widget = $toggle.closest('.mb-toggleselect-widget');

      $widget.find('.mb-j-toggleselect-item').removeClass('active');
      $toggle.addClass('active');

      $widget.find('.mb-j-toggleselect-value').val($toggle.data('value'));
    }
  });

  return ToggleSelect;
});
