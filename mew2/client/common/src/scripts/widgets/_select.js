/**
 * @file _select.js
 *
 * Allow a user to toggle a value in a form
 */

define([
  'widgets/widget'
], function(Widget) {
  'use strict';

  var Select = Widget.extend({
    template: TEMPLATE.selectWidget,
    className: 'mb-select-widget',

    // Every instance gets initialized with these options by default.
    // Can be overwritten when constructing
    options: {
      name: 'select'
    },

    events: {
      'change .mb-j-select': 'updateValueDisplay'
    },

    /**
     * When the select element's value changes, update the display
     * to show the new value in the UI
     */
    updateValueDisplay: function(e) {
      var $select = $(e.currentTarget);
      var $option = $select.find('option[value="' + $select.val() + '"]');
      var $widget = $select.closest('.mb-select-widget');

      var display = $option.text();
      if (display === 'SELECT') {
        display = '';
      }

      $widget.find('.mb-j-select-value-display').text(display);
    }
  });

  return Select;
});
